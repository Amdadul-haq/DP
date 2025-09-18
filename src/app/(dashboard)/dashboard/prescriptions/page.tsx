// src/app/dashboard/prescriptions/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Printer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Prescription {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_number: number;
  diagnosis: string;
  created_at: string;
  medicines: Medicine[];
}

interface Medicine {
  name: string;
  rules: string;
  days: string;
  notes?: string;
}

export default function Prescriptions() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [printingId, setPrintingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/prescriptions/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data.prescriptions);
      } else {
        toast.error("Failed to fetch prescriptions");
      }
    } catch (error) {
      toast.error("Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patient_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.patient_number.toString().includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const downloadPDF = async (prescriptionId: number) => {
    setDownloadingId(prescriptionId);

    // Show loading toast with progress
    const toastId = toast.loading("Generating PDF...", {
      description: "Preparing your prescription for download",
    });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/prescriptions/${prescriptionId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        // Update toast to show progress
        toast.loading("Generating PDF...", {
          id: toastId,
          description: "Almost ready...",
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `prescription_${prescriptionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Success toast
        toast.success("PDF downloaded successfully", {
          id: toastId,
          description: "Your prescription has been downloaded",
        });
      } else {
        toast.error("Failed to download PDF", {
          id: toastId,
          description: "Please try again later",
        });
      }
    } catch (error) {
      toast.error("Failed to download PDF", {
        id: toastId,
        description: "Network error occurred",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const printPDF = async (prescriptionId: number) => {
    setPrintingId(prescriptionId);

    const toastId = toast.loading("Preparing for printing...", {
      description: "Loading prescription document",
    });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/prescriptions/${prescriptionId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Open PDF in a new tab for printing
        const printWindow = window.open(url, "_blank");

        if (printWindow) {
          printWindow.onload = function () {
            setPrintingId(null);
            toast.success("PDF ready for printing", {
              id: toastId,
              description: "Use the browser's print function (Ctrl+P)",
            });

            // Give the PDF a moment to load before focusing the print dialog
            setTimeout(() => {
              printWindow.focus();
              // Note: We can't directly trigger print() due to browser restrictions
              // The user will need to use the browser's print function
            }, 1000);
          };
        } else {
          toast.error("Popup blocked. Please allow popups for this site.", {
            id: toastId,
          });
          setPrintingId(null);
        }
      } else {
        toast.error("Failed to prepare for printing", {
          id: toastId,
          description: "Please try again later",
        });
        setPrintingId(null);
      }
    } catch (error) {
      toast.error("Failed to prepare for printing", {
        id: toastId,
        description: "Network error occurred",
      });
      setPrintingId(null);
    }
  };

  const handleDelete = async (prescriptionId: number) => {
    if (!confirm("Are you sure you want to delete this prescription?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Prescription deleted successfully");
        fetchPrescriptions();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete prescription");
      }
    } catch (error) {
      toast.error("Failed to delete prescription");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Prescriptions</h2>
          <p className="text-muted-foreground">
            Manage and view prescriptions for your patients
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/prescriptions/new">
            <Plus className="h-4 w-4 mr-2" />
            New Prescription
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Latest Prescriptions</CardTitle>
              <CardDescription>
                Most recent prescription for each patient
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search prescriptions..."
                className="pl-8 sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">
                Loading prescriptions...
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(prescription.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">
                        #{prescription.patient_number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {prescription.patient_name}
                      </TableCell>
                      <TableCell>{prescription.diagnosis}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/prescriptions/${prescription.id}/preview`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => downloadPDF(prescription.id)}
                              disabled={downloadingId === prescription.id}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {downloadingId === prescription.id
                                ? "Generating..."
                                : "Download PDF"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => printPDF(prescription.id)}
                              disabled={printingId === prescription.id}
                            >
                              <Printer className="h-4 w-4 mr-2" />
                              {printingId === prescription.id
                                ? "Preparing..."
                                : "Print"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(prescription.id)}
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
              {filteredPrescriptions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "No prescriptions found matching your search"
                    : "No prescriptions found. Create your first prescription!"}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
