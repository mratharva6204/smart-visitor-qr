"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function ScanPage() {
  const scannerRef = useRef(null);
  const [result, setResult] = useState(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const startScanner = async () => {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          onScanSuccess,
          () => {}
        );
      } catch (err) {
        console.error("Camera start failed:", err);
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScanSuccess = async (decodedText) => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.pause(true);
    }
    await validatePass(decodedText);
  };

  const validatePass = async (passId) => {
    try {
      const q = query(
        collection(db, "VisitorPasses"),
        where("passId", "==", passId.trim())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setResult({ status: "error", message: "QR Not Found", details: "This pass does not exist." });
        return;
      }

      const passDoc = snapshot.docs[0];
      const pass = passDoc.data();

      if (pass.used) {
        setResult({ status: "error", message: "Already Used", details: "This pass was already used." });
        return;
      }

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      if (pass.visitDate !== todayStr) {
        setResult({ status: "error", message: "Invalid Date", details: `Valid for ${pass.visitDate}, not today.` });
        return;
      }

      const currentTime = now.toTimeString().slice(0, 5);
      if (currentTime < pass.startTime || currentTime > pass.endTime) {
        setResult({ status: "error", message: "Outside Allowed Time", details: `Allowed: ${pass.startTime} – ${pass.endTime}` });
        return;
      }

      await updateDoc(doc(db, "VisitorPasses", passDoc.id), {
        used: true,
        status: "USED",
        usedAt: Timestamp.now(),
      });

      await addDoc(collection(db, "Notifications"), {
        residentId: pass.residentId,
        title: "Visitor Entered",
        message: `${pass.visitorName} has entered using their QR pass.`,
        passId: pass.passId,
        read: false,
        createdAt: Timestamp.now(),
      });

      setResult({
        status: "success",
        message: "ACCESS GRANTED",
        details: `Welcome, ${pass.visitorName}. Gate opening...`,
      });
    } catch (err) {
      console.error(err);
      setResult({ status: "error", message: "System Error", details: "Could not validate pass." });
    }
  };

  const handleScanAgain = () => {
    setResult(null);
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.resume();
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center p-6">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
      />
      {/* Dark navy gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[rgba(11,31,58,0.88)] via-[rgba(11,31,58,0.92)] to-[rgba(11,31,58,0.96)]" />

      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="text-center mb-6">
          <p className="text-white/50 text-[10px] tracking-[0.15em] mb-1">
            AMW HOUSING SOCIETY
          </p>
          <h1 className="font-display text-white text-xl font-semibold">
            Gate Scanner
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-4 w-full max-w-sm">
          <div id="qr-reader" ref={scannerRef} className="w-full rounded-xl overflow-hidden" />
          {!result && (
            <p className="text-[var(--slate)] text-sm text-center mt-3">
              Point the camera at the visitor's QR code
            </p>
          )}
        </div>

        {result && (
          <div className="mt-6 p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] w-full max-w-sm text-center bg-white">
            <h2
              className={`font-display text-2xl font-bold mb-2 ${
                result.status === "success" ? "text-[var(--success)]" : "text-[var(--danger)]"
              }`}
            >
              {result.message}
            </h2>
            <p className="text-[var(--slate)] mb-5 text-sm">{result.details}</p>
            <button
              onClick={handleScanAgain}
              className="bg-[var(--navy)] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[var(--blue)] transition"
            >
              Scan Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}