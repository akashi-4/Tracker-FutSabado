"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "Failed to register");
      return;
    }
    router.push("/login");   // or auto-sign-in
  }

  return (
    <div className="page-container">
      <div className="max-w-lg mx-auto">
        <div className="card">
          <form onSubmit={handleSubmit} className="form-container">
            <h2 className="page-title">Create Account</h2>
            
            <input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@example.com" 
              className="input-field"
              required 
            />
            
            <input 
              type="password" 
              value={password} 
              onChange={e => setPass(e.target.value)} 
              placeholder="••••••••" 
              className="input-field"
              required 
            />
            
            {error && <p className="error-text">{error}</p>}
            
            <button type="submit" className="btn-primary">
              Create account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
