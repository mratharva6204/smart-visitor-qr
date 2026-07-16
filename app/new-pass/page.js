"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import QRCode from "qrcode";

export default function NewPassPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    visitorName: "",
    visitorMobile: "",
    visitDate: "",
    startTime: "",
    endTime: "",
    vehicleNumber: "",
  });

  const [qrImage, setQrImage] = useState(null);
  const [passId, setPassId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generatePassId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `PASS_${year}_${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    if (!form.visitorName || !form.visitorMobile || !form.visitDate || !form.startTime || !form.endTime) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }

    try {
      const newPassId = generatePassId();

      await addDoc(collection(db, "VisitorPasses"), {
        passId: newPassId,
        residentId: currentUser.uid,
        residentEmail: currentUser.email,
        visitorName: form.visitorName,
        visitorMobile: form.visitorMobile,
        visitDate: form.visitDate,
        startTime: form.startTime,
        endTime: form.endTime,
        vehicleNumber: form.vehicleNumber || null,
        status: "ACTIVE",
        used: false,
        createdAt: Timestamp.now(),
        usedAt: null,
      });

      const qrDataUrl = await QRCode.toDataURL(newPassId, {
        margin: 1,
        color: { dark: "#0B1F3A", light: "#FFFFFF" },
      });

      setQrImage(qrDataUrl);
      setPassId(newPassId);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while creating the pass.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
      />
      {/* Dark navy gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[rgba(11,31,58,0.88)] via-[rgba(11,31,58,0.92)] to-[rgba(11,31,58,0.96)]" />

      <div className="relative z-10 p-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-white/70 mb-6 hover:text-white transition"
        >
          ← Back to Dashboard
        </button>

        {!qrImage ? (
          <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] max-w-md mx-auto">
            <h1 className="font-display font-semibold text-[var(--navy)] text-lg mb-5">
              Generate Visitor Pass
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--slate)] mb-1.5 tracking-wide">
                  VISITOR NAME
                </label>
                <input
                  name="visitorName"
                  value={form.visitorName}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--slate)] mb-1.5 tracking-wide">
                  VISITOR MOBILE
                </label>
                <input
                  name="visitorMobile"
                  value={form.visitorMobile}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent transition"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--slate)] mb-1.5 tracking-wide">
                  VISIT DATE
                </label>
                <input
                  type="date"
                  name="visitDate"
                  value={form.visitDate}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent transition"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[var(--slate)] mb-1.5 tracking-wide">
                    START TIME
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent transition"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[var(--slate)] mb-1.5 tracking-wide">
                    END TIME
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--slate)] mb-1.5 tracking-wide">
                  VEHICLE NUMBER (OPTIONAL)
                </label>
                <input
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent transition"
                  placeholder="MH12AB1234"
                />
              </div>

              {error && <p className="text-[var(--danger)] text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--navy)] text-white py-2.5 rounded-xl font-medium hover:bg-[var(--blue)] transition disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate QR Pass"}
              </button>
            </form>
          </div>
        ) : (
          <div className="max-w-sm mx-auto">
            <p className="text-center text-white font-medium mb-4 text-sm">
              ✓ Pass created successfully
            </p>

            {/* Boarding-pass style ticket */}
            <div className="flex rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
              {/* Left stub: visitor details */}
              <div className="bg-[var(--navy)] text-white p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-white/50 text-[10px] tracking-[0.15em] mb-1">
                    AMW HOUSING SOCIETY
                  </p>
                  <p className="font-display font-semibold text-lg leading-tight">
                    {form.visitorName}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">{form.visitorMobile}</p>
                </div>

                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">DATE</span>
                    <span>{form.visitDate}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">TIME</span>
                    <span>{form.startTime} – {form.endTime}</span>
                  </div>
                  {form.vehicleNumber && (
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">VEHICLE</span>
                      <span>{form.vehicleNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Perforated divider */}
              <div className="relative w-0 border-l-2 border-dashed border-white/30 bg-[var(--navy)]">
                <div className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-[var(--bg)] rounded-full" />
                <div className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-[var(--bg)] rounded-full" />
              </div>

              {/* Right stub: QR code */}
              <div className="bg-white p-4 flex flex-col items-center justify-center w-[132px]">
                <img src={qrImage} alt="Visitor QR Pass" className="w-full rounded" />
                <p className="text-[9px] text-[var(--slate)] mt-2 tracking-wide">{passId}</p>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full mt-6 bg-white border border-slate-200 text-[var(--navy)] py-2.5 rounded-xl font-medium hover:bg-slate-50 transition"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}