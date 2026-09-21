// Server Component (no "use client") — this lets us export generateMetadata,
// which is how Next.js sets the tags WhatsApp reads to build a link preview.

export async function generateMetadata({ params, searchParams }) {
  const { passId } = await params;
  const sp = await searchParams;

  const { headers } = await import("next/headers");
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  const qs = new URLSearchParams(sp).toString();
  const imageUrl = `${protocol}://${host}/api/pass-image/${passId}${qs ? `?${qs}` : ""}`;

  const visitorName = sp.name || "Visitor";

  return {
    title: `Visitor Pass — ${visitorName}`,
    description: "Show this QR code to the security guard at the gate.",
    openGraph: {
      title: `Visitor Pass — ${visitorName}`,
      description: "Show this QR code to the security guard at the gate.",
      images: [{ url: imageUrl, width: 1000, height: 500 }],
    },
  };
}

export default async function PublicPassPage({ params, searchParams }) {
  const { passId } = await params;
  const sp = await searchParams;
  const qs = new URLSearchParams(sp).toString();
  const imageUrl = `/api/pass-image/${passId}${qs ? `?${qs}` : ""}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1F3A] p-6">
      <p className="text-white/50 text-[10px] tracking-[0.15em] mb-1">
        AMW HOUSING SOCIETY
      </p>
      <h1 className="text-white font-semibold text-lg mb-6">Visitor Pass</h1>

      <img
        src={imageUrl}
        alt="Visitor Pass"
        className="w-full max-w-2xl rounded-2xl shadow-lg"
      />

      <p className="text-white/60 text-xs mt-6 text-center max-w-xs">
        Show this QR code to the security guard at the gate.
      </p>
    </div>
  );
}
