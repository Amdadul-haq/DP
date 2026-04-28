// components/PrescriptionTableRow.tsx
"use client";

import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Trash2,
  Eye,
  Download,
  Printer,
} from "lucide-react";
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
import Link from "next/link";
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

interface PrescriptionTableRowProps {
  prescription: Prescription;
  onDelete: (prescriptionId: number) => Promise<void>;
}

export function PrescriptionTableRow({
  prescription,
  onDelete,
}: PrescriptionTableRowProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { downloadPDF, printPDF, downloading, printing } = usePrescriptionPDF(
    prescription.prescription_number
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = async () => {
    await onDelete(prescription.prescription_number);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <TableRow key={prescription.prescription_number}>
        <TableCell className="text-muted-foreground">
          {formatDate(prescription.created_at)}
        </TableCell>
        <TableCell className="font-medium">{prescription.patient_number}</TableCell>
        <TableCell className="font-medium">{prescription.patient_name}</TableCell>
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
                  href={`/dashboard/prescriptions/${prescription.prescription_number}/preview`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => downloadPDF()}
                disabled={downloading}
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? "Generating..." : "Download PDF"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => printPDF()} disabled={printing}>
                <Printer className="h-4 w-4 mr-2" />
                {printing ? "Preparing..." : "Print"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete prescription #{prescription.prescription_number} for {prescription.patient_name}.
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
    </>
  );
}
