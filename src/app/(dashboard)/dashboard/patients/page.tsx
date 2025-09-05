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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PatientForm } from "@/components/patients/PatientForm";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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

interface PatientsResponse {
  patients: Patient[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

interface SubscriptionWithPlan {
  id: number;
  user_id: number;
  plan_id: number;
  status: "active" | "canceled" | "past_due" | "expired";
  billing_cycle: "monthly" | "yearly";
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  plan_name: string;
  features: string[];
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const fetchPatients = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/patients?page=${page}&limit=15&search=${encodeURIComponent(
          search
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data: PatientsResponse = await response.json();
        setPatients(data.patients);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setTotalCount(data.totalCount);
      } else {
        toast.error("Failed to fetch patients");
      }
    } catch (error) {
      toast.error("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPatients(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPatients(page, searchTerm);
  };

  const handleDelete = async (patientId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Patient deleted successfully");
        fetchPatients(currentPage, searchTerm);
        setDeleteDialogOpen(false);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

const handleAddNewPatient = async () => {
  console.log("===== Add New Patient Debugging =====");

  const storedUser = localStorage.getItem("user");
  console.log("Stored user string:", storedUser);

  if (!storedUser) {
    console.error("No user found in localStorage!");
    toast.error("You are not allowed to add patients.");
    return;
  }

  let userRole: string | null = null;
  let userId: number | null = null;
  try {
    const parsedUser = JSON.parse(storedUser);
    console.log("Parsed user object:", parsedUser);

    userRole = parsedUser.role;
    userId = parsedUser.id;

    console.log("User role:", userRole);
    console.log("User ID:", userId);
  } catch (err) {
    console.error("Failed to parse stored user:", err);
    toast.error("You are not allowed to add patients.");
    return;
  }

  if (!userRole) {
    console.error("User role is missing!");
    toast.error("You are not allowed to add patients.");
    return;
  }

  // Assistants are always allowed
  if (userRole === "assistant") {
    console.log("User is an assistant. Redirecting to new patient page.");
    window.location.href = "/dashboard/patients/new";
    return;
  }

  // Doctors need an active subscription
  if (userRole === "doctor") {
    const token = localStorage.getItem("token");
    console.log("JWT token:", token);

    if (!token) {
      console.error("No token found in localStorage!");
      toast.error("You are not allowed to add patients.");
      return;
    }

    try {
      const response = await fetch("/api/auth/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Subscription API response status:", response.status);

      const data = await response.json();
      console.log("Subscription API response data:", data);

      // Check for active subscription
      if (data.hasActiveSubscription) {
        console.log("User has an active subscription. Redirecting...");
        window.location.href = "/dashboard/patients/new";
      } else {
        console.warn("User does NOT have an active subscription!");
        toast.error("You need an active subscription to add patients.");
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      toast.error("Failed to check subscription. Try again later.");
    }
    return;
  }

  // Unknown role
  console.error("Unknown user role:", userRole);
  toast.error("You are not allowed to add patients.");
};




  if (loading) {
    return (
      <div>
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-10 w-64" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Patients</h2>
          <p className="text-muted-foreground">
            Manage your patient records and information ({totalCount} total
            patients)
          </p>
        </div>
        <Button onClick={handleAddNewPatient}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>
                List of all patients in your practice
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} variant="outline">
                Search
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.full_name}
                    {patient.blood_group && (
                      <Badge variant="outline" className="ml-2 text-green-600">
                        {patient.blood_group}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{calculateAge(patient.dob)} years</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        patient.gender === "Female"
                          ? "bg-pink-100 text-pink-800"
                          : patient.gender === "Male"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }
                    >
                      {patient.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>{patient.mobile}</TableCell>
                  <TableCell>{formatDate(patient.last_visit_date)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPatient(patient);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPatient(patient);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {patients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "No patients found matching your search"
                : "No patients found"}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages &&
                      handlePageChange(currentPage + 1)
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      {/* View Patient Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedPatient?.full_name}
            </DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Personal Information</h4>
                <dl className="space-y-2 mt-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Full Name</dt>
                    <dd>{selectedPatient.full_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Gender</dt>
                    <dd>{selectedPatient.gender}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Date of Birth
                    </dt>
                    <dd>
                      {formatDate(selectedPatient.dob)} (
                      {calculateAge(selectedPatient.dob)} years)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Blood Group
                    </dt>
                    <dd>{selectedPatient.blood_group || "Not specified"}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-semibold">Contact Information</h4>
                <dl className="space-y-2 mt-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Mobile</dt>
                    <dd>{selectedPatient.mobile}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dd>{selectedPatient.email || "Not specified"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Address</dt>
                    <dd className="whitespace-pre-wrap">
                      {selectedPatient.address || "Not specified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Last Visit
                    </dt>
                    <dd>{formatDate(selectedPatient.last_visit_date)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>
              Update patient information for {selectedPatient?.full_name}
            </DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <PatientForm
              patient={selectedPatient}
              onSuccess={() => {
                setEditDialogOpen(false);
                fetchPatients(currentPage, searchTerm);
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              patient record for {selectedPatient?.full_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedPatient && handleDelete(selectedPatient.id)
              }
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
