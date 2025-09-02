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
  SidebarProvider,
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
        </SidebarProvider>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">
        <header className="bg-background border-b shrink-0">
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
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
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
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Navigation
                          </h3>
                          <nav className="space-y-1">
                            {navigation.map((item) => {
                              const Icon = item.icon;
                              const isActive = pathname === item.href;
                              return (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive
                                      ? "bg-accent text-accent-foreground"
                                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                  }`}
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  <Icon className="h-5 w-5 mr-3" />
                                  <span>{item.name}</span>
                                </Link>
                              );
                            })}
                          </nav>
                        </div>
                        <div className="mt-auto">
                          <Link
                            href="/logout"
                            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            onClick={() => setSidebarOpen(false)}
                          >
                            <LogOut className="h-5 w-5 mr-3" />
                            <span>Logout</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
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

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
