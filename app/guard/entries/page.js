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
    // Show the most recent 50 scanned passes (entries or exits)
    const q = query(
      collection(db, "VisitorPasses"),
      orderBy("lastScannedAt", "desc"),
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
          <p className="text-white/70 text-sm">No visitor logs found yet.</p>
        ) : (
          <div className="space-y-3 max-w-lg">
            {entries.map((e) => (
              <div
                key={e.id}
                className="bg-white p-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex flex-col gap-1"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[var(--navy)] text-sm">{e.visitorName}</p>
                    <p className="text-[var(--slate)] text-xs">{e.visitorMobile}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                    e.status === 'COMPLETED' ? 'bg-gray-100 text-gray-500' : 
                    e.entryStatus === 'ENTERED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {e.status === 'COMPLETED' ? 'EXITED' : e.entryStatus === 'ENTERED' ? 'INSIDE' : 'ACTIVE'}
                  </span>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 bg-slate-50 p-2 rounded-lg space-y-1">
                  <div className="flex justify-between">
                    <span>Entry:</span>
                    <span className="font-medium text-[var(--navy)]">
                      {e.entryAt ? e.entryAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " (" + e.entryAt.toDate().toLocaleDateString() + ")" : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exit:</span>
                    <span className="font-medium text-[var(--navy)]">
                      {e.exitAt ? e.exitAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " (" + e.exitAt.toDate().toLocaleDateString() + ")" : "—"}
                    </span>
                  </div>
                  {e.visitDurationMinutes && (
                    <div className="flex justify-between pt-1 mt-1 border-t border-slate-200">
                      <span>Duration:</span>
                      <span className="font-medium text-[var(--navy)]">{e.visitDurationMinutes} mins</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
