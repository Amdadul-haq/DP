// app/dashboard/patients/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PatientForm } from "@/components/patients/PatientForm";
import { VitalsForm } from "@/components/patients/VitalsForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Patient {
  id: number;
  full_name: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  mobile: string;
  email?: string;
  blood_group?: string;
  address?: string;
  last_visit_date?: string;
  created_at: string;
}

interface Vitals {
  id: number;
  patient_id: number;
  blood_pressure?: string;
  pulse?: string;
  weight?: string;
  temperature?: string;
  created_at: string;
}

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchPatient();
    fetchVitals();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPatient(data.patient);
      } else {
        toast.error("Failed to fetch patient details");
      }
    } catch (error) {
      toast.error("Failed to fetch patient details");
    }
  };

  const fetchVitals = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/vitals?patient_id=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setVitals(data.vitals);
      }
    } catch (error) {
      console.error("Failed to fetch vitals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Patient deleted successfully");
        router.push("/dashboard/patients");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete patient");
      }
    } catch (error) {
      toast.error("Failed to delete patient");
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading patient details...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        Patient not found
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {patient.full_name}
          </h2>
          <p className="text-muted-foreground">
            Patient ID: {patient.id} | Age: {calculateAge(patient.dob)} years
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="patient" className="w-full">
        <TabsList>
          <TabsTrigger value="patient">Patient Details</TabsTrigger>
          <TabsTrigger value="vitals">Vitals History</TabsTrigger>
        </TabsList>

        <TabsContent value="patient">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Patient Information</CardTitle>
                  <CardDescription>
                    Personal and contact details
                  </CardDescription>
                </div>
                <Button onClick={() => setEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Personal Information</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Full Name
                      </dt>
                      <dd className="font-medium">{patient.full_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Gender</dt>
                      <dd className="font-medium">{patient.gender}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Date of Birth
                      </dt>
                      <dd className="font-medium">
                        {formatDate(patient.dob)} ({calculateAge(patient.dob)}{" "}
                        years)
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Blood Group
                      </dt>
                      <dd className="font-medium">
                        {patient.blood_group || "Not specified"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Contact Information</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-muted-foreground">Mobile</dt>
                      <dd className="font-medium">{patient.mobile}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Email</dt>
                      <dd className="font-medium">
                        {patient.email || "Not specified"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Address</dt>
                      <dd className="font-medium whitespace-pre-wrap">
                        {patient.address || "Not specified"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Last Visit
                      </dt>
                      <dd className="font-medium">
                        {patient.last_visit_date
                          ? formatDate(patient.last_visit_date)
                          : "Never"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Vitals History</CardTitle>
                  <CardDescription>
                    Patient vitals measurements over time
                  </CardDescription>
                </div>
                <Button onClick={() => setVitalsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Vitals
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {vitals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No vitals records found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Blood Pressure</TableHead>
                      <TableHead>Pulse</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Temperature</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vitals.map((vital) => (
                      <TableRow key={vital.id}>
                        <TableCell>{formatDate(vital.created_at)}</TableCell>
                        <TableCell>{vital.blood_pressure || "-"}</TableCell>
                        <TableCell>{vital.pulse || "-"}</TableCell>
                        <TableCell>{vital.weight || "-"}</TableCell>
                        <TableCell>{vital.temperature || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Patient Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          <PatientForm
            patient={patient}
            onSuccess={() => {
              setEditDialogOpen(false);
              fetchPatient();
              toast.success("Patient updated successfully");
            }}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add Vitals Dialog */}
      <Dialog open={vitalsDialogOpen} onOpenChange={setVitalsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vitals</DialogTitle>
          </DialogHeader>
          <VitalsForm
            patientId={patient.id}
            onSuccess={() => {
              setVitalsDialogOpen(false);
              fetchVitals();
              toast.success("Vitals added successfully");
            }}
            onCancel={() => setVitalsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              patient record for {patient.full_name} and all associated vitals
              records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
