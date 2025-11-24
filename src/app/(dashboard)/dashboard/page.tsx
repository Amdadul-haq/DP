// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface DashboardStats {
  totalPatients: number;
  previousTotalPatients: number;
  totalPrescriptions: number;
  previousTotalPrescriptions: number;
  monthlyPrescriptions: number;
  previousMonthlyPrescriptions: number;
  analytics: Array<{
    month: string;
    prescriptions: number;
  }>;
}

interface RecentPrescription {
  id: number;
  patient_name: string;
  diagnosis: string;
  created_at: string;
  patient_number: number;
}

// Helper function for percentage calculation
const calculatePercentageChange = (
  current: number,
  previous: number
): { value: string; isPositive: boolean } => {
  if (previous === 0) {
    return {
      value: current > 0 ? "+100%" : "0%",
      isPositive: current > 0,
    };
  }
  const change = ((current - previous) / previous) * 100;
  const roundedChange = Math.round(change);
  return {
    value: `${roundedChange >= 0 ? "+" : ""}${roundedChange}%`,
    isPositive: roundedChange >= 0,
  };
};

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPrescriptions, setRecentPrescriptions] = useState<
    RecentPrescription[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [statsResponse, prescriptionsResponse] = await Promise.all([
        fetch("/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/prescriptions/recent?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsResponse.ok && prescriptionsResponse.ok) {
        const statsData = await statsResponse.json();
        const prescriptionsData = await prescriptionsResponse.json();

        setStats(statsData);
        setRecentPrescriptions(prescriptionsData.prescriptions || []);
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic stats data with calculated percentages
  const statsData = stats
    ? [
        {
          label: "Total Patients",
          value: stats.totalPatients.toString(),
          icon: Users,
          change: calculatePercentageChange(
            stats.totalPatients,
            stats.previousTotalPatients
          ),
        },
        {
          label: "Prescriptions This Month",
          value: stats.monthlyPrescriptions.toString(),
          icon: FileText,
          change: calculatePercentageChange(
            stats.monthlyPrescriptions,
            stats.previousMonthlyPrescriptions
          ),
        },
        {
          label: "Total Prescriptions",
          value: stats.totalPrescriptions.toString(),
          icon: FileText,
          change: calculatePercentageChange(
            stats.totalPrescriptions,
            stats.previousTotalPrescriptions
          ),
        },
      ]
    : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold text-foreground">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground">
          {user?.role === "assistant"
            ? `Welcome back, ${user?.firstName} ${user?.lastName}. You are logged in as an Assistant.`
            : `Welcome back, Dr. ${user?.firstName} ${user?.lastName}. Here's what's happening with your practice today.`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.change.isPositive ? TrendingUp : TrendingDown;

          return (
            <Card key={index} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div
                  className={`flex items-center text-xs ${
                    stat.change.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendIcon className="h-3 w-3 mr-1" />
                  <span>{stat.change.value} from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Prescriptions Chart */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Monthly Prescriptions</CardTitle>
            <CardDescription>
              Prescription trends over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.analytics || []}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="prescriptions"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    className="opacity-80"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
            <CardDescription>Latest prescription activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {prescription.patient_name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        #{prescription.patient_number}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {prescription.diagnosis}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(prescription.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 shrink-0 ml-4 group-hover:bg-green-100 transition-colors"
                  >
                    Completed
                  </Badge>
                </div>
              ))}

              {recentPrescriptions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No prescriptions found</p>
                  <p className="text-sm">
                    Create your first prescription to get started
                  </p>
                </div>
              )}
            </div>

            {recentPrescriptions.length > 0 && (
              <Button variant="outline" className="w-full mt-6" asChild>
                <Link href="/dashboard/prescriptions">
                  View All Prescriptions
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton Loader Component
function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
            <Skeleton className="h-10 w-full mt-6" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
