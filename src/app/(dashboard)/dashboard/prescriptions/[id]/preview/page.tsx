// app/(dashboard)/dashboard/prescriptions/[id]/preview/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Printer, ArrowLeft, FileText } from "lucide-react";
import { PrescriptionHTMLTemplate } from "@/components/PrescriptionHTMLTemplate";

interface Prescription {
  id: number;
  patient_number: number;
  diagnosis: string;
  history: string;
  cc: string;
  bp: string;
  pulse: string;
  weight: string;
  temperature: string;
  tests: string;
  advice: string;
  next_visit_date: string;
  created_at: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  patient_mobile: string;
  doctor_first_name: string;
  doctor_last_name: string;
  doctor_bmdc: string;
  doctor_specialty: string;
  medicines: Medicine[];
}

interface Medicine {
  name: string;
  rules: string;
  days: string;
  notes?: string;
}

export default function PrescriptionPreview() {
  const router = useRouter();
  const params = useParams();
  const prescriptionId = params.id as string;

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    fetchPrescription();
  }, [prescriptionId]);

  const fetchPrescription = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPrescription(data.prescription);
      } else {
        toast.error("Failed to fetch prescription");
        router.push("/dashboard/prescriptions");
      }
    } catch (error) {
      toast.error("Failed to fetch prescription");
      router.push("/dashboard/prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setGeneratingPdf(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/prescriptions/${prescriptionId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob();

        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;

        // Set the filename
        a.download = `${prescription?.patient_name}_${
          new Date().toISOString().split("T")[0]
        }.pdf`;

        // Append to body, click, and remove
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("PDF downloaded successfully");
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate PDF");
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

const handlePrint = async () => {
  const toastId = toast.loading("Preparing for printing...", {
    description: "Generating PDF document",
  });

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`/api/prescriptions/${prescriptionId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const printWindow = window.open(url, "_blank");

      if (printWindow) {
        printWindow.onload = function () {
          toast.success("PDF ready for printing", {
            id: toastId,
            description: "Press Ctrl + P to print",
          });

          setTimeout(() => {
            printWindow.focus();
          }, 1000);
        };
      } else {
        toast.error("Popup blocked. Allow popups!", {
          id: toastId,
        });
      }
    } else {
      toast.error("Failed to prepare PDF", {
        id: toastId,
        description: "Try again later",
      });
    }
  } catch (error) {
    toast.error("Printing failed", {
      id: toastId,
      description: "Network error occurred",
    });
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Prescription not found</p>
            <Button
              onClick={() => router.push("/dashboard/prescriptions")}
              className="mt-4"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6 no-print">
        <Button
          variant="outline"
          onClick={() => {
            // Store the prescription data in sessionStorage before navigating
            if (prescription) {
              sessionStorage.setItem(
                "previousPrescription",
                JSON.stringify(prescription)
              );
            }
            router.push("/dashboard/prescriptions/new");
          }}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Prescriptions
        </Button>

        <Button
          onClick={downloadPDF}
          disabled={generatingPdf}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          {generatingPdf ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PDF
        </Button>

        <Button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      {/* Prescription Template */}
      <PrescriptionHTMLTemplate prescription={prescription} />

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            border: none;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
