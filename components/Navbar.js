"use client";

import { useAuth } from "../lib/AuthContext";

export default function Navbar() {
  const { profile } = useAuth();

  return (
    <header className="bg-white shadow px-8 py-5 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F3A]">
          Guard Portal
        </h1>

        <p className="text-gray-500">
          AMW SecureX
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold">
          {profile?.name}
        </p>

        <p className="text-sm text-gray-500">
          Guard
        </p>
      </div>
    </header>
  );
}