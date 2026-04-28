// src/app/(marketing)/checkout/page.tsx
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPlanById, type Plan } from "@/lib/plans";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PaymentForm from "@/components/payment/PaymentForm";


export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><p className="text-muted-foreground">Loading plan details...</p></div></div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId) {
      const selectedPlan = getPlanById(planId);
      if (selectedPlan) {
        setPlan(selectedPlan);
        // Force monthly billing for Free plan
        if (selectedPlan.name === "Free") {
          setBillingCycle("monthly");
        }
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

    if (isSubmittingRef.current) {
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    const isFree = plan.name === "Free";
    
    // If Free plan, create subscription directly (no payment needed)
    if (isFree) {
      isSubmittingRef.current = true;
      setIsLoading(true);
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planId: plan.id,
            billingCycle,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success("Free Plan activated successfully!", {
            description: `Valid until ${new Date(data.subscription.valid_until).toLocaleDateString()}`,
          });
          
          // Refresh the page to reload user context with new subscription
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500);
        } else {
          toast.error("Activation failed", {
            description: data.error || "Failed to activate subscription",
          });
        }
      } catch (error) {
        toast.error("Failed to create subscription. Please try again.");
        console.error("Checkout error:", error);
      } finally {
        isSubmittingRef.current = false;
        setIsLoading(false);
      }
    } else {
      // For paid plans, show payment form
      setShowPaymentForm(true);
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

  const isFree = plan.name === "Free";
  // Free plan only has monthly option
  const price = (isFree || billingCycle === "monthly") ? plan.monthlyPrice : plan.yearlyPrice;
  const period = (isFree || billingCycle === "monthly") ? "month" : "year";

  // Show payment form for paid plans
  if (showPaymentForm && !isFree) {
    return (
      <div className="min-h-screen py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <PaymentForm 
            plan={plan} 
            billingCycle={billingCycle}
            onBack={() => setShowPaymentForm(false)}
          />
        </div>
      </div>
    );
  }

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
              <h2 className="text-2xl font-bold text-foreground mb-6">Order Summary</h2>
              <div className="flex justify-between items-center mb-6 p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="font-semibold text-foreground">{plan.name} Plan</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">৳{price}/{period}</p>
                  <p className="text-muted-foreground text-sm">{billingCycle} billing</p>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3">Billing Cycle</h4>
                {isFree && (
                  <p className="text-sm text-amber-600 mb-2">Free plan is only available monthly</p>
                )}
                <div className="flex gap-4">
                  <Button variant={billingCycle === "monthly" ? "default" : "outline"} onClick={() => setBillingCycle("monthly")} className="flex-1">Monthly</Button>
                  <Button variant={billingCycle === "yearly" ? "default" : "outline"} onClick={() => setBillingCycle("yearly")} className="flex-1" disabled={isFree}>Yearly</Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">৳{price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">৳0.00</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">৳{price}/{period}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Plan Features</h2>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" size="lg" onClick={handleSubscribe} disabled={isLoading}>
                {isLoading ? "Processing..." : isFree ? "Confirm & Subscribe" : "Proceed to Payment"}
              </Button>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                {isFree 
                  ? "Your free subscription will automatically renew until canceled."
                  : "You will be redirected to complete your payment."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
