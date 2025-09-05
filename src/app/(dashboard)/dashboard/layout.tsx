// src/app/(dashboard)/dashboard/layout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useUser, UserProvider } from "@/context/UserContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Route guard: only restrict assistants, not doctors
  useEffect(() => {
    if (
      user &&
      user.role === "assistant" &&
      !pathname.startsWith("/dashboard/patients")
    ) {
      router.replace("/dashboard/patients");
    }
    // No restriction for doctors
  }, [user, pathname, router]);

  // Get the current page title for the header
  const getPageTitle = () => {
    if (pathname === "/dashboard/patients/new") {
      return "Add Patient";
    }

    const navItem = navigation.find((item) => item.href === pathname);
    return navItem?.name || "Dashboard";
  };

  // Assistants only see Patients
  const filteredNavigation =
    user && user.role === "assistant"
      ? navigation.filter((item) => item.name === "Patients")
      : navigation.filter(
          (item) => !(!user && ["Billing", "Assistants"].includes(item.name))
        );

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
