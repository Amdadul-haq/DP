// src/app/(dashboard)/dashboard/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

interface LabSettings {
  lab_name_bengali: string;
  lab_name_english: string;
  lab_address: string;
  lab_mobile: string;
  lab_email: string;
}

export default function Profile() {
  const { user, setUser } = useUser();
  const [loadingLab, setLoadingLab] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personal, setPersonal] = useState({
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    email: user?.email || "",
    bmdc_reg: user?.bmdcReg || "",
    specialty: user?.specialty || "",
  });
  const [labSettings, setLabSettings] = useState<LabSettings>({
    lab_name_bengali: "",
    lab_name_english: "",
    lab_address: "",
    lab_mobile: "",
    lab_email: "",
  });

  // Sync personal state when user context changes
  useEffect(() => {
    setPersonal({
      first_name: user?.firstName || "",
      last_name: user?.lastName || "",
      email: user?.email || "",
      bmdc_reg: user?.bmdcReg || "",
      specialty: user?.specialty || "",
    });
    if (user?.id) {
      fetchLabSettings();
    }
  }, [user]);

  const fetchLabSettings = async () => {
    try {
      const response = await fetch("/api/profile/lab-settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLabSettings(
          data.labSettings || {
            lab_name_bengali: "",
            lab_name_english: "",
            lab_address: "",
            lab_mobile: "",
            lab_email: "",
          }
        );
      }
    } catch (error) {
      console.error("Error fetching lab settings:", error);
    }
  };

  const handlePersonalChange = (field: keyof typeof personal, value: string) => {
    setPersonal((prev) => ({ ...prev, [field]: value }));
  };

  const savePersonal = async () => {
    setSavingPersonal(true);
    try {
      const response = await fetch("/api/profile/personal", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(personal),
      });
      if (response.ok) {
        const data = await response.json();
        const updated = data.personal;
        // Update context user mapping
        setUser({
          id: updated.id.toString(),
          email: updated.email,
          firstName: updated.first_name,
          lastName: updated.last_name,
          bmdcReg: updated.bmdc_reg,
            specialty: updated.specialty || "",
          role: updated.role,
          doctor_id: updated.doctor_id?.toString(),
        });
        // Persist to localStorage for reload
        const storedRaw = localStorage.getItem("user");
        const rawMerged = {
          ...(storedRaw ? JSON.parse(storedRaw) : {}),
          first_name: updated.first_name,
          last_name: updated.last_name,
          email: updated.email,
          bmdc_reg: updated.bmdc_reg,
          specialty: updated.specialty,
        };
        localStorage.setItem("user", JSON.stringify(rawMerged));
        toast.success(data.message || "Personal information updated");
      } else {
        const err = await response.json();
        toast.error(err.error || "Failed to update personal info");
      }
    } catch (error) {
      console.error("Error updating personal info:", error);
      toast.error("Failed to update personal info");
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleLabSettingsChange = (field: keyof LabSettings, value: string) => {
    setLabSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveLabSettings = async () => {
    setLoadingLab(true);
    try {
      const response = await fetch("/api/profile/lab-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(labSettings),
      });

      if (response.ok) {
        toast.success("Lab settings saved successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save lab settings");
      }
    } catch (error) {
      console.error("Error saving lab settings:", error);
      toast.error("Failed to save lab settings");
    } finally {
      setLoadingLab(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-3xl font-bold text-foreground">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and update your professional information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* Personal Information Card (Editable) */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal and professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={personal.first_name}
                  onChange={(e) => handlePersonalChange("first_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={personal.last_name}
                  onChange={(e) => handlePersonalChange("last_name", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={personal.email}
                onChange={(e) => handlePersonalChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bmdc">BMDC Registration Number</Label>
              <Input
                id="bmdc"
                value={personal.bmdc_reg}
                onChange={(e) => handlePersonalChange("bmdc_reg", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={personal.specialty}
                placeholder="e.g. Cardiology"
                onChange={(e) => handlePersonalChange("specialty", e.target.value)}
              />
            </div>
            <Button onClick={savePersonal} disabled={savingPersonal} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {savingPersonal ? "Saving..." : "Save Personal Information"}
            </Button>
          </CardContent>
        </Card>

        {/* Lab Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Lab Settings</CardTitle>
            <CardDescription>
              Configure your laboratory information for reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="labNameBengali">Lab Name (Bengali)</Label>
              <Input
                id="labNameBengali"
                placeholder="এম.এস ফার্সি কমিউনিটি হেলথ কেয়ার সার্ভিস"
                value={labSettings.lab_name_bengali}
                onChange={(e) =>
                  handleLabSettingsChange("lab_name_bengali", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labNameEnglish">Lab Name (English)</Label>
              <Input
                id="labNameEnglish"
                placeholder="M.S FARSI COMMUNITY HEALTH CARE SERVICE"
                value={labSettings.lab_name_english}
                onChange={(e) =>
                  handleLabSettingsChange("lab_name_english", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labAddress">Lab Address</Label>
              <Textarea
                id="labAddress"
                placeholder="Shalbari Bazar,Badargonj,Rangpur"
                value={labSettings.lab_address}
                onChange={(e) =>
                  handleLabSettingsChange("lab_address", e.target.value)
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labMobile">Lab Mobile</Label>
              <Input
                id="labMobile"
                placeholder="01318905857"
                value={labSettings.lab_mobile}
                onChange={(e) =>
                  handleLabSettingsChange("lab_mobile", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labEmail">Lab Email</Label>
              <Input
                id="labEmail"
                type="email"
                placeholder="farsi8325@gmail.com"
                value={labSettings.lab_email}
                onChange={(e) =>
                  handleLabSettingsChange("lab_email", e.target.value)
                }
              />
            </div>
            <Button
              onClick={saveLabSettings}
              disabled={loadingLab}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {loadingLab ? "Saving..." : "Save Lab Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
