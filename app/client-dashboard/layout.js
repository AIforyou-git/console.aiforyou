"use client";

import ProtectedLayout from "@/app/protected-layout/layout";

export default function ClientLayout({ children }) {
  return <ProtectedLayout expectedRole="client">{children}</ProtectedLayout>;
}
