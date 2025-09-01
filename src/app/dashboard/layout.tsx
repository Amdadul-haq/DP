// src/app/dashboard/layout.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider, // Add this import
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  FileText,
  User,
  CreditCard,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Prescriptions", href: "/dashboard/prescriptions", icon: FileText },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <SidebarProvider>
      {" "}
      {/* Wrap only the dashboard with SidebarProvider */}
      <div className="flex h-screen bg-background">
        {/* Sidebar for desktop */}
        <Sidebar className="hidden md:flex">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                        >
                          <Link href={item.href}>
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/logout">
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="bg-background border-b">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Toggle sidebar</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <Sidebar>
                      <SidebarContent>
                        <div className="flex items-center justify-between p-4">
                          <h2 className="text-lg font-semibold">
                            Digital Prescription
                          </h2>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(false)}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                        <SidebarGroup>
                          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                          <SidebarGroupContent>
                            <SidebarMenu>
                              {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton
                                      asChild
                                      isActive={pathname === item.href}
                                      onClick={() => setSidebarOpen(false)}
                                    >
                                      <Link href={item.href}>
                                        <Icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                      </Link>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                );
                              })}
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </SidebarGroup>
                        <SidebarGroup className="mt-auto">
                          <SidebarGroupContent>
                            <SidebarMenu>
                              <SidebarMenuItem>
                                <SidebarMenuButton
                                  asChild
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  <Link href="/logout">
                                    <LogOut className="h-5 w-5" />
                                    <span>Logout</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </SidebarGroup>
                      </SidebarContent>
                    </Sidebar>
                  </SheetContent>
                </Sheet>
                <h1 className="text-xl font-semibold ml-2 md:ml-0">
                  {navigation.find((item) => item.href === pathname)?.name ||
                    "Dashboard"}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/prescriptions/new">
                    New Prescription
                  </Link>
                </Button>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-sm">
                    DR
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
