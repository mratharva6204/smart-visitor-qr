"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useAuth } from "../../../lib/AuthContext";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { profile, user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const cards = [
    { title: "Risk Prediction", desc: "View frequent visitors, analytics, and security insights.", href: "/admin/analytics" },
    { title: "Create Pass", desc: "Generate a new visitor QR pass.", href: "/resident/new-pass" },
    { title: "Scan Entry", desc: "Scan a visitor QR code for entry.", href: "/guard/entry-scan" },
    { title: "Scan Exit", desc: "Scan a visitor QR code for exit.", href: "/guard/exit-scan" },
    { title: "Entry Logs", desc: "View historical entry and exit records.", href: "/guard/entries" },
    { title: "Manage Users", desc: "View and manage residents, guards, and admins.", href: "/admin/users" },
  ];

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[rgba(11,31,58,0.88)] via-[rgba(11,31,58,0.92)] to-[rgba(11,31,58,0.96)]" />

      <div className="relative z-10">
        <header className="px-6 py-5 flex justify-between items-center border-b border-white/10">
          <div>
            <p className="text-white font-display font-semibold text-lg tracking-tight">
              AMW Housing Society
            </p>
            <p className="text-white/50 text-xs tracking-[0.1em]">
              ADMIN CONSOLE
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-white/70 hover:text-white transition"
          >
            Logout
          </button>
        </header>

        <main className="p-6 max-w-3xl mx-auto">
          <p className="text-white/70 mb-6 text-sm">
            Signed in as{" "}
            <span className="font-medium text-white">
              {profile?.name || user?.email}
            </span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((c) => (
              <div key={c.href} className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                <h2 className="font-display font-semibold text-[var(--navy)] mb-1.5">{c.title}</h2>
                <p className="text-[var(--slate)] text-sm mb-5">{c.desc}</p>
                <button
                  onClick={() => router.push(c.href)}
                  className="bg-[var(--navy)] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--blue)] transition"
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
