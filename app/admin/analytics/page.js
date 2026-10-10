"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [frequentVisitors, setFrequentVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const q = query(collection(db, "VisitorPasses"));
        const snapshot = await getDocs(q);
        
        const counts = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!data.visitorMobile) return;
          
          if (!counts[data.visitorMobile]) {
            counts[data.visitorMobile] = {
              name: data.visitorName,
              mobile: data.visitorMobile,
              visits: 0,
            };
          }
          counts[data.visitorMobile].visits += 1;
        });

        const sorted = Object.values(counts)
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 10);
          
        setFrequentVisitors(sorted);
      } catch (e) {
        console.error("Error fetching analytics:", e);
      }
      setLoading(false);
    };
    fetchAnalytics();
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

        <h1 className="font-display font-semibold text-white text-2xl mb-6">
          Risk Prediction & Analytics
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] max-w-2xl">
          <div className="mb-4">
            <h2 className="text-[var(--navy)] font-bold text-lg">Visitor Frequency Analysis</h2>
            <p className="text-slate-500 text-xs mt-1">Identifies returning visitors to assign security risk levels.</p>
          </div>
          
          {loading ? (
            <p className="text-slate-500 text-sm">Analyzing visitor data...</p>
          ) : frequentVisitors.length === 0 ? (
            <p className="text-slate-500 text-sm">No visitor records found.</p>
          ) : (
            <div className="space-y-3">
              {frequentVisitors.map(v => (
                <div key={v.mobile} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-semibold text-[#0B1F3A]">{v.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{v.mobile}</p>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="font-bold text-xl text-blue-600 leading-none">{v.visits}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Visits</p>
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide w-32 text-center ${
                      v.visits > 3 
                        ? 'bg-green-100 text-green-700' 
                        : v.visits === 1 
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}>
                      {v.visits > 3 ? 'LOW RISK (KNOWN)' : v.visits === 1 ? 'HIGH RISK (NEW)' : 'MODERATE RISK'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
