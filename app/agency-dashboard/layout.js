"use client";

import ProtectedLayout from "@/app/protected-layout/layout";

export default function AgencyLayout({ children }) {
  return <ProtectedLayout expectedRole="agency">{children}</ProtectedLayout>;
}
