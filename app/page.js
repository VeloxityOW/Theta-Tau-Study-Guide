"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  async function signIn(event) {
    event.preventDefault(); setSending(true); setMessage("");
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (!error) window.location.assign("/dashboard");
    setSending(false); setMessage(error ? "We couldn't sign you in. Check your email and password, or reset your password." : "");
  }
  return <main className="auth-page"><section className="auth-card login-card"><img className="portal-logo" src="/ot.webp" alt="Theta Tau" /><h1>Welcome back</h1><p className="lead">Sign in to the Theta Tau pledge portal</p><form onSubmit={signIn}><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required /><div className="password-label"><label htmlFor="password">Password</label><a href="/forgot-password">Forgot password?</a></div><div className="password-field"><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /><button aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} type="button">{showPassword ? "◉" : "○"}</button></div><button className="primary" disabled={sending} type="submit">{sending ? "Signing in…" : "Sign in"}</button></form><p className="notice">{message || "Access is limited to invited members."}</p></section></main>;
}
