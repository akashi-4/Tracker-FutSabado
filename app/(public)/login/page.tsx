"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: searchParams.get("callbackUrl") ?? "/",
    });

    if (res?.error) {
      setError("Invalid email / password");
    } else if (res?.url) {
      router.push(res.url);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2 className="page-title">Login</h2>

      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="input-field"
        required
      />

      <input
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={e => setPass(e.target.value)}
        className="input-field"
        required
      />

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="btn-primary">
        Sign in
      </button>
    </form>
  );
}

function LoginFallback() {
  return (
    <div className="form-container">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-4"></div>
        <div className="h-12 bg-gray-700 rounded mb-4"></div>
        <div className="h-12 bg-gray-700 rounded mb-4"></div>
        <div className="h-12 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="page-container">
      <div className="max-w-lg mx-auto">
        <div className="card">
          <Suspense fallback={<LoginFallback />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
