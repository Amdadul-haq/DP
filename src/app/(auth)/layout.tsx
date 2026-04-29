// src/app/(auth)/layout.tsx
"use client";

import MinimalHeader from "@/components/landing/MinimalHeader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MinimalHeader />
      {children}
    </>
  );
}
