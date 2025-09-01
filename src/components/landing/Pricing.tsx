// src/components/landing/Pricing.tsx
"use client";

import { useState } from "react";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  saving?: string;
}

const plans: Record<string, Plan[]> = {
  monthly: [
    {
      name: "Starter",
      price: "$19",
      period: "month",
      description: "For individual practitioners with basic needs",
      features: [
        "Up to 30 prescriptions per month",
        "Basic medicine database access",
        "Patient management",
        "PDF download",
        "Email support",
      ],
      cta: "Get Started",
    },
    {
      name: "Professional",
      price: "$49",
      period: "month",
      description: "For established practices with higher volume",
      features: [
        "Unlimited prescriptions",
        "Full medicine database access",
        "Advanced patient management",
        "Custom prescription templates",
        "Priority support",
      ],
      cta: "Get Started",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "month",
      description: "For clinics and hospitals with multiple doctors",
      features: [
        "Multiple doctor accounts",
        "Clinic branding",
        "Advanced analytics",
        "API access",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
    },
  ],
  yearly: [
    {
      name: "Starter",
      price: "$190",
      period: "year",
      description: "For individual practitioners with basic needs",
      features: [
        "Up to 30 prescriptions per month",
        "Basic medicine database access",
        "Patient management",
        "PDF download",
        "Email support",
      ],
      cta: "Get Started",
      saving: "Save 16%",
    },
    {
      name: "Professional",
      price: "$490",
      period: "year",
      description: "For established practices with higher volume",
      features: [
        "Unlimited prescriptions",
        "Full medicine database access",
        "Advanced patient management",
        "Custom prescription templates",
        "Priority support",
      ],
      cta: "Get Started",
      highlighted: true,
      saving: "Save 16%",
    },
    {
      name: "Enterprise",
      price: "$990",
      period: "year",
      description: "For clinics and hospitals with multiple doctors",
      features: [
        "Multiple doctor accounts",
        "Clinic branding",
        "Advanced analytics",
        "API access",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
      saving: "Save 16%",
    },
  ],
};

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans[billingCycle].map((plan, index) => (
            <div
              key={index}
              className={`rounded-lg p-8 ${
                plan.highlighted
                  ? "border-2 border-primary shadow-xl"
                  : "border border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="inline-block bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  Most Popular
                </div>
              )}
              {plan.saving && (
                <div className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full mb-4 ml-2">
                  {plan.saving}
                </div>
              )}

              <h3 className="text-2xl font-bold text-foreground mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-muted-foreground ml-1">
                  /{plan.period}
                </span>
              </div>
              <p className="text-muted-foreground mb-6">{plan.description}</p>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, featureIndex) => (
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
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-4 rounded-md font-medium ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                } transition-colors`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
