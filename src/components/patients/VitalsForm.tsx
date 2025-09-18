// components/patients/VitalsForm.tsx - UPDATED
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface VitalsFormProps {
  patientId: number; // This should be patient_number now
  onSuccess: () => void;
  onCancel: () => void;
}

export function VitalsForm({
  patientId,
  onSuccess,
  onCancel,
}: VitalsFormProps) {
  const [formData, setFormData] = useState({
    blood_pressure: "",
    pulse: "",
    weight: "",
    temperature: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/vitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient_number: patientId, // CHANGED: Send patient_number instead of patient_id
          ...formData,
        }),
      });

      if (response.ok) {
        toast.success("Vitals added successfully");
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add vitals");
      }
    } catch (error) {
      toast.error("Failed to add vitals");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="blood_pressure">Blood Pressure</Label>
          <Input
            id="blood_pressure"
            value={formData.blood_pressure}
            onChange={(e) => handleChange("blood_pressure", e.target.value)}
            placeholder="e.g., 120/80"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pulse">Pulse</Label>
          <Input
            id="pulse"
            value={formData.pulse}
            onChange={(e) => handleChange("pulse", e.target.value)}
            placeholder="e.g., 72 bpm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight</Label>
          <Input
            id="weight"
            value={formData.weight}
            onChange={(e) => handleChange("weight", e.target.value)}
            placeholder="e.g., 68 kg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature</Label>
          <Input
            id="temperature"
            value={formData.temperature}
            onChange={(e) => handleChange("temperature", e.target.value)}
            placeholder="e.g., 98.6°F"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Vitals"}
        </Button>
      </div>
    </form>
  );
}
