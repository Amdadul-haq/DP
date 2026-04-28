// src/app/(marketing)/pricing/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const router = useRouter();

  useEffect(() => {
    // Get token and user from localStorage
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    const storedUser = localStorage.getItem("user");
    let userRole = null;
    if (storedUser) {
      try {
        userRole = JSON.parse(storedUser).role;
      } catch {}
    }
    // If assistant, redirect to patients
    if (userRole === "assistant") {
      router.replace("/dashboard/patients");
      return;
    }
    // If not logged in, redirect to login
    if (!storedToken) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/plans", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setPlans(data.plans);
          // Set the default selected plan to the first non-free plan
          const nonFreePlan = data.plans.find((plan: Plan) => plan.name !== "Free");
          if (nonFreePlan) {
            setSelectedPlan(nonFreePlan.id);
          }
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Session expired. Please login again.");
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, [router]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleChoosePlan = async (planId: string) => {
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    const selectedPlan = plans.find((plan) => plan.id === planId);
    if (selectedPlan?.name === "Free") {
      router.push(`/checkout?plan=${planId}&cycle=${billingCycle}`);
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
          planId,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Plan validated, proceed to checkout/payment page
        router.push(`/checkout?plan=${planId}&cycle=${billingCycle}`);
      } else {
        if (response.status === 401) {
          // Token is invalid, redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Session expired. Please login again.");
          router.push("/login");
        } else {
          throw new Error(data.error || "Failed to validate plan");
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to process your request. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that works best for your medical practice.
          </p>

          <div className="mt-8 flex justify-center">
            <div className="relative flex items-center p-1 bg-muted rounded-lg">
              <button
                type="button"
                className={`relative py-2 px-6 rounded-md ${
                  billingCycle === "monthly"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                } transition-colors duration-200 ease-in-out`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`relative py-2 px-6 rounded-md ${
                  billingCycle === "yearly"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                } transition-colors duration-200 ease-in-out`}
                onClick={() => setBillingCycle("yearly")}
              >
                Yearly
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isHighlighted = plan.name === "Professional" && isSelected;
            const isFree = plan.name === "Free";
            const isDisabled = isFree && billingCycle === "yearly";
            // Free plan only has monthly option
            const price =
              (isFree || billingCycle === "monthly")
                ? plan.price_monthly
                : plan.price_yearly;
            const period = (isFree || billingCycle === "monthly") ? "month" : "year";

            return (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                className="h-full"
              >
                <Card
                  className={`h-full transition-all ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed border border-border"
                      : isSelected
                      ? "border-2 border-primary shadow-xl cursor-pointer"
                      : "border border-border hover:border-primary/50 hover:shadow-md cursor-pointer"
                  }`}
                  onClick={() => !isDisabled && handlePlanSelect(plan.id)}
                >
                  <CardContent className="p-8">
                    {isHighlighted && (
                      <div className="inline-block bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full mb-4">
                        Most Popular
                      </div>
                    )}
                    {isSelected && !isHighlighted && (
                      <div className="inline-block bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full mb-4">
                        Selected
                      </div>
                    )}
                    {billingCycle === "yearly" &&
                      !isFree &&
                      plan.price_yearly < plan.price_monthly * 12 && (
                        <div className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full mb-4 ml-2">
                          Save{" "}
                          {Math.round(
                            (1 -
                              plan.price_yearly / (plan.price_monthly * 12)) *
                              100
                          )}
                          %
                        </div>
                      )}

                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-4xl font-bold text-foreground">
                        ৳{price}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        /{period}
                      </span>
                    </div>
                    {isFree && billingCycle === "yearly" && (
                      <p className="text-sm text-amber-600 mb-2">Free plan is only available monthly</p>
                    )}
                    <p className="text-muted-foreground mb-6">
                      {plan.description}
                    </p>

                    <ul className="mb-8 space-y-3">
                      {plan.features.map(
                        (feature: string, featureIndex: number) => (
                          <li key={featureIndex} className="flex items-center">
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
                            <span className="text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        )
                      )}
                    </ul>

                    <Button
                      className={`w-full ${
                        isSelected
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                      onClick={() => handleChoosePlan(plan.id)}
                      disabled={isDisabled}
                    >
                      {isDisabled ? "Not Available" : "Choose Plan"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
