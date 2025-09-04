// lib/plans.ts
export interface Plan {
  id: string; // This should match the database ID (as string)
  name: string;
  description: string;
  features: string[];
  monthlyPrice: number;
  yearlyPrice: number;
  highlighted?: boolean;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: 'active' | 'canceled' | 'past_due' | 'expired';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: Date;
  current_period_end: Date;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionWithPlan extends Subscription {
  plan_name: string;
  features: string[];
}

export const plans: Plan[] = [
  {
    id: "1", // Changed from "free" to "1" to match database
    name: "Free",
    description: "For students and new practitioners getting started",
    features: [
      "Up to 5 prescriptions per month",
      "Basic medicine database access",
      "Patient management (up to 10 patients)",
      "PDF download",
      "Community support",
    ],
    monthlyPrice: 0,
    yearlyPrice: 0,
  },
  {
    id: "2", // Changed from "starter" to "2" to match database
    name: "Starter",
    description: "For individual practitioners with basic needs",
    features: [
      "Up to 30 prescriptions per month",
      "Basic medicine database access",
      "Patient management",
      "PDF download",
      "Email support",
    ],
    monthlyPrice: 5,
    yearlyPrice: 60,
  },
  {
    id: "3", // Changed from "professional" to "3" to match database
    name: "Professional",
    description: "For established practices with higher volume",
    features: [
      "Unlimited prescriptions",
      "Full medicine database access",
      "Advanced patient management",
      "Custom prescription templates",
      "Priority support",
    ],
    monthlyPrice: 10,
    yearlyPrice: 115,
    highlighted: true,
  },
];

export function getPlanById(id: string): Plan | undefined {
  return plans.find((plan) => plan.id === id);
}