/*
  Theta Tau Study Guide — App Settings
  -----------------------------------
  Edit this file for text, theme labels, password vibe, study settings,
  and funny messages. Nothing here is meant to be real security.
*/

window.THETA_CONFIG = {
  appTitle: "ΘΤ Study Guide",
  chapterLine: "Pledge Class — Preparation Material",
  // Update this section for each incoming pledge class. These are the only
  // class-roster values used by the study guide.
  pledgeClass: {
    name: "Next Pledge Class",
    marshal: "",
    nmes: [],
    pnms: []
  },
  gate: {
    title: "Theta Tau",
    subtitle: "Pledge Class — Study Guide",
    symbol: "ΘΤ",
    inputPlaceholder: "name@example.com",
    buttonText: "Continue",

    // Login gate only. This is client-side and easy to edit.
    password: "ChangeMeBeforeLaunch",

    wrongMessages: [
      "Nice try.",
      "Incorrect. Guess better.",
      "Close maybe. Correct? definitely not."
    ],
    hints: [
      { afterAttempts: 3, text: "Hint: It has something to do with the class." },
      { afterAttempts: 6, text: "Bigger hint: no spaces. Capital P, Capital G." }
    ]
  },

  study: {
    correctsToMaster: 3,
    defaultQuizSize: 20,
    quizSizeOptions: [10, 20, 30, "All"],
    enableFuzzyMatching: true,
    fuzzyDistanceLimit: 2,
    autoRevealWrongAnswers: false,
    confettiEveryCorrectMilestone: 10
  },

  // Performance mode keeps the same look, but removes the most expensive
  // effects and renders large study lists in chunks. Turn enabled to false
  // if you want every animation/effect back.
  performance: {
    enabled: true,
    maxVisibleStudyCards: 32,
    loadMoreStep: 32,
    gateFps: 60,
    gatePixelRatio: 1.35,
    gateEmberEveryFrames: 6,
    gateRingEveryFrames: 150,
    gateStreakEveryFrames: 100,
    maxGateParticles: 70,
    maxConfettiPieces: 45
  },

  labels: {
    dashboard: "Dashboard",
    study: "Study",
    flashcards: "Flashcards",
    quiz: "Quiz",
    review: "Review",
    stats: "Stats",
    cram: "Cram"
  },

  toastMessages: {
    correct: ["W.", "Too easy.", "You got it.", "Correct."],
    wrong: ["Lock in.", "Close.", "Not quite."],
    mastered: ["Mastered.", "Locked in."],
    empty: ["Type something first.", "The blank answer strategy is bold.", "Give it a shot first."]
  },

  storageKeys: {
    unlocked: "thetaStudy.unlocked.v2",
    progress: "thetaStudy.progress.v2",
    settings: "thetaStudy.settings.v2",
    quizHistory: "thetaStudy.quizHistory.v2"
  }
};
