"use client";

import RoleGuard from "../../components/RoleGuard";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function GuardLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["guard", "admin"]}>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />

        <div className="flex-1">
          <Navbar />

          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}