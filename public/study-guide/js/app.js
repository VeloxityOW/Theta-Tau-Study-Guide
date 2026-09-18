/*
  Theta Tau Study Guide — App Logic
  ---------------------------------
  This file handles rendering, study modes, localStorage progress, answer
  checking, animations, and navigation. Edit config.js for easy text/settings.
*/

(function () {
  "use strict";

  const config = window.THETA_CONFIG || {};
  const rawQuestions = window.THETA_QUESTIONS || [];
  const keys = config.storageKeys || {};

  const NAV_ITEMS = [
    { view: "dashboard", label: config.labels?.dashboard || "Dashboard", icon: "⌂" },
    { view: "study", label: config.labels?.study || "Study", icon: "✎" },
    { view: "flashcards", label: config.labels?.flashcards || "Flashcards", icon: "▣" },
    { view: "quiz", label: config.labels?.quiz || "Quiz", icon: "?" },
    { view: "review", label: config.labels?.review || "Review", icon: "★" },
    { view: "stats", label: config.labels?.stats || "Stats", icon: "↗" },
    { view: "staff", label: "Staff", icon: "◈" },
    { view: "members", label: "Members", icon: "♙" },
    { view: "class-settings", label: "Class Setup", icon: "⚙" }
  ];
  const STAFF_ONLY_VIEWS = new Set(["staff", "members", "class-settings"]);

  const QUIZ_BOUNDARIES = [
    { name: "Quiz 1", start: 0, end: 3, description: "Basics and current pledge-class material." },
    { name: "Quiz 2", start: 4, end: 37, description: "Symbols, founding, and coat of arms." },
    { name: "Quiz 3", start: 38, end: 58, description: "Chapter and grand executive councils." },
    { name: "Quiz 4", start: 59, end: 77, description: "Flag, regions, and southwest chapters." },
    { name: "Quiz 5", start: 78, end: 83, description: "Requirements, financials, and magazine." },
    { name: "Quiz 6", start: 84, end: Number.MAX_SAFE_INTEGER, description: "Badge, competitors, and significant dates." }
  ];

  const state = {
    currentView: "dashboard",
    filter: "All",
    search: "",
    hideMastered: false,
    shuffled: false,
    activeDeck: null,
    loginRole: localStorage.getItem("thetaStudy.loginRole") || "pnm",
    flashIndex: 0,
    quiz: null,
    gateAttempts: 0,
    visibleCount: Number(config.performance?.maxVisibleStudyCards || 32)
  };

  let progress = readJson(keys.progress, {});
  let quizHistory = readJson(keys.quizHistory, []);
  let savedSettings = readJson(keys.settings, {});
  state.hideMastered = !!savedSettings.hideMastered;

  const el = {
    gate: document.getElementById("gate"),
    gateCanvas: document.getElementById("gateCanvas"),
    gateSymbol: document.getElementById("gateSymbol"),
    gateTitle: document.getElementById("gateTitle"),
    gateSubtitle: document.getElementById("gateSubtitle"),
    passwordInput: document.getElementById("passwordInput"),
    unlockButton: document.getElementById("unlockButton"),
    gateMessage: document.getElementById("gateMessage"),
    app: document.getElementById("app"),
    navList: document.getElementById("navList"),
    mobileNav: document.getElementById("mobileNav"),
    brandTitle: document.getElementById("brandTitle"),
    brandSubtitle: document.getElementById("brandSubtitle"),
    viewEyebrow: document.getElementById("viewEyebrow"),
    viewTitle: document.getElementById("viewTitle"),
    view: document.getElementById("view"),
    shuffleButton: document.getElementById("shuffleButton"),
    resetButton: document.getElementById("resetButton"),
    progressBar: document.getElementById("progressBar"),
    progressFill: document.getElementById("progressFill"),
    statTotal: document.getElementById("statTotal"),
    statCorrect: document.getElementById("statCorrect"),
    statWrong: document.getElementById("statWrong"),
    statMastered: document.getElementById("statMastered"),
    sideProgress: document.getElementById("sideProgress"),
    sideEncouragement: document.getElementById("sideEncouragement"),
    toasts: document.getElementById("toasts"),
    confetti: document.getElementById("confetti")
  };

  const questions = rawQuestions.map((question, index) => enrichQuestion(question, index));
  const categories = ["All"].concat(unique(questions.map(q => q.category)));

  let gateAnimation = createGateAnimation(el.gateCanvas);

  init();

  function init() {
    hydrateText();
    applyPerformanceMode();
    renderNav();
    bindGlobalEvents();
    setLoginRole(state.loginRole);

    if (localStorage.getItem(keys.unlocked) === "true") unlock(false);
    else el.passwordInput?.focus();

    updateStats();
    render();
  }

  function hydrateText() {
    document.title = config.appTitle || "ΘΤ Study Guide";
    if (el.gateSymbol) el.gateSymbol.textContent = config.gate?.symbol || "ΘΤ";
    el.gateTitle.textContent = config.gate?.title || "Theta Tau";
    el.gateSubtitle.textContent = config.gate?.subtitle || "Psi Gamma — Study Guide";
    el.passwordInput.placeholder = config.gate?.inputPlaceholder || "Enter password…";
    el.unlockButton.textContent = config.gate?.buttonText || "Enter";
    el.brandTitle.textContent = config.appTitle || "ΘΤ Study Guide";
    el.brandSubtitle.textContent = config.chapterLine || "Psi Gamma";
  }

  function enrichQuestion(q, index) {
    const quizInfo = QUIZ_BOUNDARIES.find(item => index >= item.start && index <= item.end) || QUIZ_BOUNDARIES[QUIZ_BOUNDARIES.length - 1];
    return {
      ...q,
      index,
      quiz: q.quiz || quizInfo.name,
      quizDescription: quizInfo.description,
      category: q.cat || assignCategory(q),
      mode: q.mode || "exact"
    };
  }

  function assignCategory(q) {
    const id = q.id || "";
    if (id === "purpose" || id === "motto") return "Purpose & Motto";
    if (id === "alphabet") return "Alphabet";
    if (id === "Marshal" || id === "NMEs" || /^\d+PNM$/.test(id)) return "Members";
    if (["Flower", "Gem", "Colors"].includes(id)) return "Symbols";
    if (["Uni", "City", "State", "Date", "OGName", "Founders", "DeadOrAlive"].includes(id)) return "Founding";
    if (id.startsWith("CoatOfArms")) return "Coat of Arms";
    if (id.startsWith("ChapterExecutiveCouncil")) return "Chapter E-Council";
    if (id.startsWith("GrandExecutiveCouncil")) return "Grand E-Council";
    if (id.startsWith("Flag")) return "Flag";
    if (id.startsWith("Regions") || id.startsWith("RD")) return "Regions";
    if (id.startsWith("Chapters")) return "SW Chapters";
    if (id.startsWith("Financial") || id.startsWith("Requirement")) return "Requirements / Financial";
    if (id === "Other") return "General";
    if (id.startsWith("MemberBadge")) return "Member Badge";
    if (id.startsWith("CompetingFraternitiesSororities")) return "Competitors";
    if (id.startsWith("DeltaGammaSigDates")) return "Delta Gamma Dates";
    if (id.startsWith("ThetaTauSigDates")) return "Theta Tau Dates";
    return "Other";
  }

  function applyPerformanceMode() {
    const enabled = config.performance?.enabled !== false;
    document.body.classList.toggle("performance-mode", enabled);
  }

  function resetVisibleCount() {
    state.visibleCount = Number(config.performance?.maxVisibleStudyCards || 32);
  }

  function renderNav() {
    const visibleItems = state.loginRole === "staff"
      ? NAV_ITEMS
      : NAV_ITEMS.filter(item => !STAFF_ONLY_VIEWS.has(item.view));
    const html = visibleItems.map(item => navButtonHtml(item)).join("");
    el.navList.innerHTML = html;
    el.mobileNav.innerHTML = visibleItems.slice(0, 5).map(item => navButtonHtml(item)).join("");
  }

  function navButtonHtml(item) {
    return `
      <button class="nav-btn" data-view="${item.view}" type="button">
        <span class="nav-icon">${item.icon}</span>
        <span>${escapeHtml(item.label)}</span>
      </button>
    `;
  }

  function bindGlobalEvents() {
    document.addEventListener("click", event => {
      const nav = event.target.closest("[data-view]");
      if (nav) setView(nav.dataset.view);

      const action = event.target.closest("[data-action]");
      if (action) handleAction(action, event);
    });

    document.addEventListener("input", event => {
      if (event.target.matches("[data-search]")) {
        state.search = event.target.value;
        resetVisibleCount();
        renderCurrentList(state.currentView === "review");
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Enter" && event.target.matches(".answer-input")) {
        const card = event.target.closest(".study-card, .quiz-question-card");
        const id = card?.dataset.id;
        if (id) checkStudyAnswer(id, event.target.value, card);
      }
      if (event.key === " " && state.currentView === "flashcards" && !isTyping(event.target)) {
        event.preventDefault();
        flipFlashcard();
      }
      if (event.key === "ArrowRight" && state.currentView === "flashcards" && !isTyping(event.target)) nextFlashcard();
      if (event.key === "ArrowLeft" && state.currentView === "flashcards" && !isTyping(event.target)) previousFlashcard();
    });

    el.unlockButton.addEventListener("click", tryUnlock);
    el.passwordInput.addEventListener("keydown", event => {
      if (event.key === "Enter") tryUnlock();
    });

    el.shuffleButton.addEventListener("click", () => {
      state.shuffled = !state.shuffled;
      toast(state.shuffled ? "Shuffle on." : "Shuffle off.", "gold");
      render();
    });

    el.resetButton.addEventListener("click", resetProgress);
  }

  function handleAction(action, event) {
    const name = action.dataset.action;
    const id = action.dataset.id;

    if (name === "start-mode") {
      state.activeDeck = action.dataset.deck || null;
      setView(action.dataset.mode || "study");
    }
    if (name === "filter") {
      state.filter = action.dataset.filter || "All";
      resetVisibleCount();
      renderCurrentList(state.currentView === "review");
    }
    if (name === "toggle-hide") {
      state.hideMastered = !state.hideMastered;
      resetVisibleCount();
      saveSettings();
      renderCurrentList(state.currentView === "review");
    }
    if (name === "check" && id) {
      const card = action.closest(".study-card, .quiz-question-card");
      const input = card.querySelector(".answer-input");
      checkStudyAnswer(id, input.value, card);
    }
    if (name === "reveal") toggleReveal(action.closest(".study-card"));
    if (name === "star" && id) toggleMastered(id);
    if (name === "flash-flip") flipFlashcard();
    if (name === "flash-next") nextFlashcard();
    if (name === "flash-prev") previousFlashcard();
    if (name === "flash-mark") markFlashcard(action.dataset.result);
    if (name === "start-quiz") startQuiz();
    if (name === "quiz-submit") submitQuizAnswer();
    if (name === "quiz-next") nextQuizQuestion();
    if (name === "retry-missed") retryMissedQuiz();
    if (name === "clear-history") clearHistory();
    if (name === "load-more") {
      state.visibleCount += Number(config.performance?.loadMoreStep || 32);
      renderCurrentList(state.currentView === "review");
    }
    if (name === "demo-invite") toast("Invite flow will connect to email authentication at launch.", "gold");
    if (name === "demo-save") toast("This preview does not save shared class settings yet.", "gold");
    if (name === "login-tab") setLoginRole(action.dataset.role);
    if (name === "sign-out") signOut();

    event.preventDefault();
  }

  function setView(view) {
    if (state.loginRole !== "staff" && STAFF_ONLY_VIEWS.has(view)) {
      toast("Staff pages are available to Admin and NME accounts only.", "gold");
      view = "dashboard";
    }
    state.currentView = view;
    resetVisibleCount();
    state.search = "";
    if (view === "flashcards") state.flashIndex = 0;
    if (view !== "quiz") state.quiz = null;
    render();
  }

  function render() {
    updateActiveNav();
    updateStats();
    const label = NAV_ITEMS.find(item => item.view === state.currentView)?.label || "Dashboard";
    el.viewEyebrow.textContent = label;
    el.viewTitle.textContent = state.currentView === "dashboard" ? (config.appTitle || "ΘΤ Study Guide") : label;

    if (state.currentView === "dashboard") renderDashboard();
    if (state.currentView === "study") renderStudy();
    if (state.currentView === "flashcards") renderFlashcards();
    if (state.currentView === "quiz") renderQuizSetup();
    if (state.currentView === "review") renderReview();
    if (state.currentView === "stats") renderStats();
    if (state.currentView === "staff") renderStaffDashboard();
    if (state.currentView === "members") renderMembers();
    if (state.currentView === "class-settings") renderClassSettings();
  }

  function updateActiveNav() {
    document.querySelectorAll(".nav-btn").forEach(button => {
      button.classList.toggle("active", button.dataset.view === state.currentView);
    });
  }

  function renderDashboard() {
    const totals = computeTotals();
    const quizCards = QUIZ_BOUNDARIES.map(group => {
      const deck = questions.filter(q => q.quiz === group.name);
      const mastered = deck.filter(q => getProgress(q.id).mastered).length;
      const answered = deck.filter(q => getProgress(q.id).answered).length;
      const pct = deck.length ? Math.round((mastered / deck.length) * 100) : 0;
      return `
        <button class="quiz-card" type="button" data-action="start-mode" data-mode="study" data-deck="${group.name}">
          <strong>${group.name}</strong>
          <p>${group.description}</p>
          <div class="card-meta">
            <span class="badge">${deck.length} cards</span>
            <span class="badge ok">${answered} tried</span>
            <span class="badge gold">${mastered} mastered</span>
          </div>
          <div class="progress-pill"><span style="width:${pct}%"></span></div>
        </button>
      `;
    }).join("");

    el.view.innerHTML = `
      <section class="hero-card">
        <p class="eyebrow">Welcome back</p>
        <h2>Theta Tau Quiz Material</h2>
        <p>This version focuses on better review, smoother mobile use, and progress that feels like a game.</p>
        <div class="hero-actions">
          <button class="primary-btn" data-action="start-mode" data-mode="flashcards" type="button">Start Flashcards</button>
          <button class="secondary-btn" data-action="start-mode" data-mode="review" type="button">Review Weak Cards</button>
          <button class="ghost-btn" data-action="start-mode" data-mode="quiz" type="button">Take a Quiz</button>
        </div>
      </section>

      <section class="mode-grid">
        <button class="mode-card" data-action="start-mode" data-mode="study" type="button"><span>✎</span><strong>Study Mode</strong><p>Search, filter, reveal answers, and check cards one by one.</p></button>
        <button class="mode-card" data-action="start-mode" data-mode="flashcards" type="button"><span>▣</span><strong>Flashcards</strong><p>Tap to flip. Use arrows or buttons to move through cards.</p></button>
        <button class="mode-card" data-action="start-mode" data-mode="quiz" type="button"><span>?</span><strong>Quiz Mode</strong><p>Random test flow with score, missed cards, and retry.</p></button>
        <button class="mode-card" data-action="start-mode" data-mode="review" type="button"><span>★</span><strong>Cram Mode</strong><p>Only unanswered, wrong, or unmastered cards.</p></button>
        <button class="mode-card" data-action="start-mode" data-mode="stats" type="button"><span>↗</span><strong>Stats</strong><p>Track mastered cards, quiz history, and weak areas.</p></button>
        <button class="mode-card" data-action="start-mode" data-mode="study" data-deck="Quiz 6" type="button"><span>🔥</span><strong>Last-Minute Review</strong><p>Jump into later material quickly.</p></button>
      </section>

      <div class="grid-2">
        <section class="content-card" style="padding:18px;">
          <p class="eyebrow">Quiz Sets</p>
          <div class="quiz-grid">${quizCards}</div>
        </section>
        <section class="content-card" style="padding:18px;">
          <p class="eyebrow">Progress</p>
          <h2 style="margin:8px 0 4px;">${totals.mastered}/${totals.total} mastered</h2>
          <p style="color:var(--muted);line-height:1.6;">Correct answers count toward mastery. A card becomes mastered after ${config.study?.correctsToMaster || 3} correct attempts.</p>
          <div class="progress-pill"><span style="width:${totals.masteredPct}%"></span></div>
        </section>
      </div>
    `;
  }

  function renderStudy() {
    el.view.innerHTML = `
      ${controlsHtml("study")}
      <div id="listMount"></div>
    `;
    renderCurrentList(state.currentView === "review");
  }

  function renderReview() {
    state.activeDeck = null;
    el.view.innerHTML = `
      <section class="hero-card" style="margin-bottom:16px;">
        <p class="eyebrow">Cram Mode</p>
        <h2>Weak cards only.</h2>
        <p>This shows unanswered, wrong, and not-yet-mastered cards so you do not waste time on easy stuff.</p>
      </section>
      ${controlsHtml("review")}
      <div id="listMount"></div>
    `;
    renderCurrentList(true);
  }

  function controlsHtml(mode) {
    const decks = ["All"].concat(QUIZ_BOUNDARIES.map(q => q.name));
    return `
      <section class="control-panel">
        <div class="search-row">
          <input class="search-input" data-search type="search" placeholder="Search questions, answers, categories…" value="${escapeAttribute(state.search)}" />
          <select class="select-input" data-action="deck-select" onchange="window.thetaStudySetDeck && window.thetaStudySetDeck(this.value)">
            ${decks.map(deck => `<option value="${deck}" ${currentDeckName() === deck ? "selected" : ""}>${deck}</option>`).join("")}
          </select>
          <label class="toggle-line">
            <span>Hide mastered</span>
            <button class="toggle ${state.hideMastered ? "active" : ""}" data-action="toggle-hide" type="button" aria-label="Hide mastered"></button>
          </label>
        </div>
        <div class="chip-row">
          ${categories.map(cat => `<button class="chip ${state.filter === cat ? "active" : ""}" data-action="filter" data-filter="${escapeAttribute(cat)}" type="button">${escapeHtml(cat)}</button>`).join("")}
        </div>
        <span class="count-pill" id="countPill">0 cards</span>
      </section>
    `;
  }

  window.thetaStudySetDeck = function (value) {
    state.activeDeck = value === "All" ? null : value;
    resetVisibleCount();
    renderCurrentList(state.currentView === "review");
  };

  function currentDeckName() {
    return state.activeDeck || "All";
  }

  function renderCurrentList(reviewOnly = false) {
    const mount = document.getElementById("listMount");
    if (!mount) return;
    let deck = getDeck(reviewOnly);
    if (state.shuffled) deck = shuffle(deck.slice());
    const countPill = document.getElementById("countPill");
    if (countPill) countPill.textContent = `${deck.length} card${deck.length === 1 ? "" : "s"}`;

    if (!deck.length) {
      mount.innerHTML = `<div class="content-card empty-state"><h2>No cards here.</h2><p>Try clearing search, changing filters, or turning off hide mastered.</p></div>`;
      return;
    }

    const visibleDeck = deck.slice(0, state.visibleCount);
    const remaining = deck.length - visibleDeck.length;
    const nextBatch = Math.min(remaining, Number(config.performance?.loadMoreStep || 32));

    mount.innerHTML = `
      <section class="card-list">${visibleDeck.map(studyCardHtml).join("")}</section>
      ${remaining > 0 ? `
        <div class="load-more-wrap">
          <button class="secondary-btn" data-action="load-more" type="button">Load ${nextBatch} more</button>
          <span class="count-pill">Showing ${visibleDeck.length} of ${deck.length}</span>
        </div>
      ` : ""}
    `;
  }

  function getDeck(reviewOnly = false) {
    const search = normalizeLoose(state.search);
    return questions.filter(q => {
      const p = getProgress(q.id);
      if (state.activeDeck && q.quiz !== state.activeDeck) return false;
      if (reviewOnly && (p.mastered && p.correct && p.answered)) return false;
      if (state.filter !== "All" && q.category !== state.filter) return false;
      if (state.hideMastered && p.mastered) return false;
      if (search) {
        const haystack = normalizeLoose([q.q, q.a, q.category, q.quiz].join(" "));
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }

  function studyCardHtml(q) {
    const p = getProgress(q.id);
    const masteredClass = p.mastered ? " mastered" : "";
    const correctness = p.answered ? (p.correct ? " correct" : " wrong") : "";
    const status = p.mastered ? "Mastered" : p.answered ? (p.correct ? "Learning" : "Review") : "New";
    const statusClass = p.mastered ? "gold" : p.answered ? (p.correct ? "ok" : "bad") : "";
    return `
      <article class="study-card${masteredClass}${correctness}" data-id="${escapeAttribute(q.id)}">
        <div class="card-head">
          <div>
            <h2 class="card-title">${escapeHtml(q.q)}</h2>
            <div class="card-meta">
              <span class="badge">${escapeHtml(q.quiz)}</span>
              <span class="badge">${escapeHtml(q.category)}</span>
              <span class="badge ${statusClass}">${status}</span>
              <span class="badge">${p.correctCount || 0}/${config.study?.correctsToMaster || 3} correct</span>
            </div>
          </div>
          <button class="star-btn ${p.mastered ? "active" : ""}" data-action="star" data-id="${escapeAttribute(q.id)}" type="button" title="Toggle mastered">★</button>
        </div>
        <div class="answer-row">
          <input class="answer-input" type="text" placeholder="Type answer…" autocomplete="off" />
          <button class="primary-btn" data-action="check" data-id="${escapeAttribute(q.id)}" type="button">Check</button>
          <button class="mini-btn" data-action="reveal" type="button">Reveal</button>
        </div>
        <div class="reveal"><strong>Answer:</strong> ${escapeHtml(formatAnswer(q.a))}</div>
      </article>
    `;
  }

  function checkStudyAnswer(id, value, card) {
    const q = questions.find(item => item.id === id);
    if (!q || !card) return false;
    if (!value.trim()) {
      card.classList.remove("shake");
      void card.offsetWidth;
      card.classList.add("shake");
      toast(randomFrom(config.toastMessages?.empty) || "Type something first.", "gold");
      return false;
    }

    const ok = isCorrect(value, q);
    const input = card.querySelector(".answer-input");
    const reveal = card.querySelector(".reveal");
    input?.classList.toggle("ok", ok);
    input?.classList.toggle("bad", !ok);
    card.classList.toggle("correct", ok);
    card.classList.toggle("wrong", !ok);

    if (ok || config.study?.autoRevealWrongAnswers !== false) reveal?.classList.add("show");
    applyAnswerResult(q.id, ok);

    if (ok) toast(randomFrom(config.toastMessages?.correct) || "Correct.", "ok");
    else {
      card.classList.remove("shake");
      void card.offsetWidth;
      card.classList.add("shake");
      toast(randomFrom(config.toastMessages?.wrong) || "Not quite.", "bad");
    }

    updateStats();
    maybeConfetti();
    setTimeout(() => {
      const fresh = questions.find(item => item.id === id);
      const newCard = studyCardHtml(fresh);
      card.outerHTML = newCard;
    }, 550);
    return ok;
  }

  function applyAnswerResult(id, ok) {
    const p = getProgress(id);
    const correctCount = ok ? (p.correctCount || 0) + 1 : (p.correctCount || 0);
    const wrongCount = ok ? (p.wrongCount || 0) : (p.wrongCount || 0) + 1;
    const mastered = p.mastered || correctCount >= (config.study?.correctsToMaster || 3);
    progress[id] = {
      ...p,
      answered: true,
      correct: ok,
      correctCount,
      wrongCount,
      mastered,
      lastSeenAt: new Date().toISOString()
    };
    writeJson(keys.progress, progress);
    updateStats();
    if (mastered && !p.mastered) {
      toast(randomFrom(config.toastMessages?.mastered) || "Mastered.", "gold");
      confetti(80);
    }
  }

  function toggleReveal(card) {
    const reveal = card?.querySelector(".reveal");
    reveal?.classList.toggle("show");
  }

  function toggleMastered(id) {
    const p = getProgress(id);
    progress[id] = { ...p, mastered: !p.mastered, answered: true, lastSeenAt: new Date().toISOString() };
    writeJson(keys.progress, progress);
    render();
    toast(progress[id].mastered ? "Marked mastered." : "Mastery removed.", "gold");
  }

  function renderFlashcards() {
    const deck = getDeckForMode(false);
    if (!deck.length) {
      el.view.innerHTML = `<div class="content-card empty-state"><h2>No flashcards found.</h2><p>Try Study Mode and adjust filters.</p></div>`;
      return;
    }
    state.flashIndex = clamp(state.flashIndex, 0, deck.length - 1);
    const q = deck[state.flashIndex];
    const p = getProgress(q.id);
    const answerText = formatAnswer(q.a);
    const answerSizeClass = flashTextSizeClass(answerText);
    const questionSizeClass = flashTextSizeClass(q.q);
    el.view.innerHTML = `
      <section class="control-panel">
        <div class="search-row">
          <select class="select-input"  id="flashDeckSelect">
            ${["All"].concat(QUIZ_BOUNDARIES.map(g => g.name)).map(deckName => `<option value="${deckName}" ${currentDeckName() === deckName ? "selected" : ""}>${deckName}</option>`).join("")}
          </select>
          <button class="ghost-btn" data-action="flash-prev" type="button">Previous</button>
          <button class="ghost-btn" data-action="flash-next" type="button">Next</button>
        </div>
        <span class="count-pill">${state.flashIndex + 1} of ${deck.length} • Space flips • Arrow keys move</span>
      </section>
      <section class="flash-wrap">
        <div class="flash-stage">
          <button class="flash-card" data-action="flash-flip" data-id="${escapeAttribute(q.id)}" type="button">
            <div class="flash-inner">
              <div class="flash-face front">
                <div>
                  <p class="eyebrow">${escapeHtml(q.quiz)} • ${escapeHtml(q.category)}</p>
                  <h2 class="flash-question ${questionSizeClass}">${escapeHtml(q.q)}</h2>
                  <p>Tap or press Space to reveal.</p>
                </div>
              </div>
              <div class="flash-face back">
                <div>
                  <p class="eyebrow">Answer</p>
                  <h2 class="flash-answer ${answerSizeClass}">${escapeHtml(answerText)}</h2>
                </div>
              </div>
            </div>
          </button>
        </div>
        <div class="flash-controls">
          <button class="option-btn bad" data-action="flash-mark" data-result="wrong" type="button">Missed it</button>
          <button class="option-btn" data-action="flash-flip" type="button">Flip</button>
          <button class="option-btn ok" data-action="flash-mark" data-result="correct" type="button">Got it</button>
          <button class="star-btn ${p.mastered ? "active" : ""}" data-action="star" data-id="${escapeAttribute(q.id)}" type="button">★</button>
        </div>
      </section>
    `;
    const select = document.getElementById("flashDeckSelect");
    if (select) select.onchange = () => { state.activeDeck = select.value === "All" ? null : select.value; state.flashIndex = 0; renderFlashcards(); };
  }

  function getDeckForMode(reviewOnly) {
    let deck = questions.filter(q => {
      const p = getProgress(q.id);
      if (state.activeDeck && q.quiz !== state.activeDeck) return false;
      if (reviewOnly && p.mastered) return false;
      if (state.hideMastered && p.mastered) return false;
      return true;
    });
    if (state.shuffled) deck = shuffle(deck.slice());
    return deck;
  }

  function flipFlashcard() {
    document.querySelector(".flash-card")?.classList.toggle("flipped");
  }

  function nextFlashcard() {
    const deck = getDeckForMode(false);
    if (!deck.length) return;
    state.flashIndex = (state.flashIndex + 1) % deck.length;
    renderFlashcards();
  }

  function previousFlashcard() {
    const deck = getDeckForMode(false);
    if (!deck.length) return;
    state.flashIndex = (state.flashIndex - 1 + deck.length) % deck.length;
    renderFlashcards();
  }

  function markFlashcard(result) {
    const deck = getDeckForMode(false);
    const q = deck[state.flashIndex];
    if (!q) return;
    applyAnswerResult(q.id, result === "correct");
    nextFlashcard();
  }

  function renderQuizSetup() {
    if (state.quiz?.active) {
      renderQuizQuestion();
      return;
    }
    const deckOptions = ["All"].concat(QUIZ_BOUNDARIES.map(q => q.name));
    const sizeOptions = config.study?.quizSizeOptions || [10, 20, "All"];
    el.view.innerHTML = `
      <section class="hero-card">
        <p class="eyebrow">Quiz Mode</p>
        <h2>Random test run.</h2>
        <p>Choose a deck and size. You will get a score screen, missed cards, and a retry button at the end.</p>
      </section>
      <section class="content-card" style="padding:18px;margin-top:16px;">
        <div class="search-row">
          <select id="quizDeck" class="select-input">${deckOptions.map(deck => `<option value="${deck}">${deck}</option>`).join("")}</select>
          <select id="quizSize" class="select-input">${sizeOptions.map(size => `<option value="${size}">${size} cards</option>`).join("")}</select>
          <button class="primary-btn" data-action="start-quiz" type="button">Start Quiz</button>
        </div>
      </section>
    `;
    const size = document.getElementById("quizSize");
    if (size) size.value = String(config.study?.defaultQuizSize || 20);
  }

  function startQuiz() {
    const deckName = document.getElementById("quizDeck")?.value || "All";
    const sizeValue = document.getElementById("quizSize")?.value || "20";
    let deck = questions.filter(q => deckName === "All" || q.quiz === deckName);
    deck = shuffle(deck.slice());
    const count = sizeValue === "All" ? deck.length : Math.min(Number(sizeValue), deck.length);
    deck = deck.slice(0, count);
    state.quiz = { active: true, index: 0, deck, answers: [], completed: false };
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const quiz = state.quiz;
    if (!quiz || !quiz.active) return renderQuizSetup();
    if (quiz.completed) return renderQuizResults();
    const q = quiz.deck[quiz.index];
    if (!q) return finishQuiz();
    const previous = quiz.answers[quiz.index];
    el.view.innerHTML = `
      <section class="quiz-layout">
        <div class="content-card quiz-question-card" data-id="${escapeAttribute(q.id)}">
          <p class="eyebrow">Question ${quiz.index + 1} of ${quiz.deck.length} • ${escapeHtml(q.quiz)}</p>
          <h2>${escapeHtml(q.q)}</h2>
          <input class="answer-input" id="quizAnswer" type="text" placeholder="Type answer…" autocomplete="off" value="${escapeAttribute(previous?.userAnswer || "")}" />
          <div class="reveal ${previous ? "show" : ""}"><strong>Answer:</strong> ${escapeHtml(formatAnswer(q.a))}</div>
          <div class="quiz-footer">
            <span class="count-pill">${previous ? (previous.correct ? "Correct" : "Not quite") : "Answer first, then submit."}</span>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button class="ghost-btn" data-action="quiz-next" type="button">Skip / Next</button>
              <button class="primary-btn" data-action="quiz-submit" type="button">Submit</button>
            </div>
          </div>
        </div>
      </section>
    `;
    document.getElementById("quizAnswer")?.focus();
  }

  function submitQuizAnswer() {
    const quiz = state.quiz;
    const q = quiz?.deck[quiz.index];
    if (!q) return;
    const input = document.getElementById("quizAnswer");
    const userAnswer = input?.value || "";
    if (!userAnswer.trim()) {
      toast(randomFrom(config.toastMessages?.empty) || "Type something first.", "gold");
      return;
    }
    const correct = isCorrect(userAnswer, q);
    quiz.answers[quiz.index] = { id: q.id, userAnswer, correct };
    applyAnswerResult(q.id, correct);
    if (correct) toast(randomFrom(config.toastMessages?.correct) || "Correct.", "ok");
    else toast(randomFrom(config.toastMessages?.wrong) || "Not quite.", "bad");
    if (correct) maybeConfetti();
    nextQuizQuestion();
  }

  function nextQuizQuestion() {
    if (!state.quiz) return;
    if (state.quiz.index >= state.quiz.deck.length - 1) finishQuiz();
    else {
      state.quiz.index += 1;
      renderQuizQuestion();
    }
  }

  function finishQuiz() {
    if (!state.quiz) return;
    state.quiz.completed = true;
    state.quiz.active = false;
    const total = state.quiz.deck.length;
    const correct = state.quiz.answers.filter(a => a?.correct).length;
    quizHistory.unshift({ total, correct, date: new Date().toISOString(), deck: state.quiz.deck[0]?.quiz || "Mixed" });
    quizHistory = quizHistory.slice(0, 20);
    writeJson(keys.quizHistory, quizHistory);
    renderQuizResults();
  }

  function renderQuizResults() {
    const quiz = state.quiz;
    if (!quiz) return renderQuizSetup();
    const total = quiz.deck.length;
    const correct = quiz.answers.filter(a => a?.correct).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const missed = quiz.deck.filter((q, index) => !quiz.answers[index]?.correct);
    el.view.innerHTML = `
      <section class="hero-card quiz-results">
        <p class="eyebrow">Results</p>
        <p class="result-score">${correct}/${total}</p>
        <h2>${pct}% score</h2>
        <div class="hero-actions">
          <button class="primary-btn" data-action="start-quiz" type="button">New Quiz</button>
          ${missed.length ? `<button class="secondary-btn" data-action="retry-missed" type="button">Retry Missed</button>` : ""}
          <button class="ghost-btn" data-view="dashboard" type="button">Dashboard</button>
        </div>
      </section>
      <section class="content-card" style="padding:18px;margin-top:16px;">
        <p class="eyebrow">Missed Cards</p>
        ${missed.length ? `<div class="missed-list">${missed.map(q => `<div class="missed-item"><strong>${escapeHtml(q.q)}</strong><span>${escapeHtml(formatAnswer(q.a))}</span></div>`).join("")}</div>` : `<div class="empty-state"><h2>Perfect run.</h2><p>No missed cards. Full-send behavior.</p></div>`}
      </section>
    `;
    updateStats();
    if (pct === 100) confetti(160);
  }

  function retryMissedQuiz() {
    const missed = state.quiz.deck.filter((q, index) => !state.quiz.answers[index]?.correct);
    state.quiz = { active: true, index: 0, deck: missed, answers: [], completed: false };
    renderQuizQuestion();
  }

  function renderStats() {
    const totals = computeTotals();
    const categoryRows = categories.filter(c => c !== "All").map(cat => {
      const deck = questions.filter(q => q.category === cat);
      const mastered = deck.filter(q => getProgress(q.id).mastered).length;
      const pct = deck.length ? Math.round(mastered / deck.length * 100) : 0;
      return `<div class="history-row"><strong>${escapeHtml(cat)}</strong><div class="progress-pill"><span style="width:${pct}%"></span></div><span>${mastered}/${deck.length}</span></div>`;
    }).join("");

    const historyRows = quizHistory.length ? quizHistory.map(item => {
      const date = new Date(item.date).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
      const pct = item.total ? Math.round(item.correct / item.total * 100) : 0;
      return `<div class="history-row"><strong>${pct}%</strong><span>${item.correct}/${item.total} • ${escapeHtml(item.deck || "Mixed")}</span><small>${date}</small></div>`;
    }).join("") : `<div class="empty-state"><h2>No quiz history yet.</h2><p>Take a quiz and your score will appear here.</p></div>`;

    el.view.innerHTML = `
      <section class="hero-card">
        <p class="eyebrow">Stats</p>
        <h2>${totals.masteredPct}% mastered</h2>
        <p>${totals.mastered}/${totals.total} cards mastered, ${totals.correct} recently correct, and ${totals.wrong} currently marked for review.</p>
      </section>
      <div class="grid-2">
        <section class="content-card" style="padding:18px;">
          <p class="eyebrow">By Category</p>
          <div class="stats-list" style="margin-top:12px;">${categoryRows}</div>
        </section>
        <section class="content-card" style="padding:18px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <p class="eyebrow">Quiz History</p>
            <button class="mini-btn" data-action="clear-history" type="button">Clear</button>
          </div>
          <div class="stats-list" style="margin-top:12px;">${historyRows}</div>
        </section>
      </div>
    `;
  }

  function renderStaffDashboard() {
    el.view.innerHTML = `
      <section class="hero-card staff-hero">
        <div><p class="eyebrow">Staff dashboard</p><h2>Pledge-class overview</h2><p>See readiness at a glance, then reach out before quiz day.</p></div>
        <button class="primary-btn" data-view="members" type="button">View members</button>
      </section>
      <section class="staff-metrics">
        <article class="staff-metric"><span>18</span><small>Active PNMs</small></article>
        <article class="staff-metric"><span>83%</span><small>Class mastery</small></article>
        <article class="staff-metric"><span>4</span><small>Need follow-up</small></article>
        <article class="staff-metric"><span>2</span><small>Quizzes due</small></article>
      </section>
      <section class="content-card staff-table-card"><div class="section-heading"><div><p class="eyebrow">Needs attention</p><h2>Check in this week</h2></div><button class="mini-btn" data-view="members" type="button">See all</button></div>
        <div class="member-table"><div class="table-head"><span>Member</span><span>Mastery</span><span>Latest quiz</span><span>Status</span></div>
          ${[["Alex Morgan","62%","70%","Review Quiz 3"],["Jordan Lee","71%","80%","2 weak topics"],["Sam Patel","74%","—","Quiz not started"],["Casey Rivera","78%","75%","Review Quiz 2"]].map(row => `<div class="table-row"><strong>${row[0]}</strong><span>${row[1]}</span><span>${row[2]}</span><span class="status-pill warn">${row[3]}</span></div>`).join("")}
        </div>
      </section>`;
  }

  function renderMembers() {
    el.view.innerHTML = `
      <section class="hero-card staff-hero"><div><p class="eyebrow">Member access</p><h2>Pledge-class roster</h2><p>Invite PNMs and designate NME staff. Access controls will be enforced when authentication is connected.</p></div><button class="primary-btn" type="button" data-action="demo-invite">Invite member</button></section>
      <section class="content-card staff-table-card"><div class="member-toolbar"><input class="answer-input" placeholder="Search members…" aria-label="Search members" /><select class="select-input"><option>All roles</option><option>PNMs</option><option>NMEs</option><option>Admins</option></select></div>
      <div class="member-table"><div class="table-head"><span>Member</span><span>Role</span><span>Email</span><span>Access</span></div>
      ${[["You","Admin","you@bhanu.cc","Full access"],["NME Example","NME","nme@example.com","Class statistics"],["PNM Example","PNM","pnm@example.com","Own progress"]].map(row => `<div class="table-row"><strong>${row[0]}</strong><span class="role-pill">${row[1]}</span><span>${row[2]}</span><span>${row[3]}</span></div>`).join("")}</div></section>`;
  }

  function renderClassSettings() {
    el.view.innerHTML = `
      <section class="hero-card"><p class="eyebrow">Class setup</p><h2>Prepare the next pledge class</h2><p>These are the fields that will feed the study guide and invitations.</p></section>
      <section class="settings-grid"><article class="content-card settings-card"><p class="eyebrow">Class information</p><label>Class name<input class="answer-input" value="${escapeAttribute(config.pledgeClass?.name || "Next Pledge Class")}" /></label><label>Term<input class="answer-input" placeholder="e.g. Fall 2026" /></label><button class="primary-btn" data-action="demo-save" type="button">Save changes</button></article>
      <article class="content-card settings-card"><p class="eyebrow">Study access</p><h2>Email-only sign in</h2><p>PNMs will receive a secure email link. Returning visitors stay signed in with a secure session cookie.</p><span class="status-pill ok">Planned for launch</span></article>
      <article class="content-card settings-card"><p class="eyebrow">Question content</p><h2>Roster-driven Quiz 1</h2><p>Add the marshal, NME committee, and PNM roster in <code>js/config.js</code> for now. This page will become the live editor after the database is connected.</p></article></section>`;
  }

  function clearHistory() {
    quizHistory = [];
    writeJson(keys.quizHistory, quizHistory);
    renderStats();
  }

  function tryUnlock() {
    const typed = el.passwordInput.value;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typed)) {
      localStorage.setItem(keys.unlocked, "true");
      localStorage.setItem("thetaStudy.loginRole", state.loginRole);
      localStorage.setItem("thetaStudy.loginEmail", typed);
      unlock(true);
      return;
    }
    state.gateAttempts += 1;
    el.gateMessage.textContent = "Enter a valid email address to preview the portal.";
    el.gate.querySelector(".gate-card")?.classList.remove("shake");
    void el.gate.offsetWidth;
    el.gate.querySelector(".gate-card")?.classList.add("shake");
  }

  function unlock(showToast) {
    renderNav();
    if (state.loginRole !== "staff" && STAFF_ONLY_VIEWS.has(state.currentView)) state.currentView = "dashboard";
    el.gate.classList.add("hidden");
    el.app.classList.remove("hidden");
    el.progressBar.classList.remove("hidden");
    gateAnimation.stop();
    if (showToast) {
      toast("Welcome to the portal preview.", "gold");
      confetti(90);
    }
  }

  function setLoginRole(role) {
    state.loginRole = role === "staff" ? "staff" : "pnm";
    document.querySelectorAll(".login-tab").forEach(button => {
      const active = button.dataset.role === state.loginRole;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    const note = document.getElementById("loginRoleNote");
    if (note) note.textContent = state.loginRole === "staff"
      ? "Sign in with your approved Admin or NME email to access class insights."
      : "Sign in to continue your pledge-class study guide.";
  }

  function signOut() {
    localStorage.removeItem(keys.unlocked);
    localStorage.removeItem("thetaStudy.loginEmail");
    el.app.classList.add("hidden");
    el.progressBar.classList.add("hidden");
    el.gate.classList.remove("hidden");
    el.passwordInput.value = "";
    el.gateMessage.textContent = "You have signed out. Choose an account type to sign in again.";
    setLoginRole(state.loginRole);
    el.passwordInput.focus();
  }

  function resetProgress() {
    const ok = window.confirm("Reset all progress, mastery, and quiz history on this browser?");
    if (!ok) return;
    progress = {};
    quizHistory = [];
    localStorage.removeItem(keys.progress);
    localStorage.removeItem(keys.quizHistory);
    updateStats();
    render();
    toast("Progress reset.", "gold");
  }

  function updateStats() {
    const totals = computeTotals();
    el.statTotal.textContent = totals.total;
    el.statCorrect.textContent = totals.correct;
    el.statWrong.textContent = totals.wrong;
    el.statMastered.textContent = totals.mastered;
    el.progressFill.style.width = `${totals.masteredPct}%`;
    el.sideProgress.textContent = `${totals.masteredPct}% mastered`;
    el.sideEncouragement.textContent = totals.masteredPct >= 100 ? "All cards mastered. Go outside." : totals.wrong ? "Review weak cards to clean up mistakes." : "Start with flashcards or quiz mode.";
  }

  function computeTotals() {
    const total = questions.length;
    let correct = 0;
    let wrong = 0;
    let mastered = 0;
    questions.forEach(q => {
      const p = getProgress(q.id);
      if (p.correct) correct += 1;
      if (p.answered && !p.correct) wrong += 1;
      if (p.mastered) mastered += 1;
    });
    return { total, correct, wrong, mastered, masteredPct: total ? Math.round((mastered / total) * 100) : 0 };
  }

  function getProgress(id) {
    return progress[id] || { answered: false, correct: false, mastered: false, correctCount: 0, wrongCount: 0 };
  }

  function saveSettings() {
    savedSettings.hideMastered = state.hideMastered;
    writeJson(keys.settings, savedSettings);
  }

  function isCorrect(userInput, q) {
    const mode = String(q.mode || "exact").toLowerCase();
    const answer = q.a || "";
    if (!userInput || !userInput.trim()) return false;

    if (Array.isArray(answer)) {
      return answer.some(option => compareByMode(userInput, option, "exact") || compareByMode(userInput, option, "contains"));
    }

    if (mode === "multi") {
      return String(answer).split("|").some(option => compareByMode(userInput, option, "exact"));
    }
    return compareByMode(userInput, answer, mode);
  }

  function compareByMode(userInput, answer, mode) {
    const uLoose = normalizeLoose(userInput);
    const aLoose = normalizeLoose(answer);
    if (!uLoose || !aLoose) return false;

    if (mode === "contains") {
      const parts = aLoose.split(",").map(p => p.trim()).filter(Boolean);
      const allPartsIncluded = parts.length > 1 && parts.every(part => uLoose.includes(part));
      return allPartsIncluded || uLoose.includes(aLoose) || fuzzyMatch(uLoose, aLoose);
    }

    return normalizeStrict(userInput) === normalizeStrict(answer) || uLoose === aLoose || fuzzyMatch(uLoose, aLoose);
  }

  function fuzzyMatch(user, answer) {
    if (!config.study?.enableFuzzyMatching) return false;
    if (Math.abs(user.length - answer.length) > (config.study?.fuzzyDistanceLimit || 2)) return false;
    if (answer.length < 5) return false;
    return levenshtein(user, answer) <= (config.study?.fuzzyDistanceLimit || 2);
  }

  function normalizeLoose(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[“”"']/g, "")
      .replace(/[—–]/g, "-")
      .replace(/[^a-z0-9\s\-,]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeStrict(value) {
    return String(value || "")
      .replace(/[“”"']/g, "")
      .replace(/[—–]/g, "-")
      .replace(/[^a-zA-Z0-9\s\-,]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function levenshtein(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
    return matrix[b.length][a.length];
  }

  function formatAnswer(answer) {
    return Array.isArray(answer) ? answer.join(" / ") : String(answer).replace(/\s*\|\s*/g, " / ");
  }

  function flashTextSizeClass(value) {
    const length = String(value || "").length;
    if (length > 180) return "is-very-long";
    if (length > 105) return "is-long";
    return "";
  }

  function maybeConfetti() {
    const totals = computeTotals();
    const step = config.study?.confettiEveryCorrectMilestone || 10;
    if (totals.correct === 1 || (step && totals.correct % step === 0)) confetti(60);
  }

  function toast(message, type = "") {
    const node = document.createElement("div");
    node.className = `toast ${type}`;
    node.textContent = message;
    el.toasts.appendChild(node);
    setTimeout(() => node.remove(), 2600);
  }

  function confetti(amount = 70) {
    amount = Math.min(amount, Number(config.performance?.maxConfettiPieces || amount));
    const canvas = el.confetti;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, Number(config.performance?.gatePixelRatio || 1.5));
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const pieces = Array.from({ length: amount }, () => ({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.22,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -6 - 2,
      size: Math.random() * 6 + 4,
      life: Math.random() * 50 + 45,
      color: Math.random() > 0.5 ? "#d6b25e" : "#e24555"
    }));
    let frame = 0;
    function tick() {
      frame += 1;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      pieces.forEach(piece => {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.vy += 0.18;
        piece.life -= 1;
        ctx.globalAlpha = Math.max(piece.life / 80, 0);
        ctx.fillStyle = piece.color;
        ctx.fillRect(piece.x, piece.y, piece.size, piece.size * 0.6);
      });
      if (frame < 95) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    tick();
  }

  function createGateAnimation(canvas) {
    if (!canvas) return { stop() {} };

    const ctx = canvas.getContext("2d");
    let running = true;
    let animationId = null;
    let frame = 0;
    let particles = [];
    let rings = [];
    let streaks = [];
    let lastDraw = 0;
    const targetFrameMs = 1000 / Number(config.performance?.gateFps || 60);
    const maxParticles = Number(config.performance?.maxGateParticles || 120);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, Number(config.performance?.gatePixelRatio || 1.35));
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnEmber() {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 10,
        r: 1 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(0.4 + Math.random() * 1.2),
        life: 1,
        decay: 0.002 + Math.random() * 0.004,
        color: Math.random() > 0.4 ? "gold" : "red"
      });
    }

    function spawnRing() {
      rings.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
        y: window.innerHeight / 2 + (Math.random() - 0.5) * 60,
        r: 10,
        maxR: 150 + Math.random() * 200,
        life: 1,
        decay: 0.004 + Math.random() * 0.003,
        color: Math.random() > 0.5 ? "gold" : "red"
      });
    }

    function spawnStreak() {
      const fromLeft = Math.random() > 0.5;
      streaks.push({
        x: fromLeft ? -50 : window.innerWidth + 50,
        y: Math.random() * window.innerHeight,
        len: 80 + Math.random() * 160,
        speed: (fromLeft ? 1 : -1) * (0.3 + Math.random() * 0.8),
        angle: fromLeft ? -0.2 + Math.random() * 0.4 : Math.PI + (-0.2 + Math.random() * 0.4),
        life: 1,
        decay: 0.003 + Math.random() * 0.003,
        width: 0.5 + Math.random() * 1.5
      });
    }

    function draw(timestamp) {
      if (!running) return;
      if (timestamp && timestamp - lastDraw < targetFrameMs) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      lastDraw = timestamp || performance.now();
      frame += 1;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (frame % Number(config.performance?.gateEmberEveryFrames || 3) === 0) spawnEmber();
      if (frame % Number(config.performance?.gateRingEveryFrames || 90) === 0) spawnRing();
      if (frame % Number(config.performance?.gateStreakEveryFrames || 50) === 0) spawnStreak();
      if (particles.length > maxParticles) particles.splice(0, particles.length - maxParticles);
      if (rings.length > 5) rings.splice(0, rings.length - 5);
      if (streaks.length > 8) streaks.splice(0, streaks.length - 8);

      const goldRGB = "214,178,94";
      const redRGB = "178,31,45";

      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        p.x += p.vx + Math.sin(frame * 0.02 + p.x * 0.01) * 0.3;
        p.y += p.vy;
        p.life -= p.decay;
        const rgb = p.color === "gold" ? goldRGB : redRGB;
        const alpha = Math.max(0, p.life * 0.7);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${alpha * 0.15})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.r * p.life), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        ctx.fill();
      });

      rings = rings.filter(r => r.life > 0);
      rings.forEach(ring => {
        ring.r += (ring.maxR - ring.r) * 0.015;
        ring.life -= ring.decay;
        const rgb = ring.color === "gold" ? goldRGB : redRGB;
        const alpha = Math.max(0, ring.life * 0.3);
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, Math.max(1, ring.r), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb},${alpha})`;
        ctx.lineWidth = 1.5 * ring.life;
        ctx.stroke();
      });

      streaks = streaks.filter(s => s.life > 0);
      streaks.forEach(s => {
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.life -= s.decay;
        const alpha = Math.max(0, s.life * 0.25);
        const ex = s.x + Math.cos(s.angle) * s.len;
        const ey = s.y + Math.sin(s.angle) * s.len;
        const grad = ctx.createLinearGradient(s.x, s.y, ex, ey);
        grad.addColorStop(0, "rgba(214,178,94,0)");
        grad.addColorStop(0.5, `rgba(214,178,94,${alpha})`);
        grad.addColorStop(1, "rgba(214,178,94,0)");
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.stroke();
      });

      animationId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();

    return {
      stop() {
        running = false;
        if (animationId) cancelAnimationFrame(animationId);
        window.removeEventListener("resize", resize);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function unique(values) {
    return values.filter((value, index, arr) => arr.indexOf(value) === index);
  }

  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function randomFrom(items) {
    if (!items || !items.length) return "";
    return items[Math.floor(Math.random() * items.length)];
  }

  function isTyping(target) {
    return ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }
})();
