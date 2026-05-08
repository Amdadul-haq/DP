// src/app/dashboard/prescriptions/page.tsx
"use client";

import { useState, useEffect, KeyboardEvent } from "react";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Search, Eye, Download, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { usePrescriptionPDF } from "@/hooks/usePrescriptionPDF";

interface Medicine {
  name: string;
  rules: string;
  days: string;
  notes?: string;
}

interface Prescription {
  id: number;
  prescription_number: number;
  patient_id: number;
  patient_name: string;
  patient_number: number;
  diagnosis: string;
  created_at: string;
  medicines: Medicine[];
}

interface PrescriptionsResponse {
  prescriptions: Prescription[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export default function Prescriptions() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPrescriptions = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/prescriptions/latest?page=${page}&limit=15&search=${encodeURIComponent(
          search
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data: PrescriptionsResponse = await response.json();
        setPrescriptions(data.prescriptions);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setTotalCount(data.totalCount);
      } else {
        toast.error("Failed to fetch prescriptions");
      }
    } catch (error) {
      toast.error("Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPrescriptions(1, searchTerm);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPrescriptions(page, searchTerm);
  };



  const handleDelete = async (prescriptionId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Prescription deleted successfully");
        fetchPrescriptions(currentPage, searchTerm);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete prescription");
      }
    } catch (error) {
      toast.error("Failed to delete prescription");
    }
  };

  const PrescriptionRow = ({
    prescription,
  }: {
    prescription: Prescription;
  }) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { downloadPDF, printPDF, downloading, printing } = usePrescriptionPDF(
      prescription.prescription_number
    );

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString();
    };

    const handleConfirmDelete = async () => {
      await handleDelete(prescription.prescription_number);
      setDeleteDialogOpen(false);
    };

    return (
      <>
        <TableRow key={prescription.prescription_number}>
          <TableCell className="text-muted-foreground">
            {formatDate(prescription.created_at)}
          </TableCell>
          <TableCell className="font-medium">
            {prescription.patient_number}
          </TableCell>
          <TableCell className="font-medium">
            {prescription.patient_name}
          </TableCell>
          <TableCell>{prescription.diagnosis}</TableCell>
          <TableCell className="text-right">
            <div className="flex gap-2 justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link
                      href={`/dashboard/prescriptions/${prescription.prescription_number}/preview`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Prescription</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => printPDF()}
                    disabled={printing}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Print Prescription</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => downloadPDF()}
                    disabled={downloading}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download PDF</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Prescription</TooltipContent>
              </Tooltip>
            </div>
          </TableCell>
        </TableRow>

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete
                prescription #{prescription.prescription_number} for
                {" "}{prescription.patient_name}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Prescriptions</h2>
          <p className="text-muted-foreground">
            Manage and view prescriptions for your patients ({totalCount} total
            prescriptions)
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
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search prescriptions..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Button onClick={handleSearch} variant="outline">
                Search
              </Button>
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
                  {prescriptions.map((prescription) => (
                    <PrescriptionRow
                      key={prescription.prescription_number}
                      prescription={prescription}
                    />
                  ))}
                </TableBody>
              </Table>

              {prescriptions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "No prescriptions found matching your search"
                    : "No prescriptions found. Create your first prescription!"}
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
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
