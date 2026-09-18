"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function SignInPage() {
  const [role, setRole] = useState("pnm");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  async function sendMagicLink(event) {
    event.preventDefault(); setSending(true); setMessage("");
    const { error } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}`, shouldCreateUser: false } });
    setSending(false); setMessage(error ? error.message : "Check your email for your secure sign-in link.");
  }
  return <main className="auth-page"><section className="auth-card"><img className="portal-logo" src="/ot.webp" alt="Theta Tau" /><p className="kicker">THETA TAU — DELTA GAMMA</p><h1>Pledge Class Portal</h1><p className="lead">Study, prepare, and track your progress in one place.</p><div className="role-tabs" role="tablist" aria-label="Sign-in role"><button className={role === "pnm" ? "active" : ""} onClick={() => setRole("pnm")} type="button">PNM Login</button><button className={role === "staff" ? "active" : ""} onClick={() => setRole("staff")} type="button">Admin / NME</button></div><form onSubmit={sendMagicLink}><label htmlFor="email">{role === "staff" ? "Approved staff email" : "Pledge-class email"}</label><input id="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" required /><button className="primary" disabled={sending} type="submit">{sending ? "Sending…" : "Email me a sign-in link"}</button></form><p className="notice">{message || "Only invited members will be able to enter once access is enabled."}</p></section></main>;
}
