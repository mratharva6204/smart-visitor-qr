"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import QRCode from "qrcode";

// Builds the public /pass/{passId} link, carrying the visitor's display
// details as query params. This keeps the public page and its OG preview
// image able to show real details WITHOUT ever reading from Firestore —
// the same privacy-by-design choice we made when this page was first built.
function buildPassLink(passId, form) {
  const qs = new URLSearchParams({
    name: form.visitorName,
    date: form.visitDate,
    start: form.startTime,
    end: form.endTime,
    vehicle: form.vehicleNumber || "",
  }).toString();
  return `${window.location.origin}/pass/${passId}?${qs}`;
}

// Builds a wa.me click-to-chat link.
// Cleans the number and assumes an Indian (+91) number if none is given,
// since that's a very common case for this app's users — if a resident
// enters a number that already includes a country code, we leave it as is.
function buildWhatsAppLink(mobile, message) {
  const digits = (mobile || "").replace(/\D/g, ""); // strip spaces, dashes, +, etc.
  let withCountryCode = digits;

  if (digits.length === 10) {
    withCountryCode = "91" + digits;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    withCountryCode = "91" + digits.slice(1);
  }
  // else: assume it already includes a country code (e.g. 12+ digits)

  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError("You must be logged in.");
      return;
    }

    if (!form.visitorName || !form.visitorMobile || !form.visitDate || !form.startTime || !form.endTime) {
      setError("Please fill all required fields.");
      return;
    }

    // Everything up to here is synchronous — still within the same click
    // event as the button press. We generate the pass ID and open WhatsApp
    // RIGHT NOW, before any `await`, so the browser still counts this as
    // a direct result of the user's click and does not block it as a pop-up.
    const newPassId = generatePassId();
    const passLink = buildPassLink(newPassId, form);
    const message = `Hi ${form.visitorName}, here's your visitor pass for AMW Housing Society on ${form.visitDate} (${form.startTime}–${form.endTime}). Please open this link and show the QR code at the gate: ${passLink}`;
    const waLink = buildWhatsAppLink(form.visitorMobile, message);

    window.open(waLink, "_blank");

    setPassId(newPassId);
    setLoading(true);

    // The database write and QR image rendering happen after — the visitor
    // is already being messaged, this just finishes saving the record and
    // showing the resident their own copy of the ticket.
    (async () => {
      try {
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

        const qrDataUrl = await QRCode.toDataURL(passLink, {
          margin: 1,
          color: { dark: "#0B1F3A", light: "#FFFFFF" },
        });

        setQrImage(qrDataUrl);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while creating the pass.");
      } finally {
        setLoading(false);
      }
    })();
  };

  // Recomputed here (not stored in state) purely so the fallback "Resend"
  // button below always reflects the current passId/form values.
  const resendWaLink = passId
    ? buildWhatsAppLink(
        form.visitorMobile,
        `Hi ${form.visitorName}, here's your visitor pass for AMW Housing Society on ${form.visitDate} (${form.startTime}\u2013${form.endTime}). Please open this link and show the QR code at the gate: ${
          typeof window !== "undefined" ? buildPassLink(passId, form) : ""
        }`
      )
    : "";

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
                  VISITOR MOBILE (WHATSAPP NUMBER)
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

              <div className="relative w-0 border-l-2 border-dashed border-white/30 bg-[var(--navy)]">
                <div className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-[var(--bg)] rounded-full" />
                <div className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-[var(--bg)] rounded-full" />
              </div>

              <div className="bg-white p-4 flex flex-col items-center justify-center w-[132px]">
                <img src={qrImage} alt="Visitor QR Pass" className="w-full rounded" />
                <p className="text-[9px] text-[var(--slate)] mt-2 tracking-wide">{passId}</p>
              </div>
            </div>

            <p className="text-center text-white/70 text-xs mt-4">
              WhatsApp should have opened automatically — just tap Send there.
            </p>

            {/* Fallback: only needed if the browser blocked the automatic
                pop-up, or if the resident wants to resend the same pass. */}
            <a
              href={resendWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-3 flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition"
            >
              WhatsApp didn&apos;t open? Send manually
            </a>

            <button
              onClick={() => router.push("/resident/dashboard")}
              className="w-full mt-3 bg-white border border-slate-200 text-[var(--navy)] py-2.5 rounded-xl font-medium hover:bg-slate-50 transition"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
