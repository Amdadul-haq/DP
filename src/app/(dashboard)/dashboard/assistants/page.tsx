// src/app/(dashboard)/dashboard/assistants/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Assistant {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export default function AssistantsPage() {
  const { user } = useUser();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAssistants() {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/assistants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.assistants) setAssistants(data.assistants);
    }
    fetchAssistants();
  }, []);

  async function handleAddAssistant(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/assistants", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.assistant) {
      setAssistants((prev) => [...prev, data.assistant]);
      setForm({ email: "", password: "", firstName: "", lastName: "" });
    }
    setLoading(false);
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Assistants</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAssistant} className="mb-6 grid grid-cols-2 gap-4">
            <Input
              placeholder="First Name"
              value={form.firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <Input
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, lastName: e.target.value })}
              required
            />
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, password: e.target.value })}
              required
            />
            <Button type="submit" disabled={loading} className="col-span-2">Add Assistant</Button>
          </form>
          <div>
            <h3 className="font-semibold mb-2">Current Assistants</h3>
            <ul className="space-y-2">
              {assistants.map((a) => (
                <li key={a.id} className="border rounded p-2">
                  {a.first_name} {a.last_name} ({a.email})
                </li>
              ))}
              {assistants.length === 0 && <div className="text-muted-foreground">No assistants yet.</div>}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
