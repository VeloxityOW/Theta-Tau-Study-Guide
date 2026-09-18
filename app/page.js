"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function SignInPage() {
  const [role, setRole] = useState("pnm");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  async function signIn(event) {
    event.preventDefault(); setSending(true); setMessage("");
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (!error) window.location.assign("/dashboard");
    setSending(false); setMessage(error ? "We couldn't sign you in. Check your email and password, or reset your password." : "");
  }
  return <main className="auth-page"><section className="auth-card"><img className="portal-logo" src="/ot.webp" alt="Theta Tau" /><p className="kicker">THETA TAU — DELTA GAMMA</p><h1>Pledge Class Portal</h1><p className="lead">Study, prepare, and track your progress in one place.</p><div className="role-tabs" role="tablist" aria-label="Sign-in role"><button className={role === "pnm" ? "active" : ""} onClick={() => setRole("pnm")} type="button">PNM Login</button><button className={role === "staff" ? "active" : ""} onClick={() => setRole("staff")} type="button">Admin / NME</button></div><form onSubmit={signIn}><label htmlFor="email">{role === "staff" ? "Approved staff email" : "Pledge-class email"}</label><input id="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" required /><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /><button className="primary" disabled={sending} type="submit">{sending ? "Signing in…" : "Sign in"}</button></form><a className="text-link" href="/forgot-password">Forgot password?</a><p className="notice">{message || "Accounts are created by invitation only."}</p></section></main>;
}
