"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Show the most recent 50 scanned/used passes, newest first.
    const q = query(
      collection(db, "VisitorPasses"),
      where("used", "==", true),
      orderBy("usedAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEntries(items);
      setDataLoading(false);
    });

    return () => unsubscribe();
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
          onClick={() => router.push("/guard/dashboard")}
          className="text-sm text-white/70 mb-6 hover:text-white transition"
        >
          ← Back to Dashboard
        </button>

        <h1 className="font-display font-semibold text-white text-lg mb-5">
          Recent Entries
        </h1>

        {dataLoading ? (
          <p className="text-white/70 text-sm">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-white/70 text-sm">No visitors have entered yet.</p>
        ) : (
          <div className="space-y-3 max-w-lg">
            {entries.map((e) => (
              <div
                key={e.id}
                className="bg-white p-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
              >
                <p className="font-medium text-[var(--navy)] text-sm">{e.visitorName}</p>
                <p className="text-[var(--slate)] text-xs">{e.visitorMobile}</p>
                <p className="text-slate-400 text-xs mt-1">
                  Entered: {e.usedAt?.toDate().toLocaleString() || "—"}
                </p>
                {e.scannedByName && (
                  <p className="text-slate-400 text-xs">Scanned by: {e.scannedByName}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
