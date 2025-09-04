// src/app/(dashboard)/dashboard/billing/page.tsx
"use client";
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
  CreditCard,
  Download,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@/context/UserContext";


export default function Billing() {
  const { subscription } = useUser();

  const invoices = [
    { id: "INV-001", date: "Sep 15, 2023", amount: "$49.00", status: "paid" },
    { id: "INV-002", date: "Aug 15, 2023", amount: "$49.00", status: "paid" },
    { id: "INV-003", date: "Jul 15, 2023", amount: "$49.00", status: "paid" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-3xl font-bold text-foreground">
          Billing & Subscription
        </h2>
        <p className="text-muted-foreground">
          Manage your subscription plan and billing information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your current subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{subscription.plan_name}</h3>
                    <p className="text-muted-foreground">{subscription.billing_cycle}</p>
                  </div>
                  <Badge
                    variant={subscription.status === "active" ? "default" : "secondary"}
                    className={subscription.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                  >
                    {subscription.status}
                  </Badge>
                </div>
                <div className="text-3xl font-bold">
                  {/* You may want to show price from plan info if available */}
                  {/* Example: $10/month or $115/year */}
                  {/* You may want to show price from plan info if available */}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{subscription.billing_cycle}
                  </span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Plan includes:</h4>
                  <ul className="space-y-1">
                    {subscription.features?.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Next billing date: {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "-"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Change Plan</Button>
                  <Button variant="outline">Cancel Subscription</Button>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">No active subscription found.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Your saved payment methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-muted-foreground">
                    Expires 12/2024
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>

            <Button variant="outline" className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-medium">{invoice.amount}</span>
                  <Badge
                    variant={
                      invoice.status === "paid" ? "default" : "secondary"
                    }
                    className={
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : ""
                    }
                  >
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
