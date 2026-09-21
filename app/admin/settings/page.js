"use client";

import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[rgba(11,31,58,0.88)] via-[rgba(11,31,58,0.92)] to-[rgba(11,31,58,0.96)]" />

      <div className="relative z-10 p-6">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="text-sm text-white/70 mb-6 hover:text-white transition"
        >
          ← Back to Dashboard
        </button>

        <h1 className="font-display font-semibold text-white text-lg mb-3">
          Settings
        </h1>
        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] max-w-lg">
          <p className="text-[var(--slate)] text-sm">
            This section is a placeholder. Society-wide configuration (visiting
            hours, gate rules, notification preferences) will be built here as
            the platform moves toward the Multi-Society SaaS phase.
          </p>
        </div>
      </div>
    </div>
  );
}
