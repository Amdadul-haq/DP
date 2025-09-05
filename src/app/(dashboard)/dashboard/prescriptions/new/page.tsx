// src/app/(dashboard)/dashboard/prescriptions/new/page.tsx
"use client";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewPrescriptionPage() {
  const { user } = useUser();
  const [form, setForm] = useState({ patientId: "", diagnosis: "", notes: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setLoading(false);
    // handle response, show toast, redirect, etc.
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>New Prescription</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Patient ID"
              value={form.patientId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, patientId: e.target.value })}
              required
            />
            <Input
              placeholder="Diagnosis"
              value={form.diagnosis}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, diagnosis: e.target.value })}
              required
            />
            <Textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, notes: e.target.value })}
              rows={4}
            />
            <Button type="submit" disabled={loading}>Create Prescription</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
