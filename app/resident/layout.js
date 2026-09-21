"use client";

import RoleGuard from "../../components/RoleGuard";

export default function ResidentLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["resident"]}>
      {children}
    </RoleGuard>
  );
}