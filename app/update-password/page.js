"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function establishRecoverySession() {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) return setMessage("This password link has expired or was already used. Request a new one.");
        window.history.replaceState({}, "", window.location.pathname);
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return setMessage("This password link is invalid or expired. Request a new reset link.");
      setReady(true);
    }
    establishRecoverySession();
  }, [supabase]);

  async function updatePassword(event) {
    event.preventDefault();
    if (password.length < 10) return setMessage("Choose a password with at least 10 characters.");
    if (password !== confirmation) return setMessage("Passwords do not match.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return setMessage("We couldn't update your password. Request a new reset link and try again.");
    window.location.assign("/study-guide/");
  }

  return <main className="auth-page"><section className="auth-card"><img className="portal-logo" src="/ot.webp" alt="Theta Tau"/><p className="kicker">ACCOUNT SETUP</p><h1>Choose a new password</h1><form onSubmit={updatePassword}><label htmlFor="password">New password</label><input id="password" type="password" autoComplete="new-password" value={password} onChange={event=>setPassword(event.target.value)} required disabled={!ready}/><label htmlFor="confirmation">Confirm new password</label><input id="confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={event=>setConfirmation(event.target.value)} required disabled={!ready}/><button className="primary" type="submit" disabled={!ready}>{ready ? "Save new password" : "Checking link…"}</button></form><p className="notice">{message}</p></section></main>;
}
