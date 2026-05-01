// app/(checkout)/layout.tsx
"use client";

import { UserProvider } from "@/context/UserContext";
import MinimalHeader from "@/components/landing/MinimalHeader";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <MinimalHeader />
      {children}
    </UserProvider>
  );
}
