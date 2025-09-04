// src/app/(marketing)/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPlanById, type Plan } from "@/lib/plans";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId) {
      const selectedPlan = getPlanById(planId);
      if (selectedPlan) {
        setPlan(selectedPlan);
      } else {
        toast.error("Invalid plan selected");
        router.push("/pricing");
      }
    } else {
      router.push("/pricing");
    }
  }, [searchParams, router]);

  const handleSubscribe = async () => {
    if (!plan) return;

    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: plan.id, // This should now be "1", "2", or "3"
          billingCycle,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Subscription created successfully!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        throw new Error(data.error || "Failed to create subscription");
      }
    } catch (error) {
      toast.error("Failed to create subscription. Please try again.");
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading plan details...</p>
        </div>
      </div>
    );
  }

  const price =
    billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const period = billingCycle === "monthly" ? "month" : "year";

  return (
    <div className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Complete Your Subscription
          </h1>
          <p className="text-xl text-muted-foreground">
            Review your plan details and confirm your subscription
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Order Summary
              </h2>

              <div className="flex justify-between items-center mb-6 p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {plan.name} Plan
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {plan.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">
                    ${price}/{period}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {billingCycle} billing
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3">
                  Billing Cycle
                </h4>
                <div className="flex gap-4">
                  <Button
                    variant={billingCycle === "monthly" ? "default" : "outline"}
                    onClick={() => setBillingCycle("monthly")}
                    className="flex-1"
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={billingCycle === "yearly" ? "default" : "outline"}
                    onClick={() => setBillingCycle("yearly")}
                    className="flex-1"
                  >
                    Yearly
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">$0.00</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">
                      ${price}/{period}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Plan Features
              </h2>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubscribe}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Confirm & Subscribe"}
              </Button>

              <p className="text-sm text-muted-foreground mt-4 text-center">
                Your subscription will automatically renew until canceled.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
