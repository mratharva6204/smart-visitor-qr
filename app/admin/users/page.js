"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const roleBadgeStyles = {
  resident: "bg-blue-50 text-blue-700",
  guard: "bg-amber-50 text-amber-700",
  admin: "bg-purple-50 text-purple-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(items);
      setDataLoading(false);
    };
    fetchUsers();
  }, []);

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

        <h1 className="font-display font-semibold text-white text-lg mb-5">
          All Users
        </h1>

        {dataLoading ? (
          <p className="text-white/70 text-sm">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-white/70 text-sm">No users found.</p>
        ) : (
          <div className="space-y-3 max-w-lg">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-white p-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex justify-between items-start"
              >
                <div>
                  <p className="font-medium text-[var(--navy)] text-sm">{u.name || "(no name)"}</p>
                  <p className="text-[var(--slate)] text-xs">{u.email}</p>
                  {u.flatNumber && (
                    <p className="text-slate-400 text-xs mt-1">Flat: {u.flatNumber}</p>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium px-2.5 py-1 rounded-full tracking-wide ${
                    roleBadgeStyles[u.role] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {(u.role || "unknown").toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
