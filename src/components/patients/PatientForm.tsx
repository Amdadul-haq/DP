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
  patient_number?: number; // ADDED: patient_number field
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
  // UPDATED: onSuccess callback to include patient_number
  onSuccess: (patientData?: {
    id: number;
    patient_number: number;
    name: string;
  }) => void;
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
    if (value <= 0) return "Age cannot be negative or zero";
    if (value > 150) return "Age cannot be greater than 150";
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
    setFormData((prev) => ({ ...prev, age: numericValue }));
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
      // UPDATED: Use patient_number for existing patients
      const url = patient?.patient_number
        ? `/api/patients/${patient.patient_number}`
        : "/api/patients";
      const method = patient?.patient_number ? "PUT" : "POST";

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
          patient?.patient_number
            ? "Patient updated successfully"
            : "Patient created successfully"
        );

        // UPDATED: Pass patient_number to onSuccess callback
        onSuccess({
          id: data.patient.id,
          patient_number: data.patient.patient_number,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Personal Information Section */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              required
              placeholder="Enter patient's full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value: "Male" | "Female" | "Other") =>
                handleChange("gender", value)
              }
            >
              <SelectTrigger>
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
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              min="1"
              max="150"
              placeholder="Enter age"
              value={ageInput}
              onChange={(e) => handleAgeChange(e.target.value)}
              required
              className={ageError ? "border-destructive" : ""}
            />
            {ageError && (
              <p className="text-sm text-destructive mt-1">{ageError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              Mobile Number *
            </Label>
            <Input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              required
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
            <Label htmlFor="email" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="patient@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blood_group" className="flex items-center gap-1">
              <Droplets className="h-4 w-4" />
              Blood Group
            </Label>
            <Select
              value={formData.blood_group}
              onValueChange={(value) => handleChange("blood_group", value)}
            >
              <SelectTrigger>
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
          <Label htmlFor="address" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Address
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            rows={3}
            placeholder="Enter full address"
          />
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="last_visit_date" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Last Visit Date
          </Label>
          <Input
            id="last_visit_date"
            type="date"
            value={formData.last_visit_date}
            onChange={(e) => handleChange("last_visit_date", e.target.value)}
          />
        </div>
      </div>

      {/* Action Buttons (Dialog friendly) */}
      <div className="mt-6 flex flex-col-reverse md:flex-row gap-3 md:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-12 text-base font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !!ageError || formData.age <= 0}
          className="h-12 text-base font-semibold"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              {patient?.patient_number ? "Updating..." : "Creating..."}
            </span>
          ) : patient?.patient_number ? (
            "Update Patient"
          ) : (
            "Create Patient"
          )}
        </Button>
      </div>
    </form>
  );
}
