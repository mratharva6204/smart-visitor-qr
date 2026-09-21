"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useAuth } from "../../../lib/AuthContext";

export default function GuardDashboardPage() {
  const router = useRouter();
  const { profile, user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0B1F3A] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <p className="font-semibold text-lg">
              AMW Housing Society
            </p>

            <p className="text-white/50 text-xs tracking-widest">
              GATE SECURITY CONSOLE
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-white/70 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-white/60 text-sm">
            Guard Portal
          </p>

          <h1 className="text-3xl font-bold mt-1">
            Welcome, {profile?.name || user?.email || "Guard"}
          </h1>

          <p className="text-white/50 mt-2">
            Select an operation below.
          </p>
        </div>

        {/* Scanner Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ENTRY */}
          <div className="bg-white text-[#0B1F3A] rounded-2xl p-7 shadow-xl">
            <div className="text-4xl mb-4">
              📥
            </div>

            <h2 className="text-xl font-bold mb-2">
              Entry Scanner
            </h2>

            <p className="text-gray-500 text-sm mb-6">
              Scan a visitor QR when the visitor enters the society.
              The entry time will be stored in Firestore.
            </p>

            <button
              onClick={() => router.push("/guard/entry-scan")}
              className="w-full bg-[#0B1F3A] text-white py-3 rounded-xl font-medium hover:bg-blue-800 transition"
            >
              Scan Entry QR
            </button>
          </div>

          {/* EXIT */}
          <div className="bg-white text-[#0B1F3A] rounded-2xl p-7 shadow-xl">
            <div className="text-4xl mb-4">
              📤
            </div>

            <h2 className="text-xl font-bold mb-2">
              Exit Scanner
            </h2>

            <p className="text-gray-500 text-sm mb-6">
              Scan the same visitor QR when the visitor exits.
              The exit time and total visit duration will be stored.
            </p>

            <button
              onClick={() => router.push("/guard/exit-scan")}
              className="w-full bg-gray-100 text-[#0B1F3A] py-3 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              Scan Exit QR
            </button>
          </div>

          {/* ENTRIES */}
          <div className="bg-white text-[#0B1F3A] rounded-2xl p-7 shadow-xl">
            <div className="text-4xl mb-4">
              📋
            </div>

            <h2 className="text-xl font-bold mb-2">
              Entry Logs
            </h2>

            <p className="text-gray-500 text-sm mb-6">
              View visitors who have been scanned and their entry/exit
              records.
            </p>

            <button
              onClick={() => router.push("/guard/entries")}
              className="w-full bg-gray-100 text-[#0B1F3A] py-3 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              View Entry Logs
            </button>
          </div>

        </div>

        {/* System Status */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-green-400 rounded-full" />

            <div>
              <p className="font-medium">
                Security System Online
              </p>

              <p className="text-white/50 text-sm">
                QR verification and Firestore logging are active.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}