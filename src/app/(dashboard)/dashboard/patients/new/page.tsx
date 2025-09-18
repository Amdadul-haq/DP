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
import { VitalsForm } from "@/components/patients/VitalsForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

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

  const [showConfirm, setShowConfirm] = useState(false);
  const [newPatientId, setNewPatientId] = useState<number | null>(null);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState<string>("");

  // Called when patient is successfully created
  const handleSuccess = (patientData?: {
    id: number;
    patient_number: number;
    name: string;
  }) => {
    if (patientData && patientData.patient_number) {
      // CHANGED: Use patient_number
      setNewPatientId(patientData.patient_number); // CHANGED: Store patient_number
      setNewPatientName(patientData.name || "");
      setShowConfirm(true);
    } else {
      router.push("/dashboard/patients");
    }
  };


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
          {/* Pass callback to onSuccess so we can show confirmation dialog */}
          <PatientForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>

      {/* Confirmation Dialog after patient is added */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <DialogTitle>Patient Added Successfully</DialogTitle>
            </div>
            <DialogDescription>
              Patient record for {newPatientName} has been created successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Would you like to add vitals information for this patient now?
            </p>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirm(false);
                router.push(`/dashboard/patients/${newPatientId}`);
              }}
            >
              Add Later
            </Button>
            <Button
              onClick={() => {
                setShowConfirm(false);
                setShowVitalsModal(true);
              }}
            >
              Add Vitals Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vitals Modal */}
      <Dialog open={showVitalsModal} onOpenChange={setShowVitalsModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Vitals for {newPatientName}</DialogTitle>
            <DialogDescription>
              Record the patient&apos;s current vitals measurements
            </DialogDescription>
          </DialogHeader>
          {newPatientId && (
            <VitalsForm
              patientId={newPatientId}
              onSuccess={() => {
                setShowVitalsModal(false);
                toast.success("Vitals added successfully");
                router.push(`/dashboard/patients/${newPatientId}`);
              }}
              onCancel={() => {
                setShowVitalsModal(false);
                router.push(`/dashboard/patients/${newPatientId}`);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewPatientPage;
