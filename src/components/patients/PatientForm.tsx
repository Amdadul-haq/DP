// components/patients/PatientForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User, Phone, Mail, Droplets, MapPin, Calendar } from "lucide-react";

interface Patient {
  id?: number;
  full_name: string;
  gender: "Male" | "Female" | "Other";
  age: number;
  mobile: string;
  email?: string;
  blood_group?: string;
  address?: string;
  last_visit_date?: string;
}

interface PatientFormProps {
  patient?: Patient;
  onSuccess: (patientData?: { id: number; name: string }) => void;
  onCancel: () => void;
}

export function PatientForm({
  patient,
  onSuccess,
  onCancel,
}: PatientFormProps) {
  const [formData, setFormData] = useState<Patient>({
    full_name: patient?.full_name || "",
    gender: patient?.gender || "Male",
    age: patient?.age || 0,
    mobile: patient?.mobile || "",
    email: patient?.email || "",
    blood_group: patient?.blood_group || "",
    address: patient?.address || "",
    last_visit_date: patient?.last_visit_date || "",
  });
  const [loading, setLoading] = useState(false);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [ageInput, setAgeInput] = useState<string>(
    patient?.age?.toString() || ""
  );

  const validateAge = (value: number): string | null => {
    if (value <= 0) {
      return "Age cannot be negative or zero";
    }
    if (value > 150) {
      return "Age cannot be greater than 150";
    }
    return null;
  };

  const handleAgeChange = (value: string) => {
    setAgeInput(value);

    if (value === "") {
      setAgeError("Age is required");
      setFormData((prev) => ({ ...prev, age: 0 }));
      return;
    }

    const numericValue = parseInt(value);

    if (isNaN(numericValue)) {
      setAgeError("Please enter a valid number");
      setFormData((prev) => ({ ...prev, age: 0 }));
      return;
    }

    const error = validateAge(numericValue);
    setAgeError(error);

    if (!error) {
      setFormData((prev) => ({ ...prev, age: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, age: numericValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.age <= 0) {
      toast.error("Please enter a valid age (1-150)");
      setLoading(false);
      return;
    }

    const ageValidationError = validateAge(formData.age);
    if (ageValidationError) {
      toast.error(ageValidationError);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = patient?.id ? `/api/patients/${patient.id}` : "/api/patients";
      const method = patient?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          patient?.id
            ? "Patient updated successfully"
            : "Patient created successfully"
        );

        onSuccess({
          id: data.patient.id,
          name: data.patient.full_name,
        });
      } else {
        const error = await response.json();

        if (response.status === 409) {
          toast.error(error.error || "Duplicate mobile number", {
            description: "Please use a different mobile number!",
            duration: 5000,
          });
        } else {
          toast.error(error.error || "Failed to save patient");
        }
      }
    } catch (error) {
      toast.error("Failed to save patient", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Patient, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-20 md:pb-0">
      {/* Personal Information Section */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              required
              className="h-12 text-base"
              placeholder="Enter patient's full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-medium">
              Gender *
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value: "Male" | "Female" | "Other") =>
                handleChange("gender", value)
              }
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-medium">
              Age *
            </Label>
            <Input
              id="age"
              type="number"
              min="1"
              max="150"
              placeholder="Enter age"
              value={ageInput}
              onChange={(e) => handleAgeChange(e.target.value)}
              required
              className={`h-12 text-base ${
                ageError ? "border-destructive" : ""
              }`}
            />
            {ageError && (
              <p className="text-sm text-destructive mt-1">{ageError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="mobile"
              className="text-sm font-medium flex items-center gap-1"
            >
              <Phone className="h-4 w-4" />
              Mobile Number *
            </Label>
            <Input
              id="mobile"
              type="tel"
              inputMode="tel"
              value={formData.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              required
              className="h-12 text-base"
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium flex items-center gap-1"
            >
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-12 text-base"
              placeholder="patient@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="blood_group"
              className="text-sm font-medium flex items-center gap-1"
            >
              <Droplets className="h-4 w-4" />
              Blood Group
            </Label>
            <Select
              value={formData.blood_group}
              onValueChange={(value) => handleChange("blood_group", value)}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label
            htmlFor="address"
            className="text-sm font-medium flex items-center gap-1"
          >
            <MapPin className="h-4 w-4" />
            Address
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            rows={3}
            className="text-base min-h-[100px]"
            placeholder="Enter full address"
          />
        </div>

        <div className="mt-4 space-y-2">
          <Label
            htmlFor="last_visit_date"
            className="text-sm font-medium flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            Last Visit Date
          </Label>
          <Input
            id="last_visit_date"
            type="date"
            value={formData.last_visit_date}
            onChange={(e) => handleChange("last_visit_date", e.target.value)}
            className="h-12 text-base"
          />
        </div>
      </div>

      {/* Action Buttons - Large sticky footer for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-2xl p-4 md:static md:bg-transparent md:border-t-0 md:shadow-none md:p-0">
        <div className="flex flex-col-reverse md:flex-row gap-3 md:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-14 text-base font-semibold md:h-12"
            size="lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !!ageError || formData.age <= 0}
            className="h-14 text-base font-semibold md:h-12"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                {patient?.id ? "Updating..." : "Creating..."}
              </span>
            ) : patient?.id ? (
              "Update Patient"
            ) : (
              "Create Patient"
            )}
          </Button>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind sticky footer */}
      <div className="h-20 md:h-0"></div>
    </form>
  );
}
