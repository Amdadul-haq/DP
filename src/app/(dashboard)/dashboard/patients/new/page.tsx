"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PatientForm } from "@/components/patients/PatientForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SubscriptionWithPlan {
  id: number;
  user_id: number;
  plan_id: number;
  status: "active" | "canceled" | "past_due" | "expired";
  billing_cycle: "monthly" | "yearly";
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  plan_name: string;
  features: string[];
}

interface SubscriptionResponse {
  hasActiveSubscription: boolean;
  subscription: SubscriptionWithPlan | null;
}

const NewPatientPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setLoading(false);
      return;
    }

    const user = JSON.parse(userStr);

    if (user.role === "assistant") {
      setAllowed(true);
      setLoading(false);
      return;
    }

    if (user.role === "doctor") {
      fetch("/api/auth/subscription", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data: SubscriptionResponse) => {
          if (data.hasActiveSubscription) {
            setAllowed(true);
          } else {
            toast.error("You need an active subscription to add patients.");
            router.push("/pricing");
          }
        })
        .catch(() => {
          toast.error("Failed to check subscription.");
        })
        .finally(() => setLoading(false));

      return;
    }

    setAllowed(false);
    setLoading(false);
  }, [router]);

  const handleSuccess = () => router.push("/dashboard/patients");
  const handleCancel = () => router.push("/dashboard/patients");

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  if (!allowed) return null;

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-3xl font-bold text-foreground">Add New Patient</h2>
        <p className="text-muted-foreground">
          Create a new patient record for your practice
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>
            Fill in the details below to create a new patient record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewPatientPage;
