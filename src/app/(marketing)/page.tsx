// src/app/(marketing)/page.tsx
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import DemoWithPrescriptionTemplate from "@/components/landing/DemoWithPrescriptionTemplate";
export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <DemoWithPrescriptionTemplate />
    </main>
  );
}
