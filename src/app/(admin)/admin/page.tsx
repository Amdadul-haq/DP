// src/app/(admin)/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  UserRoundCheck,
  Shield,
  Wallet,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalAssistants: number;
  totalAdmins: number;
  totalPaymentRequests: number;
  pendingPayments: number;
  approvedPayments: number;
  rejectedPayments: number;
  approvedAmountTotal: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  canceledSubscriptions: number;
  usersWithPendingPayment: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDoctors: 0,
    totalAssistants: 0,
    totalAdmins: 0,
    totalPaymentRequests: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
    approvedAmountTotal: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    canceledSubscriptions: 0,
    usersWithPendingPayment: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to load admin stats");
      }

      const data = await response.json();
      if (!data?.stats) {
        throw new Error("Invalid stats response");
      }

      setStats(data.stats as AdminStats);
    } catch {
      toast.error("Failed to load stats");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of system statistics</p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchStats(true)}
          disabled={isRefreshing}
          className="shrink-0"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
              <CardDescription>Assistants</CardDescription>
              <UserRoundCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{stats.totalAssistants}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Assistant accounts linked to doctors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Admin Accounts</CardDescription>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{stats.totalAdmins}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Users with admin access rights</p>
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

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Approved Amount</CardDescription>
              <Wallet className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-3xl text-emerald-600">{formatCurrency(stats.approvedAmountTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total approved payment amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Active Subscriptions</CardDescription>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <CardTitle className="text-3xl text-green-600">{stats.activeSubscriptions}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Currently active paid or free plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Users With Pending Payment</CardDescription>
              <CreditCard className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-3xl text-amber-600">{stats.usersWithPendingPayment}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Unique users waiting for approval</p>
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
                {stats.totalUsers} users across all roles
              </p>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
