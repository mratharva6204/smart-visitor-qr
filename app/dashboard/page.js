"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <p className="text-[var(--slate)] text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
      />
      {/* Dark navy gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[rgba(11,31,58,0.88)] via-[rgba(11,31,58,0.92)] to-[rgba(11,31,58,0.96)]" />

      {/* Content sits above the background */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-5 flex justify-between items-center border-b border-white/10">
          <div>
            <p className="text-white font-display font-semibold text-lg tracking-tight">
              AMW Housing Society
            </p>
            <p className="text-white/50 text-xs tracking-[0.1em]">
              SMART VISITOR ACCESS SYSTEM
            </p>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.push("/notifications")}
              className="text-sm text-white/70 hover:text-white transition"
            >
              Notifications
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-white/70 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="p-6 max-w-3xl mx-auto">
          <p className="text-white/70 mb-6 text-sm">
            Welcome, <span className="font-medium text-white">{user?.email}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
              <h2 className="font-display font-semibold text-[var(--navy)] mb-1.5">
                Generate Visitor Pass
              </h2>
              <p className="text-[var(--slate)] text-sm mb-5">
                Create a secure QR pass for an upcoming visitor.
              </p>
              <button
                onClick={() => router.push("/new-pass")}
                className="bg-[var(--navy)] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--blue)] transition"
              >
                + New Pass
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
              <h2 className="font-display font-semibold text-[var(--navy)] mb-1.5">
                Visitor History
              </h2>
              <p className="text-[var(--slate)] text-sm mb-5">
                View all past and upcoming visitor passes.
              </p>
              <button
                onClick={() => router.push("/history")}
                className="bg-slate-100 text-[var(--navy)] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
              >
                View History
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}