// app/admin/payment-requests/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import type { PaymentRequestWithDetails, PaymentStatus } from "@/types/payment";
import { format } from "date-fns";

export default function AdminPaymentRequestsPage() {
  const router = useRouter();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequestWithDetails[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PaymentRequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PaymentStatus | "all">("pending");
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequestWithDetails | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchPaymentRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, paymentRequests]);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== "admin") {
        toast.error("Unauthorized - Admin access required");
        router.push("/login");
        return;
      }
      
      // Verify with backend API
      const response = await fetch("/api/admin/check-access", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error("You don't have admin access");
        router.push("/login");
      }
    } catch {
      toast.error("Failed to verify admin access");
      router.push("/login");
    }
  };

  const fetchPaymentRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/payment-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setPaymentRequests(data.paymentRequests);
      } else if (response.status === 403) {
        toast.error("You don't have admin access");
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Failed to fetch payment requests");
      }
    } catch (error: unknown) {
      toast.error("Failed to fetch payment requests");
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    if (activeTab === "all") {
      setFilteredRequests(paymentRequests);
    } else {
      setFilteredRequests(paymentRequests.filter((req) => req.status === activeTab));
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/admin/payment-requests/${selectedRequest.id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ adminNote }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Payment request approved successfully!");
        setShowApproveDialog(false);
        setAdminNote("");
        setSelectedRequest(null);
        fetchPaymentRequests(); // Refresh list
      } else {
        toast.error(data.error || "Failed to approve payment request");
      }
    } catch (error: unknown) {
      toast.error("Failed to approve payment request");
      console.error("Approve error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !adminNote.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/admin/payment-requests/${selectedRequest.id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ adminNote }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Payment request rejected");
        setShowRejectDialog(false);
        setAdminNote("");
        setSelectedRequest(null);
        fetchPaymentRequests(); // Refresh list
      } else {
        toast.error(data.error || "Failed to reject payment request");
      }
    } catch (error: unknown) {
      toast.error("Failed to reject payment request");
      console.error("Reject error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, { variant: "default" | "secondary" | "destructive"; icon: React.ReactNode }> = {
      pending: { 
        variant: "secondary", 
        icon: <Clock className="h-3 w-3 mr-1" /> 
      },
      approved: { 
        variant: "default", 
        icon: <CheckCircle2 className="h-3 w-3 mr-1" /> 
      },
      rejected: { 
        variant: "destructive", 
        icon: <XCircle className="h-3 w-3 mr-1" /> 
      },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    pending: paymentRequests.filter((req) => req.status === "pending").length,
    approved: paymentRequests.filter((req) => req.status === "approved").length,
    rejected: paymentRequests.filter((req) => req.status === "rejected").length,
    total: paymentRequests.length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Requests</h1>
          <p className="text-muted-foreground">Manage and approve payment requests</p>
        </div>
        <Button onClick={fetchPaymentRequests} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-amber-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Requests</CardTitle>
          <CardDescription>View and manage all payment requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PaymentStatus | "all")}>
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No payment requests found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(request.created_at), "MMM dd, yyyy")}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(request.created_at), "HH:mm")}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.user_name}</p>
                              <p className="text-sm text-muted-foreground">{request.user_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.plan_name}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {request.billing_cycle}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">৳{request.amount}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {request.payment_method}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {request.transaction_id}
                            </code>
                            <br />
                            <span className="text-xs text-muted-foreground">
                              From: ***{request.sender_number_last_4}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-right">
                            {request.status === "pending" && (
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowApproveDialog(true);
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            {request.status !== "pending" && request.admin_note && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  toast.info(`Admin Note: ${request.admin_note}`);
                                }}
                              >
                                View Note
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment Request</DialogTitle>
            <DialogDescription>
              This will activate the user&apos;s subscription immediately.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p><span className="font-medium">User:</span> {selectedRequest.user_name}</p>
                <p><span className="font-medium">Plan:</span> {selectedRequest.plan_name}</p>
                <p><span className="font-medium">Amount:</span> ৳{selectedRequest.amount}</p>
                <p><span className="font-medium">Method:</span> {selectedRequest.payment_method.toUpperCase()}</p>
                <p><span className="font-medium">Transaction ID:</span> {selectedRequest.transaction_id}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approve-note">Admin Note (Optional)</Label>
                <Textarea
                  id="approve-note"
                  placeholder="Add a note about this approval..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setAdminNote("");
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve & Activate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. The user will be notified.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p><span className="font-medium">User:</span> {selectedRequest.user_name}</p>
                <p><span className="font-medium">Plan:</span> {selectedRequest.plan_name}</p>
                <p><span className="font-medium">Transaction ID:</span> {selectedRequest.transaction_id}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reject-note">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reject-note"
                  placeholder="Explain why this payment request is being rejected..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setAdminNote("");
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !adminNote.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
