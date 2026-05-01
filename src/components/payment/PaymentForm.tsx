// components/payment/PaymentForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2, Copy, Check } from "lucide-react";
import type { PaymentMethod, PaymentConfig } from "@/types/payment";
import type { Plan } from "@/lib/plans";

interface PaymentFormProps {
  plan: Plan;
  billingCycle: "monthly" | "yearly";
  onBack: () => void;
}

export default function PaymentForm({ plan, billingCycle, onBack }: PaymentFormProps) {
  const router = useRouter();
  const pendingFlowKey = `checkout:payment-pending:${plan.id}`;
  const [paymentMethods, setPaymentMethods] = useState<PaymentConfig[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<PaymentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    transactionId: "",
    senderNumberLast4: "",
  });

  const amount = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(pendingFlowKey);
      if (!stored) return;

      const parsed = JSON.parse(stored) as { planId?: string; billingCycle?: string };
      if (parsed?.planId === plan.id) {
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Failed to restore pending payment state:", error);
    }
  }, [pendingFlowKey, plan.id]);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Polling effect: Check subscription status every 5 seconds after payment submission
  useEffect(() => {
    if (!showSuccess) return;

    setIsPolling(true);

    const pollSubscriptionStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/auth/subscription", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // For upgrades, only treat as success when the active plan matches the selected plan.
          const selectedPlanId = Number(plan.id);
          const activePlanId = Number(data.subscription?.plan_id);
          const isSelectedPlanActive =
            data.hasActiveSubscription &&
            Number.isFinite(selectedPlanId) &&
            selectedPlanId === activePlanId;

          if (isSelectedPlanActive) {
            setIsPolling(false);
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            localStorage.removeItem(pendingFlowKey);
            toast.success("Subscription activated!", {
              description: "Redirecting to your dashboard...",
            });
            setTimeout(() => {
             // router.replace("/dashboard");
              window.location.href = "/dashboard";
            }, 1500);
          }
        }
      } catch (error) {
        console.error("Error polling subscription status:", error);
      }
    };

    // Start polling every 5 seconds
    pollingIntervalRef.current = setInterval(pollSubscriptionStatus, 5000);

    // Initial poll immediately
    pollSubscriptionStatus();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [showSuccess, router]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payment/config");
      const data = await response.json();
      if (response.ok) {
        setPaymentMethods(data.paymentMethods);
      }
    } catch {
      toast.error("Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    const config = paymentMethods.find((pm) => pm.payment_method === method);
    setSelectedConfig(config || null);
  };

  const handleCopyNumber = () => {
    if (selectedConfig) {
      navigator.clipboard.writeText(selectedConfig.account_number);
      setCopied(true);
      toast.success("Account number copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMethod || !formData.transactionId || !formData.senderNumberLast4) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.senderNumberLast4.length !== 4) {
      toast.error("Please enter exactly 4 digits of your number");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payment/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
          paymentMethod: selectedMethod,
          transactionId: formData.transactionId,
          senderNumberLast4: formData.senderNumberLast4,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(
          pendingFlowKey,
          JSON.stringify({ planId: String(plan.id), billingCycle })
        );
        setShowSuccess(true);
        toast.success("Payment request submitted successfully!");
      } else {
        toast.error(data.error || "Failed to submit payment request");
      }
    } catch (error) {
      toast.error("Failed to submit payment request. Please try again.");
      console.error("Payment submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Request Submitted!</CardTitle>
          <CardDescription className="text-base mt-2">
            Your payment request has been received and is awaiting admin verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <p className="font-medium mb-2">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Our admin will verify your payment details</li>
                <li>This usually takes 2-24 hours</li>
                <li>Once approved, your subscription will be activated automatically</li>
                <li>You&apos;ll be able to access all premium features</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Payment Details:</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Method:</span> {selectedMethod?.toUpperCase()}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Amount:</span> ৳{amount}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Plan:</span> {plan.name} ({billingCycle})
            </p>
          </div>

          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-medium">✓ Auto-Detection Enabled</p>
                </div>
                {isPolling && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Checking status...</span>
                  </div>
                )}
              </div>
              <p className="text-sm mt-2">
                We&apos;re automatically checking your subscription status. Once your payment is approved, you&apos;ll be redirected to your dashboard instantly.
              </p>
            </AlertDescription>
          </Alert>

          <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <p className="font-medium">⏳ Pending Approval</p>
              <p className="text-sm mt-1">
                Your payment is under review. You can stay on this page while we check for updates, or come back later using your login credentials.
              </p>
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                localStorage.removeItem(pendingFlowKey);
                router.push("/pricing");
              }}
              className="flex-1"
              variant="outline"
              disabled={isPolling}
            >
              Back to Pricing
            </Button>
            <Button
              onClick={() => {
                localStorage.removeItem(pendingFlowKey);
                router.push("/");
              }}
              variant="outline"
              className="flex-1"
              disabled={isPolling}
            >
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-fit mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>
          Select your payment method and complete the transaction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Summary */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{plan.name} Plan</p>
              <p className="text-sm text-muted-foreground">
                {billingCycle === "monthly" ? "Monthly" : "Yearly"} Billing
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">৳{amount}</p>
              <p className="text-sm text-muted-foreground">
                {billingCycle === "monthly" ? "/month" : "/year"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Payment Method</Label>
            <RadioGroup value={selectedMethod || ""} onValueChange={(value) => handleMethodSelect(value as PaymentMethod)}>
              <div className="grid grid-cols-1 gap-3">
                {paymentMethods.map((method) => (
                  <div key={method.payment_method}>
                    <RadioGroupItem
                      value={method.payment_method}
                      id={method.payment_method}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={method.payment_method}
                      className="flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {method.payment_method[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{method.payment_method}</p>
                          <p className="text-sm text-muted-foreground">{method.account_name}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Payment Instructions */}
          {selectedConfig && (
            <Alert>
              <AlertDescription>
                <p className="font-semibold mb-3">Payment Instructions:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Open your {selectedConfig.payment_method.toUpperCase()} app</li>
                  <li>Send ৳{amount} to the following number:</li>
                </ol>
                <div className="mt-3 p-3 bg-background rounded-lg border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Account Number</p>
                    <p className="text-lg font-bold font-mono">{selectedConfig.account_number}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedConfig.account_name}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyNumber}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <ol start={3} className="list-decimal list-inside space-y-2 text-sm mt-3">
                  <li>Complete the transaction</li>
                  <li>Note down the Transaction ID (TrxID) from your app</li>
                  <li>Fill in the form below with your payment details</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  {selectedConfig.instructions}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Details Form */}
          {selectedMethod && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transactionId">
                  Transaction ID (TrxID) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="transactionId"
                  placeholder="Enter your transaction ID"
                  value={formData.transactionId}
                  onChange={(e) =>
                    setFormData({ ...formData, transactionId: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  You&apos;ll find this in your payment confirmation message
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senderNumber">
                  Last 4 Digits of Your Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="senderNumber"
                  placeholder="1234"
                  maxLength={4}
                  value={formData.senderNumberLast4}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      senderNumberLast4: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the last 4 digits of the number you sent money from
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!selectedMethod || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Payment Request"
            )}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          By submitting, you confirm that you have completed the payment transaction.
          Your request will be verified by our admin within 24 hours.
        </p>
      </CardContent>
    </Card>
  );
}
