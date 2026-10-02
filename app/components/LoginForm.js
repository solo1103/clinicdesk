"use client";

import { useState } from "react";

const DEMO_EMAIL = "admin@clinic.com";
const DEMO_PASSWORD = "demo123";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("loading");

    const nextEmail = email.trim().toLowerCase();
    const nextPassword = password;

    window.setTimeout(() => {
      if (nextEmail === DEMO_EMAIL && nextPassword === DEMO_PASSWORD) {
        setStatus("success");
        return;
      }

      setStatus("idle");
      setError("Those credentials don’t match. Try the demo account below.");
    }, 650);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-clinic-navy"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@clinic.com"
          className="h-12 w-full rounded-xl border border-[#d5e4e6] bg-white px-4 text-[15px] text-clinic-text outline-none transition placeholder:text-[#9bb3b8] focus:border-clinic-teal focus:ring-4 focus:ring-clinic-teal/15"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-clinic-navy"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="h-12 w-full rounded-xl border border-[#d5e4e6] bg-white px-4 pr-12 text-[15px] text-clinic-text outline-none transition placeholder:text-[#9bb3b8] focus:border-clinic-teal focus:ring-4 focus:ring-clinic-teal/15"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-clinic-muted transition hover:text-clinic-navy"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOffIcon />
            ) : (
              <EyeIcon />
            )}
          </button>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-[#fff4f2] px-3 py-2 text-sm text-[#9b3a2f]"
        >
          {error}
        </p>
      ) : null}

      {status === "success" ? (
        <p
          role="status"
          className="rounded-lg bg-[#e8faf4] px-3 py-2 text-sm text-clinic-navy"
        >
          Signed in with the demo account. Dashboard comes next.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-clinic-teal text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(2,128,144,0.9)] transition hover:bg-[#027484] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-clinic-teal/25 disabled:cursor-wait disabled:opacity-80"
      >
        {status === "loading" ? "Signing in…" : "Sign In"}
      </button>

      <p className="text-center text-sm text-clinic-muted">
        Demo:{" "}
        <span className="font-medium text-clinic-navy">admin@clinic.com</span>
        {" / "}
        <span className="font-medium text-clinic-navy">demo123</span>
      </p>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z"
      />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3l18 18M9.9 9.9A3 3 0 0 0 12 15a3 3 0 0 0 2.1-.9M6.1 6.4C4.2 7.7 2.7 9.6 2.25 12c0 0 3.75 6.75 9.75 6.75 1.5 0 2.9-.3 4.15-.85M17.6 15.2c1.6-1.2 2.9-2.9 3.4-3.2 0 0-3.75-6.75-9.75-6.75-.7 0-1.37.07-2 .2"
      />
    </svg>
  );
}
