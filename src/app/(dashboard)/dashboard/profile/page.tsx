"use client";
// src/app/(dashboard)/dashboard/profile/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function Profile() {
  const { user, subscription } = useUser();

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-3xl font-bold text-foreground">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and update your professional information
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bmdc">BMDC Registration Number</Label>
              <Input id="bmdc" defaultValue={user?.bmdcReg || ""} />
            </div>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
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
              <Input id="specialty" defaultValue={user?.specialty || ""} />
            </div>
            {/* You can add more fields here as needed */}
            {subscription && (
              <div className="space-y-2">
                <Label>Subscription Plan</Label>
                <div className="p-3 border rounded-lg">
                  <div className="font-semibold">{subscription.plan_name}</div>
                  <div className="text-sm text-muted-foreground">Status: {subscription.status}</div>
                  <div className="text-sm text-muted-foreground">Billing Cycle: {subscription.billing_cycle}</div>
                  <div className="text-sm text-muted-foreground">Next Billing: {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "-"}</div>
                  <div className="text-sm text-muted-foreground">Features:</div>
                  <ul className="list-disc ml-5">
                    {subscription.features?.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
