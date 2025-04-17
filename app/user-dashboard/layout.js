"use client";

import ProtectedLayout from "@/app/protected-layout/layout";

export default function UserLayout({ children }) {
  return <ProtectedLayout expectedRole="user">{children}</ProtectedLayout>;
}
