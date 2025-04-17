"use client";

import ProtectedLayout from "@/app/protected-layout/layout";

export default function AdminLayout({ children }) {
  return <ProtectedLayout expectedRole="admin">{children}</ProtectedLayout>;
}
