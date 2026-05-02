// src/components/landing/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Demo", href: "#demo" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <motion.nav
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold">DP</span>
              </div>
              <span className="font-bold text-xl text-foreground">
                Digital Prescription
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu - Using Sheet with sidebar styling */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-96 p-0">
                {/* Add SheetTitle for accessibility */}
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                <div className="flex flex-col h-full">
                  {/* Navigation Section */}
                  <div className="flex-1 py-6">
                    <div className="px-6 py-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Navigation
                      </h3>
                    </div>
                    <nav className="px-3 space-y-1">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-muted transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                  </div>

                  {/* Account Section */}
                  <div className="mt-auto border-t">
                    <div className="px-6 py-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Account
                      </h3>
                    </div>
                    <div className="px-3 space-y-2 pb-6">
                      <Button
                        variant="outline"
                        className="w-full justify-center"
                        asChild
                      >
                        <Link
                          href="/login"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Login
                        </Link>
                      </Button>
                      <Button className="w-full justify-center" asChild>
                        <Link
                          href="/register"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Get Started
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
