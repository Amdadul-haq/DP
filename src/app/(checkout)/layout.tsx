// src/app/(checkout)/layout.tsx
"use client";

import MinimalHeader from "@/components/landing/MinimalHeader";

export default function CheckoutLayout({
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
