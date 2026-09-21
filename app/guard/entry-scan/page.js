"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useRouter } from "next/navigation";

function extractPassId(decodedText) {
  try {
    // QR contains JSON
    const data = JSON.parse(decodedText);

    if (data.passId) return data.passId;
    if (data.id) return data.id;
  } catch (e) {
    // Not JSON, continue
  }

  try {
    // QR contains URL
    const url = new URL(decodedText);

    // Check query param: ?passId=...
    const passId = url.searchParams.get("passId");
    if (passId) return passId;

    // Check URL path: /pass/{passId}
    const pathMatch = url.pathname.match(/\/pass\/([^/?]+)/);
    if (pathMatch) return decodeURIComponent(pathMatch[1]);
  } catch (e) {
    // Not a URL
  }

  // QR is simply the pass ID
  return decodedText.trim();
}

export default function EntryScanPage() {
  const router = useRouter();

  const scannerRef = useRef(null);
  const processingRef = useRef(false);
  const mountedRef = useRef(true);

  const [message, setMessage] = useState("Starting camera...");
  const [resultType, setResultType] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    mountedRef.current = true;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("entry-qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          async (decodedText) => {
            if (processingRef.current) return;

            processingRef.current = true;
            setScanning(false);
            setMessage("QR detected. Verifying...");

            try {
              await scanner.stop();
            } catch (error) {
              console.log("Scanner already stopped.");
            }

            await verifyEntry(decodedText);
          },
          () => {
            // Ignore normal QR scanning failures
          }
        );

        if (mountedRef.current) {
          setScanning(true);
          setMessage("Point the camera at the visitor QR code.");
        }
      } catch (error) {
        console.error("Camera error:", error);

        if (mountedRef.current) {
          setMessage(
            "Unable to access camera. Please allow camera permission."
          );
          setResultType("error");
        }
      }
    };

    startScanner();

    return () => {
      mountedRef.current = false;

      const scanner = scannerRef.current;

      if (scanner) {
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            scanner.clear().catch(() => {});
          });
      }
    };
  }, []);

  const verifyEntry = async (decodedText) => {
    try {
      const passId = extractPassId(decodedText);

      if (!passId) {
        setMessage("Invalid QR code.");
        setResultType("error");
        processingRef.current = false;
        return;
      }

      // Find visitor pass
      const passQuery = query(
        collection(db, "VisitorPasses"),
        where("passId", "==", passId)
      );

      const snapshot = await getDocs(passQuery);

      if (snapshot.empty) {
        setMessage("Visitor pass not found.");
        setResultType("error");
        processingRef.current = false;
        return;
      }

      const passDoc = snapshot.docs[0];
      const passData = passDoc.data();

      // Already entered
      if (passData.entryAt || passData.entryStatus === "ENTERED") {
        setMessage("❌ Entry already recorded for this QR.");
        setResultType("error");
        processingRef.current = false;
        return;
      }

      // Pass must be active
      if (passData.status && passData.status !== "ACTIVE") {
        setMessage(`❌ Pass is ${passData.status}. Entry denied.`);
        setResultType("error");
        processingRef.current = false;
        return;
      }

      const now = new Date();

      // Update visitor pass
      await updateDoc(doc(db, "VisitorPasses", passDoc.id), {
        entryAt: serverTimestamp(),
        entryStatus: "ENTERED",
        entryGate: "MAIN_GATE",
        used: true,
        lastScannedAt: serverTimestamp(),
      });

      // Create notification for resident
      await addDoc(collection(db, "Notifications"), {
        title: "Visitor Entered",
        message: `${passData.visitorName || "Visitor"} has entered using their QR pass.`,
        passId: passId,
        residentId: passData.residentId || "",
        createdAt: serverTimestamp(),
        read: false,
        type: "ENTRY",
      });

      setMessage(
        `✅ Entry Granted\n${passData.visitorName || "Visitor"}`
      );
      setResultType("success");

      setTimeout(() => {
        router.push("/guard/dashboard");
      }, 2500);
    } catch (error) {
      console.error("Entry verification error:", error);

      setMessage(
        `❌ Entry failed: ${error.message || "Database error"}`
      );
      setResultType("error");

      processingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1F3A] text-white flex flex-col items-center px-4 py-8">
      <div className="text-center mb-6">
        <p className="text-blue-300 text-sm tracking-widest">
          AMW SECUREX
        </p>

        <h1 className="text-3xl font-bold mt-2">
          Entry Scanner
        </h1>

        <p className="text-white/60 mt-2">
          Scan visitor QR at the entry gate
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-2xl w-full max-w-md">
        <div
          id="entry-qr-reader"
          className="w-full overflow-hidden rounded-xl"
        />
      </div>

      <div
        className={`mt-6 text-center whitespace-pre-line font-medium ${
          resultType === "success"
            ? "text-green-400"
            : resultType === "error"
            ? "text-red-400"
            : "text-white"
        }`}
      >
        {message}
      </div>

      {scanning && (
        <div className="mt-3 text-sm text-white/50">
          📷 Scanner active
        </div>
      )}

      <button
        onClick={() => router.push("/guard/dashboard")}
        className="mt-8 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}