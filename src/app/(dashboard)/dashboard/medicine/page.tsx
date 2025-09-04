"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Pill, Syringe, FlaskConical } from "lucide-react";

interface Medicine {
  id: number;
  brand_name: string;
  dosage_form: string;
  generic: string;
  strength: string | null;
  manufacturer: string;
}

export default function MedicinePage() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [showDialog, setShowDialog] = useState(false);
  const [updateForm, setUpdateForm] = useState<Partial<Medicine>>({});
  const [addForm, setAddForm] = useState<Partial<Medicine>>({});
  const [addLoading, setAddLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const getFormIcon = (form: string) => {
    const lower = form.toLowerCase();
    if (lower.includes("tablet") || lower.includes("cap"))
      return <Pill className="w-4 h-4 text-blue-500" />;
    if (lower.includes("syrup") || lower.includes("suspension"))
      return <FlaskConical className="w-4 h-4 text-green-500" />;
    if (lower.includes("injection") || lower.includes("inj"))
      return <Syringe className="w-4 h-4 text-red-500" />;
    return <Pill className="w-4 h-4 text-gray-400" />;
  };

  // 🔎 Search medicines
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setSelectedMedicine(null);
    setUpdateForm({});

    if (!value || value.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    const res = await fetch(
      `/api/medicines?search=${encodeURIComponent(value)}`
    );
    const data = await res.json();
    setSearchResults(data.medicines || []);
    setSearchLoading(false);
  };

  const handleSelectMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setUpdateForm(medicine);
    setSearchResults([]);
    setSearch(medicine.brand_name);
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    setShowDialog(true);
  };

  const confirmUpdate = async () => {
    setUpdateLoading(true);
    const res = await fetch(`/api/medicines/${selectedMedicine?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateForm),
    });
    const data = await res.json();
    setSelectedMedicine(data.medicine);
    setUpdateForm(data.medicine);
    setUpdateLoading(false);
    setShowDialog(false);
    toast.success("Medicine updated successfully!");
  };

  const handleAdd = async () => {
    setAddLoading(true);
    const res = await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    await res.json();
    setAddForm({});
    setAddLoading(false);
    toast.success("Medicine added successfully!");
  };

  const handleClear = () => {
    setSearch("");
    setSearchResults([]);
    setSelectedMedicine(null);
    setUpdateForm({});
  };

  return (
    <div>
      {/* Heading */}
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-3xl font-bold text-foreground">
          Medicine Management
        </h2>
        <p className="text-muted-foreground">
          Search, add, and update medicines easily.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative max-w-md">
        <Label htmlFor="search">Search Medicine</Label>
        <div className="relative">
          <Input
            id="search"
            name="search"
            value={search}
            onChange={handleSearch}
            placeholder="Type brand name..."
            autoComplete="off"
          />
          {searchLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-8 top-1/2 -translate-y-1/2 text-xs"
              onClick={handleClear}
            >
              ✕
            </Button>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full bg-background border rounded shadow mt-1 max-h-60 overflow-y-auto">
            {searchResults.map((medicine) => (
              <div
                key={medicine.id}
                className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-muted"
                onClick={() => handleSelectMedicine(medicine)}
              >
                {getFormIcon(medicine.dosage_form)}
                <span className="font-medium">{medicine.brand_name}</span>
                {medicine.strength && (
                  <span className="text-sm text-muted-foreground">
                    {medicine.strength}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Medicine Update Form */}
      {selectedMedicine && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Update Medicine</CardTitle>
            <CardDescription>Edit details and update</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Brand Name</Label>
                <Input
                  name="brand_name"
                  value={updateForm.brand_name || ""}
                  onChange={handleUpdateChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Dosage Form</Label>
                <Input
                  name="dosage_form"
                  value={updateForm.dosage_form || ""}
                  onChange={handleUpdateChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Generic</Label>
                <Input
                  name="generic"
                  value={updateForm.generic || ""}
                  onChange={handleUpdateChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Strength</Label>
                <Input
                  name="strength"
                  value={updateForm.strength || ""}
                  onChange={handleUpdateChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Manufacturer</Label>
                <Input
                  name="manufacturer"
                  value={updateForm.manufacturer || ""}
                  onChange={handleUpdateChange}
                />
              </div>
            </div>
            <Button onClick={handleUpdate} disabled={updateLoading}>
              Update Medicine
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add New Medicine */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Medicine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Brand Name</Label>
              <Input
                name="brand_name"
                value={addForm.brand_name || ""}
                onChange={handleAddChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Dosage Form</Label>
              <Input
                name="dosage_form"
                value={addForm.dosage_form || ""}
                onChange={handleAddChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Generic</Label>
              <Input
                name="generic"
                value={addForm.generic || ""}
                onChange={handleAddChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Strength</Label>
              <Input
                name="strength"
                value={addForm.strength || ""}
                onChange={handleAddChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Manufacturer</Label>
              <Input
                name="manufacturer"
                value={addForm.manufacturer || ""}
                onChange={handleAddChange}
              />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={addLoading}>
            Add Medicine
          </Button>
        </CardContent>
      </Card>

      {/* Update Confirm Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to update this medicine?</div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={updateLoading}
            >
              Cancel
            </Button>
            <Button onClick={confirmUpdate} disabled={updateLoading}>
              Yes, Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
