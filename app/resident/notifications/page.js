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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "Notifications"),
      where("residentId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(items);
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
          Notifications
        </h1>

        {dataLoading ? (
          <p className="text-white/70 text-sm">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-white/70 text-sm">No notifications yet.</p>
        ) : (
          <div className="space-y-3 max-w-lg">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="bg-white p-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--success)] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[var(--navy)] text-sm">{n.title}</p>
                  <p className="text-[var(--slate)] text-sm">{n.message}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    {n.createdAt?.toDate().toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
