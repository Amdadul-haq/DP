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
import { Users, FileText, TrendingUp, TrendingDown, Calendar } from "lucide-react";
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
  prescription_number: number;
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
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">
          Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          {user?.role === "assistant"
            ? `Welcome back, ${user?.firstName} ${user?.lastName}`
            : `Welcome back, Dr. ${user?.firstName} ${user?.lastName}`}
        </p>
      </div>

      {/* Stats Cards with Enhanced Styling */}
      <div className="grid gap-5 md:grid-cols-3">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.change.isPositive ? TrendingUp : TrendingDown;
          
          // Color schemes for different cards
          const colorSchemes = [
            {
              bg: "bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent",
              border: "border-blue-200/50 dark:border-blue-800/50",
              accent: "text-blue-600 dark:text-blue-400",
              iconBg: "bg-blue-100/50 dark:bg-blue-900/30",
              trendPositive: "text-emerald-600 dark:text-emerald-400",
              trendNegative: "text-red-600 dark:text-red-400",
            },
            {
              bg: "bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent",
              border: "border-emerald-200/50 dark:border-emerald-800/50",
              accent: "text-emerald-600 dark:text-emerald-400",
              iconBg: "bg-emerald-100/50 dark:bg-emerald-900/30",
              trendPositive: "text-emerald-600 dark:text-emerald-400",
              trendNegative: "text-red-600 dark:text-red-400",
            },
            {
              bg: "bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent",
              border: "border-amber-200/50 dark:border-amber-800/50",
              accent: "text-amber-600 dark:text-amber-400",
              iconBg: "bg-amber-100/50 dark:bg-amber-900/30",
              trendPositive: "text-emerald-600 dark:text-emerald-400",
              trendNegative: "text-red-600 dark:text-red-400",
            },
          ];

          const scheme = colorSchemes[index];

          return (
            <Card 
              key={index} 
              className={`relative w-full border ${scheme.border} overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-opacity-100 group`}
            >
              {/* Background gradient effect */}
              <div className={`absolute inset-0 ${scheme.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      {stat.label}
                    </p>
                    <h3 className={`text-4xl font-bold ${scheme.accent} transition-colors duration-300`}>
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`${scheme.iconBg} p-4 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-7 w-7 ${scheme.accent}`} />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <div className={`flex items-center gap-1 ${stat.change.isPositive ? scheme.trendPositive : scheme.trendNegative}`}>
                    <TrendIcon className="h-4 w-4" />
                    <span>{stat.change.value}</span>
                  </div>
                  <span className="text-muted-foreground text-xs font-normal">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Monthly Prescriptions Chart */}
        <Card className="w-full shadow-lg border-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
          <CardHeader className="pb-4 relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Prescription Trends</CardTitle>
                <CardDescription className="mt-2 text-xs">
                  Monthly activity overview
                </CardDescription>
              </div>
              <div className="p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-xl backdrop-blur-sm">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="h-80 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={stats?.analytics || []}
                  margin={{ top: 5, right: 20, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    className="opacity-10"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "10px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    }}
                    cursor={{ fill: "rgba(0,0,0,0.02)" }}
                    formatter={(value) => [value, "Prescriptions"]}
                  />
                  <Bar
                    dataKey="prescriptions"
                    fill="url(#barGradient)"
                    radius={[12, 12, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="w-full shadow-lg border-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
          <CardHeader className="pb-4 relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                <CardDescription className="mt-2 text-xs">
                  Latest prescriptions
                </CardDescription>
              </div>
              <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl backdrop-blur-sm">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {recentPrescriptions.map((prescription) => (
                <Link
                  key={prescription.prescription_number}
                  href={`/dashboard/prescriptions/${prescription.prescription_number}/preview`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3.5 border border-transparent rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 hover:border-emerald-200/50 dark:hover:border-emerald-800/50 hover:shadow-md transition-all duration-200 group">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {prescription.patient_name}
                        </p>
                        <Badge variant="secondary" className="text-xs shrink-0 font-medium">
                          #{prescription.patient_number}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate group-hover:text-muted-foreground transition-colors">
                        {prescription.diagnosis}
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {formatDate(prescription.created_at)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/50 shrink-0 ml-3 font-medium text-xs"
                    >
                      Completed
                    </Badge>
                  </div>
                </Link>
              ))}

              {recentPrescriptions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <div className="p-4 bg-muted/50 rounded-xl mb-3">
                    <FileText className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="font-semibold text-sm">No prescriptions yet</p>
                  <p className="text-xs mt-1 text-muted-foreground/70">
                    Create your first prescription to get started
                  </p>
                </div>
              )}
            </div>

            {recentPrescriptions.length > 0 && (
              <Button 
                variant="ghost"
                className="w-full mt-3 h-9 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold text-sm" 
                asChild
              >
                <Link href="/dashboard/prescriptions">
                  View all prescriptions →
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
    <div className="w-full space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-5 md:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="w-full border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <Skeleton className="h-3 w-24 mb-3" />
                  <Skeleton className="h-10 w-20" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="w-full shadow-lg border-0">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>

        <Card className="w-full shadow-lg border-0">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
