import { ImageResponse } from "next/og";
import QRCode from "qrcode";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { passId } = await params;
  const { searchParams } = new URL(request.url);

  const name = searchParams.get("name") || "Visitor";
  const date = searchParams.get("date") || "";
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";
  const vehicle = searchParams.get("vehicle") || "";

  // Build the public pass URL that the QR code will encode
  const host = request.headers.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const passUrl = `${protocol}://${host}/pass/${passId}?${searchParams.toString()}`;

  // Generate QR code as an SVG string → base64 data-URL
  // (SVG avoids native canvas deps, works on Vercel edge/serverless)
  const qrSvg = await QRCode.toString(passUrl, {
    type: "svg",
    margin: 1,
    width: 200,
    color: { dark: "#0B1F3A", light: "#FFFFFF" },
  });
  const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString(
    "base64"
  )}`;

  // Format the date for display (e.g. "2026-09-21" → "21 Sep 2026")
  let displayDate = date;
  try {
    const d = new Date(date + "T00:00:00");
    displayDate = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    // keep raw string
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          fontFamily: "sans-serif",
        }}
      >
        {/* ─── Left: Details ─── */}
        <div
          style={{
            flex: 1,
            background: "#0B1F3A",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px 36px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 12,
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              AMW HOUSING SOCIETY
            </span>

            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                marginTop: 8,
                lineHeight: 1.2,
              }}
            >
              {name}
            </span>

            <span
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                marginTop: 6,
              }}
            >
              Visitor Pass
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.1em",
                }}
              >
                DATE
              </span>
              <span style={{ fontSize: 14 }}>{displayDate}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.1em",
                }}
              >
                TIME
              </span>
              <span style={{ fontSize: 14 }}>
                {start} – {end}
              </span>
            </div>

            {vehicle ? (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                    letterSpacing: "0.1em",
                  }}
                >
                  VEHICLE
                </span>
                <span style={{ fontSize: 14 }}>{vehicle}</span>
              </div>
            ) : null}
          </div>

          <span
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              marginTop: 16,
              letterSpacing: "0.08em",
            }}
          >
            {passId}
          </span>
        </div>

        {/* ─── Dashed separator ─── */}
        <div
          style={{
            width: 2,
            background: "#0B1F3A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 2,
              height: "80%",
              borderLeft: "2px dashed rgba(255,255,255,0.25)",
              display: "flex",
            }}
          />
        </div>

        {/* ─── Right: QR Code ─── */}
        <div
          style={{
            width: 240,
            background: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            width={180}
            height={180}
            alt="QR"
            style={{ borderRadius: 8 }}
          />
          <span
            style={{
              fontSize: 10,
              color: "#64748b",
              marginTop: 12,
              letterSpacing: "0.08em",
            }}
          >
            SCAN AT GATE
          </span>
        </div>
      </div>
    ),
    {
      width: 1000,
      height: 500,
    }
  );
}
