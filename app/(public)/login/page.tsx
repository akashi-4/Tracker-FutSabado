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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4 text-white">Login</h2>

      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white 
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                 transition-colors hover:border-gray-600"
        required
      />

      <input
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={e => setPass(e.target.value)}
        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white 
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                 transition-colors hover:border-gray-600"
        required
      />

      {error && <p className="text-red-500">{error}</p>}

      <button 
        type="submit" 
        className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-md 
                 hover:bg-blue-700 transition-all duration-300 font-semibold"
      >
        Sign in
      </button>
    </form>
  );
}

function LoginFallback() {
  return (
    <div className="space-y-4 max-w-sm mx-auto mt-10">
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
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-lg mx-auto">
        <div className="bg-gray-900 p-8 rounded-xl border border-blue-900 shadow-lg">
          <Suspense fallback={<LoginFallback />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
