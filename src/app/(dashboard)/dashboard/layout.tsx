// src/app/(dashboard)/dashboard/layout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useUser, UserProvider } from "@/context/UserContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  User,
  CreditCard,
  LogOut,
  BriefcaseMedical,
  Menu,
} from "lucide-react";
import { LogoutConfirmDialog } from "@/components/logout-confirm-dialog";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Prescriptions", href: "/dashboard/prescriptions", icon: FileText },
  { name: "Lab Reports", href: "/dashboard/lab-reports", icon: FileText },
  { name: "Medicine", href: "/dashboard/medicine", icon: BriefcaseMedical },
  { name: "Assistants", href: "/dashboard/assistants", icon: Users },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </UserProvider>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, subscription, isLoadingSubscription, hasPendingPayment } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Route guard: Handle different roles
  useEffect(() => {
    if (!user) {
      setIsCheckingAccess(false);
      return;
    }

    const checkAccess = async () => {
      // Admin users: Should NOT be in doctor dashboard - redirect to admin panel
      if (user.role === "admin") {
        router.replace("/admin");
        return;
      }

      // Assistant users: Only allow patients route
      if (user.role === "assistant") {
        if (!pathname.startsWith("/dashboard/patients")) {
          router.replace("/dashboard/patients");
        }
        setIsCheckingAccess(false);
        return;
      }

      // Doctor users: Check subscription
      if (user.role === "doctor") {
        // Allow access to billing page to submit payment
        if (pathname === "/dashboard/billing") {
          setIsCheckingAccess(false);
          return;
        }

        // CRITICAL: Wait for subscription check to complete before making decision
        if (isLoadingSubscription) {
          // Still loading, keep showing loading state - DON'T set isCheckingAccess to false
          setIsCheckingAccess(true);
          return;
        }

        // AFTER loading is complete, check subscription
        if (!subscription) {
          console.log("[Dashboard] No active subscription found");
          
          // Check if user has pending payment request
          if (hasPendingPayment) {
            console.log("[Dashboard] User has pending payment, blocking access");
            toast.error("Payment Approval Pending", {
              description: "Your payment is under review. You'll get access once the admin approves it.",
              duration: 5000,
            });
            router.replace("/pricing");
            return;
          }
          
          // No subscription and no pending payment
          console.log("[Dashboard] Redirecting to pricing");
          toast.error("Subscription Required", {
            description: "Please purchase a subscription to access the dashboard.",
          });
          router.replace("/pricing");
          return;
        }

        // Has valid subscription
        console.log("[Dashboard] Active subscription found:", subscription.plan_name);
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
  }, [user, subscription, isLoadingSubscription, hasPendingPayment, pathname, router]);

  // Get the current page title for the header
  const getPageTitle = () => {
    if (pathname === "/dashboard/patients/new") {
      return "Add Patient";
    }

    const navItem = navigation.find((item) => item.href === pathname);
    return navItem?.name || "Dashboard";
  };

  // Filter navigation based on role
  const filteredNavigation = user
    ? user.role === "admin"
      ? [] // Admins don't see doctor navigation (they only see admin panel)
      : user.role === "assistant"
      ? navigation.filter((item) => item.name === "Patients")
      : navigation.filter(
          (item) => !(!user && ["Billing", "Assistants"].includes(item.name))
        )
    : [];

  // Show loading state while checking access
  if (isCheckingAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredNavigation.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 p-2 rounded hover:bg-muted ${
                            pathname === item.href ? "bg-muted" : ""
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup className="mt-auto">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <button
                        onClick={() => setLogoutDialogOpen(true)}
                        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span>Logout</span>
                      </button>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">
        <header className="bg-background border-b shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <div className="md:hidden mr-2">
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-4">
                    <nav className="flex flex-col gap-2">
                      <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                        Navigation
                      </h2>
                      {filteredNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-2 p-2 rounded hover:bg-muted ${
                            pathname === item.href ? "bg-muted" : ""
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      ))}

                      <button
                        onClick={() => {
                          setLogoutDialogOpen(true);
                          setSidebarOpen(false);
                        }}
                        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors mt-4"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span>Logout</span>
                      </button>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>

              <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user?.role !== "assistant" && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/prescriptions/new">
                    New Prescription
                  </Link>
                </Button>
              )}
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">
                  {user
                    ? `${user.firstName?.[0] ?? ""}${
                        user.lastName?.[0] ?? ""
                      }`.toUpperCase()
                    : ""}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none mx-auto">
            {children}
          </div>
        </main>
      </div>
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
      />
    </div>
  );
}
