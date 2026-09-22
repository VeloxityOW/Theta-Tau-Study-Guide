import { createBrowserClient } from "https://esm.sh/@supabase/ssr@0.6.1";

async function startPortal() {
  const configResponse = await fetch("/api/portal-config", { cache: "no-store" });
  if (!configResponse.ok) throw new Error("Portal configuration could not be loaded.");
  const { url, key } = await configResponse.json();
  const supabase = createBrowserClient(url, key);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.replace("/");
    return new Promise(() => {});
  }

  const [{ data: profile, error: profileError }, { data: savedProgress }, { data: changes }] = await Promise.all([
    supabase.from("profiles").select("role, display_name").eq("id", user.id).single(),
    supabase.from("question_progress").select("question_id, correct_count, wrong_count, mastered, updated_at").eq("user_id", user.id),
    supabase.from("study_questions").select("id, question, answer, mode, category, quiz, is_custom")
  ]);

  if (profileError || !profile) throw new Error("Your portal profile is not ready yet.");

  const base = window.THETA_QUESTIONS || [];
  const baseById = new Map(base.map(question => [question.id, question]));
  (changes || []).forEach(change => {
    const question = {
      id: change.id,
      q: change.question,
      a: change.answer,
      mode: change.mode,
      cat: change.category || undefined,
      quiz: change.quiz || undefined
    };
    baseById.set(change.id, { ...(baseById.get(change.id) || {}), ...question });
  });

  window.THETA_QUESTIONS = Array.from(baseById.values());
  window.THETA_PORTAL = {
    supabase,
    user,
    profile,
    isStaff: profile.role === "nme" || profile.role === "admin",
    progress: Object.fromEntries((savedProgress || []).map(item => [item.question_id, {
      answered: item.correct_count + item.wrong_count > 0,
      correct: item.correct_count > 0 && item.wrong_count === 0,
      correctCount: item.correct_count,
      wrongCount: item.wrong_count,
      mastered: item.mastered,
      lastSeenAt: item.updated_at
    }]))
  };
}

window.thetaPortalReady = startPortal().catch(error => {
  console.error(error);
  document.body.innerHTML = `<main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#160303;color:#fff8ef;font-family:system-ui;text-align:center"><div><h1>We couldn't open your portal.</h1><p>${error.message}</p><a style="color:#f2cf78" href="/">Return to sign in</a></div></main>`;
  return new Promise(() => {});
});
