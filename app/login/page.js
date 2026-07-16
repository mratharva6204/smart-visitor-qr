"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/building.jpg')" }}
      />
      {/* Dark luxury gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(11,31,58,0.75)] via-[rgba(11,31,58,0.85)] to-[rgba(11,31,58,0.95)]" />

      <div className="w-full max-w-sm relative z-10">
        {/* Society identity block */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm mb-4">
            <span className="font-display text-white text-xl font-bold">AMW</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-white tracking-tight">
            AMW Housing Society
          </h1>
          <p className="text-white/70 text-sm mt-1 tracking-[0.15em]">
            SMART VISITOR ACCESS SYSTEM
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-[0_2px_20px_rgba(11,31,58,0.08)] border border-slate-100">
          <p className="text-[var(--slate)] text-sm mb-6">Resident sign in</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--slate)] mb-1.5 tracking-wide">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--slate)] mb-1.5 tracking-wide">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-[var(--danger)] text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--navy)] text-white py-2.5 rounded-xl font-medium hover:bg-[var(--blue)] transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/70 mt-6">
          Gate access, without the wait.
        </p>
      </div>
    </div>
  );
}