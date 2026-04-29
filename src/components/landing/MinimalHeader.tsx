// src/components/landing/MinimalHeader.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function MinimalHeader() {
  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">DP</span>
            </div>
            <span className="font-bold text-lg text-foreground">
              Digital Prescription
            </span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
