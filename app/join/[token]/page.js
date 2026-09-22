"use client";

import { useState } from "react";

export default function JoinPage({ params }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  async function join(event) {
    event.preventDefault(); setSending(true); setMessage("");
    const response = await fetch("/api/invite-links/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: params.token, displayName: form.name, email: form.email, password: form.password }) });
    const result = await response.json(); setSending(false);
    if (!response.ok) return setMessage(result.error || "We couldn't create your account.");
    window.location.assign("/?joined=1");
  }
  return <main className="auth-page"><section className="auth-card"><img className="portal-logo" src="/ot.webp" alt="Theta Tau"/><p className="kicker">PNM INVITATION</p><h1>Create your account</h1><p className="lead">Choose your own password to access the pledge-class study guide.</p><form onSubmit={join}><label>Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/><label>Password</label><input type="password" autoComplete="new-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength="10" required/><button className="primary" disabled={sending}>{sending ? "Creating account…" : "Create account"}</button></form><p className="notice">{message}</p></section></main>;
}
