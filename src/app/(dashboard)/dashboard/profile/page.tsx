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
  const { user, subscription } = useUser();
  const [loading, setLoading] = useState(false);
  const [labSettings, setLabSettings] = useState<LabSettings>({
    lab_name_bengali: "",
    lab_name_english: "",
    lab_address: "",
    lab_mobile: "",
    lab_email: "",
  });

  // Fetch lab settings when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchLabSettings();
    }
  }, [user?.id]);

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

  const handleLabSettingsChange = (field: keyof LabSettings, value: string) => {
    setLabSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveLabSettings = async () => {
    setLoading(true);
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
      setLoading(false);
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={user?.firstName || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={user?.lastName || ""} readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email || ""}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bmdc">BMDC Registration Number</Label>
              <Input id="bmdc" defaultValue={user?.bmdcReg || ""} readOnly />
            </div>
            <Button disabled>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Professional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>
              Update your professional details and specialization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                defaultValue={user?.specialty || ""}
                readOnly
              />
            </div>
            {/* You can add more fields here as needed */}
            {subscription && (
              <div className="space-y-2">
                <Label>Subscription Plan</Label>
                <div className="p-3 border rounded-lg">
                  <div className="font-semibold">{subscription.plan_name}</div>
                  <div className="text-sm text-muted-foreground">
                    Status: {subscription.status}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Billing Cycle: {subscription.billing_cycle}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Next Billing:{" "}
                    {subscription.current_period_end
                      ? new Date(
                          subscription.current_period_end
                        ).toLocaleDateString()
                      : "-"}
                  </div>
                  <div className="text-sm text-muted-foreground">Features:</div>
                  <ul className="list-disc ml-5">
                    {subscription.features?.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <Button disabled>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
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
              disabled={loading}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Lab Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
