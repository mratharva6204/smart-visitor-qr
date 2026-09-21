"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";

export default function RoleGuard({ allowedRoles, children }) {
  const { role, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not logged in
    if (!user) {
      router.replace("/login");
      return;
    }

    // Logged in but wrong role
    if (!allowedRoles.includes(role)) {
      router.replace("/login");
    }

  }, [user, role, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  if (!user || !allowedRoles.includes(role)) {
    return null;
  }

  return children;
}