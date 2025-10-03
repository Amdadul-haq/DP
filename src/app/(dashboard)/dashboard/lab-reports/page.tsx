// src/app/(dashboard)/dashboard/lab-reports/page.tsx
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
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Download, Plus } from "lucide-react";
import Link from "next/link";

interface LabReport {
  id: number;
  lab_id: string;
  customer_name: string;
  test_name: string;
  report_date: string;
  created_at: string;
}

export default function LabReportsPage() {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLabReports();
  }, []);

  const fetchLabReports = async () => {
    try {
      const response = await fetch("/api/lab-reports", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
      }
    } catch (error) {
      console.error("Error fetching lab reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(
    (report) =>
      report.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.lab_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.test_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-3xl font-bold text-foreground">Lab Reports</h2>
        <p className="text-muted-foreground">
          Manage and create laboratory test reports
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Header with search and create button */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Lab Reports</CardTitle>
                <CardDescription>
                  {reports.length} report{reports.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    className="pl-8 w-full sm:w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button asChild>
                  <Link href="/dashboard/lab-reports/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Report
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Reports List */}
        <Card>
          <CardContent className="p-0">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No reports found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first lab report"}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link href="/dashboard/lab-reports/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Report
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="font-medium truncate">
                            {report.customer_name}
                          </p>
                          <Badge variant="secondary" className="shrink-0">
                            {report.lab_id}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {report.test_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created{" "}
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/dashboard/lab-reports/${report.id}/download`}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
