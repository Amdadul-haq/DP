// src/app/(dashboard)/dashboard/lab-reports/[id]/download/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, CheckCircle, Printer } from "lucide-react";
import { toast } from "sonner";

interface LabReportDetails {
  id: number;
  lab_id: string;
  customer_id: number;
  referred_by?: string;
  test_name: string;
  result: string;
  sample_date: string;
  report_date: string;
  verified_by?: string;
  created_at: string;
  customer_name: string;
}

export default function LabReportDownloadPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<LabReportDetails | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchReportDetails(params.id as string);
    }
  }, [params.id]);

  const fetchReportDetails = async (reportId: string) => {
    try {
      const response = await fetch(`/api/lab-reports/${reportId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data.report);
      } else {
        toast.error("Failed to fetch report details");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to fetch report details");
    }
  };

  const downloadPDF = async () => {
    if (!report) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/lab-reports/${params.id}/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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
        a.download = `lab-report-${report.lab_id}.pdf`;

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
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6 no-print">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Button>

        <Button
          onClick={downloadPDF}
          disabled={loading || !report}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          {loading ? (
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

      <Card>
        <CardHeader>
          <CardTitle>Lab Report Ready</CardTitle>
          <CardDescription>
            Your lab report has been generated and is ready for download.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {report && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <p>
                <strong>Lab ID:</strong> {report.lab_id}
              </p>
              <p>
                <strong>Customer:</strong> {report.customer_name}
              </p>
              <p>
                <strong>Test:</strong> {report.test_name}
              </p>
              <p>
                <strong>Report Date:</strong>{" "}
                {new Date(report.report_date).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center p-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          <div className="text-sm text-muted-foreground text-center">
            <p>Click &quot;Download PDF&quot; to get your lab report in PDF format.</p>
            <p>
              You can also use the &quot;Print&quot; button to print the report directly.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
