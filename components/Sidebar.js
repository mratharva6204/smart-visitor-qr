"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  QrCode,
  ClipboardList,
  User,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menu = [
    {
      name: "Dashboard",
      href: "/guard/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Scan Visitor QR",
      href: "/guard/scan",
      icon: QrCode,
    },
    {
      name: "Entry Logs",
      href: "/guard/entries",
      icon: ClipboardList,
    },
    {
      name: "Profile",
      href: "/guard/profile",
      icon: User,
    },
  ];

  return (
    <aside className="w-72 min-h-screen bg-[#08172F] text-white shadow-2xl border-r border-white/10 flex flex-col">

      {/* Logo */}
      <div className="px-8 py-8 border-b border-white/10">

        <div className="flex items-center gap-3">

          <div className="bg-[#2F6FED] p-3 rounded-xl">
            <ShieldCheck size={26} />
          </div>

          <div>
            <h1 className="font-bold text-xl">
              AMW SecureX
            </h1>

            <p className="text-xs text-gray-400">
              Guard Portal
            </p>
          </div>

        </div>

      </div>

      {/* Navigation */}

      <nav className="flex-1 px-4 py-8 space-y-3">

        {menu.map((item) => {
          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={item.href}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-4 rounded-xl px-5 py-4 transition-all duration-300 ${
                  active
                    ? "bg-[#2F6FED] shadow-lg"
                    : "hover:bg-white/10"
                }`}
              >
                <Icon size={22} />

                <span className="font-medium">
                  {item.name}
                </span>

              </Link>
            </motion.div>
          );
        })}

      </nav>

      {/* Footer */}

      <div className="border-t border-white/10 p-5">

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/login")}
          className="flex items-center gap-4 w-full rounded-xl bg-red-600 hover:bg-red-700 px-5 py-4 transition"
        >
          <LogOut size={22} />

          Logout
        </motion.button>

      </div>

    </aside>
  );
}