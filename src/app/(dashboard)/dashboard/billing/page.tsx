// src/app/(dashboard)/dashboard/billing/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CreditCard,
  Banknote,
  CheckCircle,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type InvoiceStatus = "pending" | "approved" | "rejected";

interface PaymentRequestItem {
  id: number;
  created_at: string;
  amount: string | number;
  status: InvoiceStatus;
  billing_cycle: "monthly" | "yearly";
  payment_method: string;
  sender_number_last_4: string;
  transaction_id: string;
  plan_name: string;
}

interface PlanItem {
  id: number;
  price_monthly: string | number;
  price_yearly: string | number;
}


export default function Billing() {
  const router = useRouter();
  const { subscription, setSubscription } = useUser();
  const [invoices, setInvoices] = useState<PaymentRequestItem[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? Number(value) : value;
    const safeValue = Number.isFinite(num) ? num : 0;
    return `৳${safeValue.toLocaleString("en-BD")}`;
  };

  const fetchInvoices = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setInvoices([]);
      setLoadingInvoices(false);
      return;
    }

    try {
      const response = await fetch("/api/payment/submit", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to load billing history");
      }

      const data = await response.json();
      setInvoices(Array.isArray(data.paymentRequests) ? data.paymentRequests : []);
    } catch (error) {
      console.error("Billing history fetch error:", error);
      setInvoices([]);
      toast.error("Failed to load billing history");
    } finally {
      setLoadingInvoices(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/plans");
      if (!response.ok) return;
      const data = await response.json();
      setPlans(Array.isArray(data.plans) ? data.plans : []);
    } catch (error) {
      console.error("Plans fetch error:", error);
    }
  };

  const refreshSubscription = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSubscription(null);
      return;
    }

    const response = await fetch("/api/auth/subscription", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to refresh subscription");
    }

    const data = await response.json();
    if (data.hasActiveSubscription && data.subscription) {
      setSubscription(data.subscription);
    } else {
      setSubscription(null);
    }
  };

  const cancelSubscription = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    setIsCancelling(true);
    try {
      const response = await fetch("/api/auth/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      toast.success(data.message || "Subscription cancelled successfully");
      await refreshSubscription();
      setCancelDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Cancel subscription error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel subscription"
      );
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchPlans();
    refreshSubscription().catch((error) => {
      console.error("Subscription refresh error:", error);
    });
  }, []);

  const paymentMethods = useMemo(() => {
    const map = new Map<string, { payment_method: string; sender_number_last_4: string }>();
    for (const invoice of invoices) {
      const key = `${invoice.payment_method}-${invoice.sender_number_last_4}`;
      if (!map.has(key)) {
        map.set(key, {
          payment_method: invoice.payment_method,
          sender_number_last_4: invoice.sender_number_last_4,
        });
      }
    }
    return Array.from(map.values());
  }, [invoices]);

  const currentPlanPrice = useMemo(() => {
    if (!subscription) return null;
    const plan = plans.find((item) => item.id === Number(subscription.plan_id));
    if (!plan) return null;

    const amount =
      subscription.billing_cycle === "yearly" ? plan.price_yearly : plan.price_monthly;
    return formatCurrency(amount);
  }, [plans, subscription]);

  const renderInvoiceStatus = (status: InvoiceStatus) => {
    if (status === "approved") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">paid</Badge>
      );
    }
    if (status === "pending") {
      return <Badge variant="secondary">pending</Badge>;
    }
    return <Badge variant="destructive">rejected</Badge>;
  };

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
                  {currentPlanPrice ?? "-"}
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
                  <Button
                    variant="outline"
                    onClick={() => router.push("/pricing?upgrade=true")}
                  >
                    Change Plan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={isCancelling}
                  >
                    Cancel Subscription
                  </Button>
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
            <CardDescription>Methods used in your recent payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.length > 0 ? (
              paymentMethods.map((method, index) => (
                <div
                  key={`${method.payment_method}-${method.sender_number_last_4}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{method.payment_method.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        Sender ending in {method.sender_number_last_4}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No payment methods found from your billing history.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingInvoices ? (
            <p className="text-sm text-muted-foreground">Loading billing history...</p>
          ) : invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices found yet.</p>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Banknote className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">INV-{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString()} | {invoice.plan_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        TXN: {invoice.transaction_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                    {renderInvoiceStatus(invoice.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current plan will be cancelled. You can re-subscribe later from the pricing page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                cancelSubscription();
              }}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
