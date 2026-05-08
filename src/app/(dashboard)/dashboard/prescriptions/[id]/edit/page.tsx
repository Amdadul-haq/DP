//src/app/dashboard/prescriptions/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import { HybridField } from "@/components/prescription/HybridField";
import { MedicineForm } from "@/components/prescription/MedicineForm";
import {
  CC_OPTIONS,
  DIAGNOSIS_OPTIONS,
  HISTORY_OPTIONS,
  TESTS_OPTIONS,
  ADVICE_OPTIONS,
} from "@/lib/prescription-options";
import {
  PulseIcon,
  Heart,
  Thermometer,
  Weight,
  Calendar,
  User,
  FileText,
  Stethoscope,
  Pill,
  Search,
} from "@/components/ui/CustomIcons";

interface Patient {
  id: number;
  patient_number: number;
  full_name: string;
  gender: string;
  age: number;
  mobile: string;
  email?: string;
  blood_group?: string;
}

interface Vitals {
  blood_pressure?: string;
  pulse?: string;
  weight?: string;
  temperature?: string;
  created_at?: string;
}

interface Medicine {
  name: string;
  rules: string;
  days: string;
  notes?: string;
}

interface MedicineSearchResult {
  id: number;
  brand_name: string;
  dosage_form: string;
  generic: string;
  strength: string | null;
  manufacturer: string;
}

interface PrescriptionResponse {
  id: number;
  patient_id: number;
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
  medicines: Medicine[];
}

export default function EditPrescriptionPage() {
  const router = useRouter();
  const params = useParams();
  const prescriptionId = params.id as string;

  const [loadingPrescription, setLoadingPrescription] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [nextVisitDate, setNextVisitDate] = useState<Date>();
  const [form, setForm] = useState({
    diagnosis: "",
    history: "",
    cc: "",
    bp: "",
    pulse: "",
    weight: "",
    temperature: "",
    tests: "",
    advice: "",
  });
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: "", rules: "", days: "", notes: "" },
  ]);
  const [showNoChangesDialog, setShowNoChangesDialog] = useState(false);
  const [originalData, setOriginalData] = useState<{
    form: typeof form;
    medicines: Medicine[];
    nextVisitDate: Date | null;
    patientId: number | null;
  } | null>(null);
  const [medicineResults, setMedicineResults] = useState<MedicineSearchResult[]>([]);
  const [searchingMedicine, setSearchingMedicine] = useState(false);
  const [activeMedicineIndex, setActiveMedicineIndex] = useState<number | null>(null);

  const normalizeText = (value: string | undefined | null) => value?.trim() || "";

  const normalizeDate = (value: Date | null | undefined) =>
    value ? format(value, "yyyy-MM-dd") : "";

  const areMedicinesEqual = (currentMedicines: Medicine[], originalMedicines: Medicine[]) => {
    if (currentMedicines.length !== originalMedicines.length) {
      return false;
    }

    return currentMedicines.every((medicine, index) => {
      const originalMedicine = originalMedicines[index];
      return (
        normalizeText(medicine.name) === normalizeText(originalMedicine.name) &&
        normalizeText(medicine.rules) === normalizeText(originalMedicine.rules) &&
        normalizeText(medicine.days) === normalizeText(originalMedicine.days) &&
        normalizeText(medicine.notes) === normalizeText(originalMedicine.notes)
      );
    });
  };

  const hasChanges = () => {
    if (!originalData) {
      return true;
    }

    const fieldsChanged =
      normalizeText(form.diagnosis) !== normalizeText(originalData.form.diagnosis) ||
      normalizeText(form.history) !== normalizeText(originalData.form.history) ||
      normalizeText(form.cc) !== normalizeText(originalData.form.cc) ||
      normalizeText(form.bp) !== normalizeText(originalData.form.bp) ||
      normalizeText(form.pulse) !== normalizeText(originalData.form.pulse) ||
      normalizeText(form.weight) !== normalizeText(originalData.form.weight) ||
      normalizeText(form.temperature) !== normalizeText(originalData.form.temperature) ||
      normalizeText(form.tests) !== normalizeText(originalData.form.tests) ||
      normalizeText(form.advice) !== normalizeText(originalData.form.advice);

    if (fieldsChanged) {
      return true;
    }

    if (patient?.id !== originalData.patientId) {
      return true;
    }

    if (!areMedicinesEqual(medicines, originalData.medicines)) {
      return true;
    }

    return normalizeDate(nextVisitDate) !== normalizeDate(originalData.nextVisitDate);
  };

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          toast.error("Failed to fetch prescription");
          router.push("/dashboard/prescriptions");
          return;
        }

        const data = await response.json();
        const prescription: PrescriptionResponse = data.prescription;

        setPatientId(prescription.patient_number.toString());
        setPatient({
          id: prescription.patient_id,
          patient_number: prescription.patient_number,
          full_name: prescription.patient_name,
          gender: prescription.patient_gender,
          age: prescription.patient_age,
          mobile: prescription.patient_mobile,
        });
        setVitals({
          blood_pressure: prescription.bp || "",
          pulse: prescription.pulse || "",
          weight: prescription.weight || "",
          temperature: prescription.temperature || "",
          created_at: prescription.created_at,
        });
        setForm({
          diagnosis: prescription.diagnosis || "",
          history: prescription.history || "",
          cc: prescription.cc || "",
          bp: prescription.bp || "",
          pulse: prescription.pulse || "",
          weight: prescription.weight || "",
          temperature: prescription.temperature || "",
          tests: prescription.tests || "",
          advice: prescription.advice || "",
        });
        const loadedMedicines =
          prescription.medicines && prescription.medicines.length > 0
            ? prescription.medicines.map((medicine) => ({
                name: medicine.name || "",
                rules: medicine.rules || "",
                days: medicine.days || "",
                notes: medicine.notes || "",
              }))
            : [{ name: "", rules: "", days: "", notes: "" }];

        const loadedNextVisitDate = prescription.next_visit_date
          ? new Date(prescription.next_visit_date)
          : null;

        setMedicines(loadedMedicines);
        setNextVisitDate(loadedNextVisitDate || undefined);
        setOriginalData({
          form: {
            diagnosis: prescription.diagnosis || "",
            history: prescription.history || "",
            cc: prescription.cc || "",
            bp: prescription.bp || "",
            pulse: prescription.pulse || "",
            weight: prescription.weight || "",
            temperature: prescription.temperature || "",
            tests: prescription.tests || "",
            advice: prescription.advice || "",
          },
          medicines: loadedMedicines,
          nextVisitDate: loadedNextVisitDate,
          patientId: prescription.patient_id,
        });
      } catch (error) {
        toast.error("Failed to fetch prescription");
        router.push("/dashboard/prescriptions");
      } finally {
        setLoadingPrescription(false);
      }
    };

    fetchPrescription();
  }, [prescriptionId, router]);

  const clearMedicineResults = () => {
    setMedicineResults([]);
    setActiveMedicineIndex(null);
  };

  const searchPatient = async () => {
    if (!patientId.trim()) {
      toast.error("Please enter a patient ID");
      return;
    }

    setSearching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/patients/search?number=${patientId.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPatient(data.patient);
        setVitals(data.vitals || null);
        setPatientId(data.patient.patient_number.toString());

        if (data.vitals) {
          setForm((prev) => ({
            ...prev,
            bp: data.vitals.blood_pressure || "",
            pulse: data.vitals.pulse || "",
            weight: data.vitals.weight || "",
            temperature: data.vitals.temperature || "",
          }));
        }

        toast.success("Patient found!");
      } else {
        toast.error("Patient not found");
        setPatient(null);
        setVitals(null);
      }
    } catch (error) {
      toast.error("Failed to search patient");
    } finally {
      setSearching(false);
    }
  };

  const searchMedicines = async (searchTerm: string, index: number) => {
    if (searchTerm.length < 2) {
      clearMedicineResults();
      return;
    }

    setSearchingMedicine(true);
    setActiveMedicineIndex(index);
    try {
      const response = await fetch(`/api/medicines?search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setMedicineResults(data.medicines || []);
      }
    } catch (error) {
      toast.error("Failed to search medicines");
    } finally {
      setSearchingMedicine(false);
    }
  };

  const addMedicineField = () => {
    setMedicines([...medicines, { name: "", rules: "", days: "", notes: "" }]);
  };

  const removeMedicineField = (index: number) => {
    if (medicines.length === 1) {
      setMedicines([{ name: "", rules: "", days: "", notes: "" }]);
    } else {
      setMedicines(medicines.filter((_, currentIndex) => currentIndex !== index));
    }
  };

  const updateMedicineField = (
    index: number,
    field: keyof Medicine,
    value: string
  ) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    setMedicines(updatedMedicines);
  };

  const handleHybridFieldChange = (
    field: keyof typeof form,
    value: string,
    option?: string
  ) => {
    if (option) {
      const currentValues = form[field].split(", ").filter(Boolean);
      if (currentValues.includes(option)) {
        setForm((prev) => ({
          ...prev,
          [field]: currentValues.filter((currentValue) => currentValue !== option).join(", "),
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          [field]: [...currentValues, option].join(", "),
        }));
      }
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleVitalsChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges()) {
      setShowNoChangesDialog(true);
      return;
    }

    if (!patient) {
      toast.error("Please search and select a patient first");
      return;
    }

    if (!form.diagnosis.trim()) {
      toast.error("Diagnosis is required");
      return;
    }

    const validMedicines = medicines.filter(
      (medicine) => medicine.name.trim() && medicine.rules.trim() && medicine.days.trim()
    );

    if (validMedicines.length === 0) {
      toast.error("Please add at least one medicine");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          authToken: token,
          patient_id: patient.id,
          ...form,
          next_visit_date: nextVisitDate ? format(nextVisitDate, "yyyy-MM-dd") : undefined,
          medicines: validMedicines,
        }),
      });

      if (response.ok) {
        toast.success("Prescription updated successfully!");
        router.push(`/dashboard/prescriptions/${prescriptionId}/preview`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update prescription");
      }
    } catch (error) {
      toast.error("Failed to update prescription");
    } finally {
      setSaving(false);
    }
  };

  if (loadingPrescription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold text-foreground">
          Edit Prescription
        </h2>
        <p className="text-muted-foreground text-lg">
          Update prescription details and medicines
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
            <CardDescription className="text-base">
              Search for patient by ID to update or keep the current patient
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-base">Patient ID *</Label>
                <div className="relative">
                  <Input
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="Enter patient ID"
                    className="pr-16 text-base h-12"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        searchPatient();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={searchPatient}
                    disabled={searching}
                  >
                    {searching ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {patient && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg border">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <p className="font-medium text-base">{patient.full_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">
                    Age/Sex
                  </Label>
                  <p className="font-medium text-base">
                    {patient.age}y / {patient.gender}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">
                    Mobile
                  </Label>
                  <p className="font-medium text-base">{patient.mobile}</p>
                </div>
                {patient.blood_group && (
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      Blood Group
                    </Label>
                    <Badge
                      variant="outline"
                      className="text-green-600 text-base"
                    >
                      {patient.blood_group}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {vitals && Object.keys(vitals).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-lg border">
                {vitals.blood_pressure && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <PulseIcon />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        BP
                      </Label>
                      <p className="font-medium text-base">
                        {vitals.blood_pressure}
                      </p>
                    </div>
                  </div>
                )}
                {vitals.pulse && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Heart className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Pulse
                      </Label>
                      <p className="font-medium text-base">{vitals.pulse}</p>
                    </div>
                  </div>
                )}
                {vitals.weight && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Weight className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Weight
                      </Label>
                      <p className="font-medium text-base">
                        {vitals.weight} kg
                      </p>
                    </div>
                  </div>
                )}
                {vitals.temperature && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Thermometer className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Temp
                      </Label>
                      <p className="font-medium text-base">
                        {vitals.temperature}°C
                      </p>
                    </div>
                  </div>
                )}
                {vitals.created_at && (
                  <div className="col-span-full text-sm text-muted-foreground">
                    Last recorded:{" "}
                    {new Date(vitals.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Stethoscope className="h-5 w-5" />
              Clinical Information
            </CardTitle>
            <CardDescription className="text-base">
              Patient&apos;s symptoms, diagnosis, and test recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HybridField
                label="Chief Complaints (CC)"
                value={form.cc}
                onChange={(value, option) =>
                  handleHybridFieldChange("cc", value, option)
                }
                options={CC_OPTIONS}
                placeholder="Enter chief complaints..."
              />

              <HybridField
                label="Diagnosis *"
                value={form.diagnosis}
                onChange={(value, option) =>
                  handleHybridFieldChange("diagnosis", value, option)
                }
                options={DIAGNOSIS_OPTIONS}
                placeholder="Enter diagnosis..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HybridField
                label="Medical History"
                value={form.history}
                onChange={(value, option) =>
                  handleHybridFieldChange("history", value, option)
                }
                options={HISTORY_OPTIONS}
                placeholder="Enter medical history..."
              />

              <HybridField
                label="Tests Recommended"
                value={form.tests}
                onChange={(value, option) =>
                  handleHybridFieldChange("tests", value, option)
                }
                options={TESTS_OPTIONS}
                placeholder="Enter recommended tests..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Current Vitals</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base">BP (mm/Hg)</Label>
                    <Input
                      value={form.bp}
                      onChange={(e) => handleVitalsChange("bp", e.target.value)}
                      placeholder="120/80"
                      className="text-base h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Pulse (bpm)</Label>
                    <Input
                      value={form.pulse}
                      onChange={(e) =>
                        handleVitalsChange("pulse", e.target.value)
                      }
                      placeholder="72"
                      className="text-base h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Weight (kg)</Label>
                    <Input
                      value={form.weight}
                      onChange={(e) =>
                        handleVitalsChange("weight", e.target.value)
                      }
                      placeholder="65"
                      className="text-base h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Temp (°C)</Label>
                    <Input
                      value={form.temperature}
                      onChange={(e) =>
                        handleVitalsChange("temperature", e.target.value)
                      }
                      placeholder="98.6"
                      className="text-base h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Follow-up</h4>
                <div className="space-y-2">
                  <Label className="text-base">Next Visit Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal text-base h-12",
                          !nextVisitDate && "text-muted-foreground",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {nextVisitDate
                          ? format(nextVisitDate, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={nextVisitDate}
                        onSelect={setNextVisitDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <HybridField
                  label="Advice"
                  value={form.advice}
                  onChange={(value, option) =>
                    handleHybridFieldChange("advice", value, option)
                  }
                  options={ADVICE_OPTIONS}
                  placeholder="Add advice for the patient..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Pill className="h-5 w-5" />
              Medicines
            </CardTitle>
            <CardDescription className="text-base">
              Add medicines with feeding instructions (at least one required)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {medicines.map((medicine, index) => (
              <MedicineForm
                key={index}
                medicine={medicine}
                index={index}
                onUpdate={updateMedicineField}
                onRemove={removeMedicineField}
                onAdd={addMedicineField}
                onSearch={searchMedicines}
                searching={searchingMedicine}
                searchResults={medicineResults}
                activeIndex={activeMedicineIndex}
                onClearResults={clearMedicineResults}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(
                    `/dashboard/prescriptions/${prescriptionId}/preview`,
                  )
                }
                className="flex-1 sm:flex-none h-12 text-base"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !patient}
                className="flex-1 sm:flex-none h-12 text-base"
              >
                {saving ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Update Prescription
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        <AlertDialog
          open={showNoChangesDialog}
          onOpenChange={setShowNoChangesDialog}
        >
          <AlertDialogContent >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-6 w-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
              onClick={() => setShowNoChangesDialog(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <AlertDialogHeader>
              <AlertDialogTitle>No Changes Made</AlertDialogTitle>
              <AlertDialogDescription>
                You haven't made any changes to this prescription. Do you want
                to go back to preview?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Editing</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowNoChangesDialog(false);
                  router.push(
                    `/dashboard/prescriptions/${prescriptionId}/preview`,
                  );
                }}
                className="ml-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Go Back to Preview
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </div>
  );
}