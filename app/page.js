"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loader = document.getElementById("initial-launch-mask");
    const beginExit = window.setTimeout(() => loader?.classList.add("exiting"), 1000);
    const removeLoader = window.setTimeout(() => loader?.remove(), 2500);
    return () => {
      window.clearTimeout(beginExit);
      window.clearTimeout(removeLoader);
    };
  }, []);

  async function signIn(event) {
    event.preventDefault();
    setSending(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(
        "We couldn't sign you in. Check your email and password, or reset your password."
      );
      setSending(false);
      return;
    }

    window.location.assign("/study-guide/");
  }

  return (
    <main className="loginPage">
      <div className="backgroundGlow" aria-hidden="true" />
      <div className="ring ringOne" aria-hidden="true" />
      <div className="ring ringTwo" aria-hidden="true" />

      <div className="particles" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            key={index}
            style={{
              "--x": `${(index * 37) % 100}%`,
              "--delay": `${(index % 8) * 0.7}s`,
              "--duration": `${7 + (index % 6)}s`,
              "--size": `${2 + (index % 4)}px`,
            }}
          />
        ))}
      </div>

      <section className="loginCard">
        <img
          className="logo"
          src="/ot.webp"
          alt="Theta Tau"
        />

        <h1>Theta Tau</h1>
        <p className="subtitle">Pledge Class — Study Guide</p>

        <p className="instruction">
          Sign in to continue your pledge-class study guide.
        </p>

        <form onSubmit={signIn}>
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <div className="passwordHeader">
            <label htmlFor="password">Password</label>
            <a href="/forgot-password">Forgot password?</a>
          </div>

          <div className="passwordField">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button
              className="showPassword"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? "◉" : "○"}
            </button>
          </div>

          <button
            className="signInButton"
            type="submit"
            disabled={sending}
          >
            {sending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className={`notice ${message ? "error" : ""}`}>
          {message || "Access is limited to invited members."}
        </p>
      </section>

      <style jsx>{`
        .loginPage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
          overflow: hidden;
          color: #fff8ef;
          background:
            radial-gradient(
              circle at 50% 45%,
              rgba(126, 35, 32, 0.28),
              transparent 34%
            ),
            radial-gradient(
              circle at 50% 110%,
              rgba(118, 10, 20, 0.25),
              transparent 38%
            ),
            linear-gradient(145deg, #150303 0%, #210505 48%, #100101 100%);
          font-family:
            "Space Grotesk",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .backgroundGlow {
          position: absolute;
          width: 620px;
          height: 620px;
          border-radius: 50%;
          background: rgba(131, 35, 29, 0.1);
          filter: blur(90px);
          pointer-events: none;
        }

        .ring {
          position: absolute;
          border: 1px solid rgba(181, 55, 48, 0.11);
          border-radius: 50%;
          pointer-events: none;
        }

        .ringOne {
          width: 460px;
          height: 460px;
        }

        .ringTwo {
          width: 720px;
          height: 720px;
          border-color: rgba(214, 178, 94, 0.05);
        }

        .particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .particles span {
          position: absolute;
          left: var(--x);
          bottom: -20px;
          width: var(--size);
          height: var(--size);
          border-radius: 50%;
          background: #d6b25e;
          box-shadow: 0 0 12px rgba(214, 178, 94, 0.65);
          opacity: 0;
          animation: rise var(--duration) linear var(--delay) infinite;
        }

        .particles span:nth-child(3n) {
          background: #b91f32;
          box-shadow: 0 0 12px rgba(185, 31, 50, 0.7);
        }

        .loginCard {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 460px;
          padding: 64px 54px 48px;
          text-align: center;
          border: 1px solid rgba(255, 235, 216, 0.12);
          border-radius: 24px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.085),
              rgba(255, 255, 255, 0.035)
            );
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.42),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(18px);
        }

        .logo {
          display: block;
          width: 74px;
          height: auto;
          margin: 0 auto 38px;
          filter: drop-shadow(0 0 12px rgba(214, 178, 94, 0.2));
        }

        h1 {
          margin: 0;
          color: #fff7ed;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.7px;
        }

        .subtitle {
          margin: 10px 0 0;
          color: rgba(255, 244, 234, 0.67);
          font-size: 18px;
        }

        .instruction {
          margin: 34px auto 28px;
          color: rgba(255, 244, 234, 0.75);
          font-size: 16px;
          line-height: 1.5;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          text-align: left;
        }

        label {
          color: rgba(255, 247, 238, 0.82);
          font-size: 14px;
          font-weight: 600;
        }

        input {
          box-sizing: border-box;
          width: 100%;
          height: 54px;
          padding: 0 17px;
          color: #fff7ed;
          font: inherit;
          border: 1px solid rgba(255, 235, 216, 0.13);
          border-radius: 13px;
          outline: none;
          background: rgba(16, 2, 2, 0.62);
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease;
        }

        input::placeholder {
          color: rgba(255, 244, 234, 0.3);
        }

        input:focus {
          border-color: rgba(214, 178, 94, 0.75);
          box-shadow: 0 0 0 3px rgba(214, 178, 94, 0.1);
        }

        .passwordHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
        }

        .passwordHeader a {
          color: #dfbd6d;
          font-size: 13px;
          text-decoration: none;
        }

        .passwordHeader a:hover {
          text-decoration: underline;
        }

        .passwordField {
          position: relative;
        }

        .passwordField input {
          padding-right: 54px;
        }

        .showPassword {
          position: absolute;
          top: 50%;
          right: 8px;
          width: 40px;
          height: 40px;
          color: rgba(255, 247, 238, 0.68);
          font-size: 21px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          transform: translateY(-50%);
          cursor: pointer;
        }

        .showPassword:hover {
          color: #f2cf78;
          background: rgba(255, 255, 255, 0.05);
        }

        .signInButton {
          width: 100%;
          min-height: 54px;
          margin-top: 14px;
          color: #251303;
          font: inherit;
          font-weight: 700;
          border: 1px solid rgba(255, 222, 132, 0.65);
          border-radius: 13px;
          background: linear-gradient(135deg, #f8d678, #c69c47);
          box-shadow: 0 10px 25px rgba(180, 125, 36, 0.15);
          cursor: pointer;
          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            opacity 160ms ease;
        }

        .signInButton:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(180, 125, 36, 0.23);
        }

        .signInButton:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .notice {
          min-height: 21px;
          margin: 21px 0 0;
          color: rgba(255, 244, 234, 0.53);
          font-size: 13px;
          line-height: 1.5;
        }

        .notice.error {
          color: #ff9c9c;
        }

        @keyframes rise {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.7);
          }

          15% {
            opacity: 0.65;
          }

          85% {
            opacity: 0.25;
          }

          100% {
            opacity: 0;
            transform: translateY(-105vh) scale(1.5);
          }
        }

        @media (max-width: 600px) {
          .loginPage {
            padding: 16px;
          }

          .loginCard {
            max-width: 100%;
            padding: 45px 24px 34px;
            border-radius: 20px;
          }

          .logo {
            width: 66px;
            margin-bottom: 28px;
          }

          h1 {
            font-size: 28px;
          }

          .subtitle {
            font-size: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .particles span {
            animation: none;
          }

          .signInButton {
            transition: none;
          }

        }
      `}</style>
    </main>
  );
}
