"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../lib/AuthContext";

export default function HistoryPage() {
  const [passes, setPasses] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth(); // guaranteed non-null here by the layout's RoleGuard

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "VisitorPasses"),
      where("residentId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPasses(items);
      setDataLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [user]);

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[rgba(11,31,58,0.88)] via-[rgba(11,31,58,0.92)] to-[rgba(11,31,58,0.96)]" />

      <div className="relative z-10 p-6">
        <button
          onClick={() => router.push("/resident/dashboard")}
          className="text-sm text-white/70 mb-6 hover:text-white transition"
        >
          ← Back to Dashboard
        </button>

        <h1 className="font-display font-semibold text-white text-lg mb-5">
          Visitor History
        </h1>

        {dataLoading ? (
          <p className="text-white/70 text-sm">Loading...</p>
        ) : passes.length === 0 ? (
          <p className="text-white/70 text-sm">No visitor passes created yet.</p>
        ) : (
          <div className="space-y-3 max-w-lg">
            {passes.map((p) => (
              <div
                key={p.id}
                className="bg-white p-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-[var(--navy)] text-sm">{p.visitorName}</p>
                    <p className="text-[var(--slate)] text-xs">{p.visitorMobile}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {p.visitDate} • {p.startTime} – {p.endTime}
                    </p>
                    {p.vehicleNumber && (
                      <p className="text-slate-400 text-xs">Vehicle: {p.vehicleNumber}</p>
                    )}
                    <p className="text-slate-400 text-xs mt-1">{p.passId}</p>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-full tracking-wide ${
                      p.used
                        ? "bg-green-50 text-[var(--success)]"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {p.used ? "USED" : "ACTIVE"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
