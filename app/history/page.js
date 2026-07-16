"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function HistoryPage() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const q = query(
        collection(db, "VisitorPasses"),
        where("residentId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPasses(items);
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, [router]);

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[rgba(11,31,58,0.88)] via-[rgba(11,31,58,0.92)] to-[rgba(11,31,58,0.96)]" />

      <div className="relative z-10 p-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-white/70 mb-6 hover:text-white transition"
        >
          ← Back to Dashboard
        </button>

        <h1 className="font-display font-semibold text-white text-lg mb-5">
          Visitor History
        </h1>

        {loading ? (
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