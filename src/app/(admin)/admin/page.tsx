// src/app/(admin)/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalPaymentRequests: number;
  pendingPayments: number;
  approvedPayments: number;
  rejectedPayments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDoctors: 0,
    totalPaymentRequests: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch users count
      const usersResponse = await fetch("/api/admin/users/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch payment requests
      const paymentsResponse = await fetch("/api/admin/payment-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        const requests = paymentsData.paymentRequests || [];
        
        setStats({
          totalUsers: 0, // Will implement later
          totalDoctors: 0, // Will implement later
          totalPaymentRequests: requests.length,
          pendingPayments: requests.filter((r: any) => r.status === "pending").length,
          approvedPayments: requests.filter((r: any) => r.status === "approved").length,
          rejectedPayments: requests.filter((r: any) => r.status === "rejected").length,
        });
      }
    } catch (error) {
      toast.error("Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of system statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Users</CardDescription>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{stats.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              All registered users in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Doctors</CardDescription>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{stats.totalDoctors}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Registered doctors with accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Payment Requests</CardDescription>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{stats.totalPaymentRequests}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Total payment submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Pending Payments</CardDescription>
              <CreditCard className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-3xl text-amber-600">{stats.pendingPayments}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Awaiting admin approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Approved Payments</CardDescription>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <CardTitle className="text-3xl text-green-600">{stats.approvedPayments}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Rejected Payments</CardDescription>
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <CardTitle className="text-3xl text-red-600">{stats.rejectedPayments}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Rejected requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/payment-requests"
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="font-medium">Review Payment Requests</p>
              <p className="text-sm text-muted-foreground">
                {stats.pendingPayments} pending approval
              </p>
            </div>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </a>

          <a
            href="/admin/users"
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="font-medium">Manage Users</p>
              <p className="text-sm text-muted-foreground">
                View all system users
              </p>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
