// src/app/(dashboard)/dashboard/lab-reports/create/page.tsx (Updated)
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LabCustomer {
  id: number;
  customer_number: number;
  full_name: string;
  gender: "Male" | "Female" | "Other";
  age: number;
  mobile: string;
  email?: string;
  address?: string;
}

// Test name options
const TEST_NAME_OPTIONS = [
  { value: "Blood Grouping (Rh)", label: "Blood Grouping (Rh)" },
  { value: "Diabetes", label: "Diabetes" },
  { value: "CBC", label: "CBC" },
  { value: "Dengue NS1", label: "Dengue NS1" },
];

// Result options for Blood Grouping test
const BLOOD_GROUP_RESULTS = [
  { value: "A+ (Positive)", label: "A+ (Positive)" },
  { value: "A- (Negative)", label: "A- (Negative)" },
  { value: "B+ (Positive)", label: "B+ (Positive)" },
  { value: "B- (Negative)", label: "B- (Negative)" },
  { value: "O+ (Positive)", label: "O+ (Positive)" },
  { value: "O- (Negative)", label: "O- (Negative)" },
  { value: "AB+ (Positive)", label: "AB+ (Positive)" },
  { value: "AB- (Negative)", label: "AB- (Negative)" },
];

// Generic result options for other tests
const GENERIC_RESULTS = [
  { value: "Positive", label: "Positive" },
  { value: "Negative", label: "Negative" },
  { value: "Normal", label: "Normal" },
  { value: "Abnormal", label: "Abnormal" },
  { value: "High", label: "High" },
  { value: "Low", label: "Low" },
];

export default function CreateLabReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<LabCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<LabCustomer | null>(
    null
  );
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Customer fields (for new customers)
    full_name: "",
    gender: "" as "Male" | "Female" | "Other" | "",
    age: "",
    mobile: "",
    email: "",
    address: "",

    // Lab report fields (removed lab_id)
    referred_by: "",
    test_name: "",
    result: "",
    sample_date: new Date().toISOString().split("T")[0],
    report_date: new Date().toISOString().split("T")[0],
    verified_by: "",
  });

  // Get appropriate result options based on selected test
  const getResultOptions = () => {
    if (formData.test_name === "Blood Grouping (Rh)") {
      return BLOOD_GROUP_RESULTS;
    }
    return GENERIC_RESULTS;
  };

  const searchCustomers = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await fetch(
        `/api/lab-customers/search?mobile=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.customers || []);
      }
    } catch (error) {
      console.error("Error searching customers:", error);
      toast.error("Failed to search customers");
    }
  };

  const handleCustomerSelect = (customer: LabCustomer) => {
    setSelectedCustomer(customer);
    setShowNewCustomerForm(false);
    setSearchResults([]);
    setSearchTerm("");

    // Pre-fill form with customer data
    setFormData((prev) => ({
      ...prev,
      full_name: customer.full_name,
      gender: customer.gender,
      age: customer.age.toString(),
      mobile: customer.mobile,
      email: customer.email || "",
      address: customer.address || "",
    }));
  };

  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setShowNewCustomerForm(true);
    setSearchResults([]);
    setSearchTerm("");

    // Reset customer fields
    setFormData((prev) => ({
      ...prev,
      full_name: "",
      gender: "",
      age: "",
      mobile: "",
      email: "",
      address: "",
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // If test name is changed and it's not Blood Grouping, clear the result
    if (
      field === "test_name" &&
      value !== "Blood Grouping (Rh)" &&
      formData.test_name === "Blood Grouping (Rh)"
    ) {
      setFormData((prev) => ({
        ...prev,
        result: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/lab-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          // Customer data (will create new if no selectedCustomer)
          customer_data: selectedCustomer
            ? null
            : {
                full_name: formData.full_name,
                gender: formData.gender,
                age: parseInt(formData.age),
                mobile: formData.mobile,
                email: formData.email || undefined,
                address: formData.address || undefined,
              },
          // Lab report data (no lab_id needed - will be auto-generated)
          lab_report: {
            referred_by: formData.referred_by,
            test_name: formData.test_name,
            result: formData.result,
            sample_date: formData.sample_date,
            report_date: formData.report_date,
            verified_by: formData.verified_by,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Lab report created successfully!");

        // Redirect to download page
        router.push(`/dashboard/lab-reports/${data.report.id}/download`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create lab report");
      }
    } catch (error) {
      console.error("Error creating lab report:", error);
      toast.error("Failed to create lab report");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const requiredFields = [
      formData.full_name,
      formData.gender,
      formData.age,
      formData.mobile,
      formData.test_name,
      formData.result,
      formData.sample_date,
      formData.report_date,
    ];

    return requiredFields.every(
      (field) => field && field.toString().trim() !== ""
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-3xl font-bold text-foreground">
          Create Lab Report
        </h2>
        <p className="text-muted-foreground">
          Create a new laboratory test report for a customer
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Customer Search/Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Search for existing customer or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedCustomer && !showNewCustomerForm && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by mobile number..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), searchCustomers())
                        }
                      />
                    </div>
                    <Button type="button" onClick={searchCustomers}>
                      Search
                    </Button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="border rounded-lg divide-y">
                      {searchResults.map((customer) => (
                        <div
                          key={customer.id}
                          className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">
                                {customer.full_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Mobile: {customer.mobile} • Age: {customer.age}{" "}
                                • {customer.gender}
                              </p>
                            </div>
                            <Button type="button" variant="outline" size="sm">
                              Select
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleNewCustomer}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Create New Customer
                    </Button>
                  </div>
                </div>
              )}

              {(selectedCustomer || showNewCustomerForm) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        handleInputChange("full_name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value: "Male" | "Female" | "Other") =>
                        handleInputChange("gender", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="150"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number *</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) =>
                        handleInputChange("mobile", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lab Report Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Lab Report Details</CardTitle>
              <CardDescription>
                Lab ID will be automatically generated when you submit the form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="referred_by">Referred By</Label>
                  <Input
                    id="referred_by"
                    value={formData.referred_by}
                    onChange={(e) =>
                      handleInputChange("referred_by", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verified_by">Verified By</Label>
                  <Input
                    id="verified_by"
                    value={formData.verified_by}
                    onChange={(e) =>
                      handleInputChange("verified_by", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test_name">Test Name *</Label>
                  <Select
                    value={formData.test_name}
                    onValueChange={(value) =>
                      handleInputChange("test_name", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Test" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_NAME_OPTIONS.map((test) => (
                        <SelectItem key={test.value} value={test.value}>
                          {test.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="result">Result *</Label>
                  <Select
                    value={formData.result}
                    onValueChange={(value) =>
                      handleInputChange("result", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Result" />
                    </SelectTrigger>
                    <SelectContent>
                      {getResultOptions().map((result) => (
                        <SelectItem key={result.value} value={result.value}>
                          {result.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sample_date">Sample Date *</Label>
                  <Input
                    id="sample_date"
                    type="date"
                    value={formData.sample_date}
                    onChange={(e) =>
                      handleInputChange("sample_date", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report_date">Report Date *</Label>
                  <Input
                    id="report_date"
                    type="date"
                    value={formData.report_date}
                    onChange={(e) =>
                      handleInputChange("report_date", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid() || loading}>
              {loading ? "Creating Report..." : "Create Lab Report"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
