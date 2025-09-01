// src/app/dashboard/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  CreditCard,
  ArrowUpRight,
  Calendar,
  Activity,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const stats = [
    { label: "Total Patients", value: "124", icon: Users, change: "+12%" },
    {
      label: "Prescriptions This Month",
      value: "42",
      icon: FileText,
      change: "+8%",
    },
    { label: "Revenue", value: "$1,240", icon: CreditCard, change: "+5%" },
  ];

  const recentPrescriptions = [
    {
      id: "1",
      patientName: "Sarah Johnson",
      date: new Date().toLocaleDateString(),
      diagnosis: "Hypertension",
      status: "Completed",
    },
    {
      id: "2",
      patientName: "Michael Brown",
      date: new Date(Date.now() - 86400000).toLocaleDateString(),
      diagnosis: "Diabetes Type II",
      status: "Completed",
    },
    {
      id: "3",
      patientName: "Emily Wilson",
      date: new Date(Date.now() - 172800000).toLocaleDateString(),
      diagnosis: "Upper Respiratory Infection",
      status: "Completed",
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-3xl font-bold text-foreground">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground">
          Welcome back, Dr. Smith. Here&apos;s what&apos;s happening with your practice
          today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from
                  last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
            <CardDescription>Your most recent prescriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{prescription.patientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.diagnosis}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {prescription.date}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    {prescription.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/prescriptions">View All</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">
                      10:00 AM - Follow-up
                    </p>
                  </div>
                </div>
                <Badge variant="outline">30 min</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Michael Brown</p>
                    <p className="text-sm text-muted-foreground">
                      2:30 PM - New patient
                    </p>
                  </div>
                </div>
                <Badge variant="outline">45 min</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Schedule New Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
