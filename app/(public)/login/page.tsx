"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();            // to respect ?callbackUrl=

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // next-auth's signIn helper.  redirect:false keeps us in control.
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: searchParams.get("callbackUrl") ?? "/", // where to go after login
    });

    if (res?.error) {
      setError("Invalid email / password");
    } else if (res?.url) {
      // Successful log-in: NextAuth returns the URL to visit.
      router.push(res.url);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="input input-bordered w-full"
        required
      />

      <input
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={e => setPass(e.target.value)}
        className="input input-bordered w-full"
        required
      />

      {error && <p className="text-red-500">{error}</p>}

      <button type="submit" className="btn-primary w-full">
        Sign in
      </button>
    </form>
  );
}
