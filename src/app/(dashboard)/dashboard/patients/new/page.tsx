"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PatientForm } from "@/components/patients/PatientForm";
import { useRouter } from "next/navigation";

export default function NewPatientPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/patients");
  };

  const handleCancel = () => {
    router.push("/dashboard/patients");
  };

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
}
