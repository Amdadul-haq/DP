// components/patients/VitalsForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface VitalsFormProps {
  patientId: number;
  onSuccess: () => void;
  onCancel?: () => void;
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
          patient_id: patientId,
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

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="blood_pressure">Blood Pressure</Label>
          <Input
            id="blood_pressure"
            placeholder="120/80"
            value={formData.blood_pressure}
            onChange={(e) => handleChange("blood_pressure", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pulse">Pulse (BPM)</Label>
          <Input
            id="pulse"
            placeholder="72"
            value={formData.pulse}
            onChange={(e) => handleChange("pulse", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            placeholder="68.5"
            value={formData.weight}
            onChange={(e) => handleChange("weight", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature (°C)</Label>
          <Input
            id="temperature"
            placeholder="36.6"
            value={formData.temperature}
            onChange={(e) => handleChange("temperature", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Vitals"}
        </Button>
      </div>
    </form>
  );
}
