// app/(dashboard)/dashboard/prescriptions/new/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { HybridField } from "@/components/prescription/HybridField";
import { MedicineForm } from "@/components/prescription/MedicineForm";
import {
  CC_OPTIONS,
  DIAGNOSIS_OPTIONS,
  HISTORY_OPTIONS,
  TESTS_OPTIONS,
  ADVICE_OPTIONS, // Add this import
} from "@/lib/prescription-options";
import {
  PulseIcon,
  Heart,
  Thermometer,
  Weight,
  Calendar,
  User,
  Plus,
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

export default function NewPrescriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    advice: "", // Add advice field
  });

  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: "", rules: "", days: "", notes: "" },
  ]);

  const [medicineResults, setMedicineResults] = useState<
    MedicineSearchResult[]
  >([]);
  const [searchingMedicine, setSearchingMedicine] = useState(false);
  const [activeMedicineIndex, setActiveMedicineIndex] = useState<number | null>(
    null
  );

  // Clear medicine results
  const clearMedicineResults = () => {
    setMedicineResults([]);
    setActiveMedicineIndex(null);
  };

  // Update patient vitals when form values change
  const updateVitals = async () => {
    if (!patient) return;

    const hasVitalsChanged =
      form.bp !== (vitals?.blood_pressure || "") ||
      form.pulse !== (vitals?.pulse || "") ||
      form.weight !== (vitals?.weight || "") ||
      form.temperature !== (vitals?.temperature || "");

    if (!hasVitalsChanged) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/vitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient_id: patient.id,
          blood_pressure: form.bp,
          pulse: form.pulse,
          weight: form.weight,
          temperature: form.temperature,
        }),
      });

      if (response.ok) {
        const newVitals = await response.json();
        setVitals(newVitals.vitals);
        toast.success("Vitals updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update vitals:", error);
    }
  };

  // Search patient by ID
  const searchPatient = async () => {
    if (!patientId.trim()) {
      toast.error("Please enter a patient ID");
      return;
    }

    setSearching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/patients/search?number=${patientId.trim()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPatient(data.patient);
        setVitals(data.vitals || {});
        setPatientId(data.patient.patient_number.toString()); // ← This is the key fix

        // Auto-fill vitals if available
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

  // Search medicines
  const searchMedicines = async (searchTerm: string, index: number) => {
    if (searchTerm.length < 2) {
      clearMedicineResults();
      return;
    }

    setSearchingMedicine(true);
    setActiveMedicineIndex(index);
    try {
      const response = await fetch(
        `/api/medicines?search=${encodeURIComponent(searchTerm)}`
      );
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

  // Add new medicine field
  const addMedicineField = () => {
    setMedicines([...medicines, { name: "", rules: "", days: "", notes: "" }]);
  };

  // Remove medicine field
  const removeMedicineField = (index: number) => {
    if (medicines.length === 1) {
      setMedicines([{ name: "", rules: "", days: "", notes: "" }]);
    } else {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  // Update medicine field
  const updateMedicineField = (
    index: number,
    field: keyof Medicine,
    value: string
  ) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    setMedicines(updatedMedicines);
  };

  // Handle hybrid field change
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
          [field]: currentValues.filter((v) => v !== option).join(", "),
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

  // Handle vitals change
  const handleVitalsChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Submit prescription
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patient) {
      toast.error("Please search and select a patient first");
      return;
    }

    if (!form.diagnosis.trim()) {
      toast.error("Diagnosis is required");
      return;
    }

    const validMedicines = medicines.filter(
      (med) => med.name.trim() && med.rules.trim() && med.days.trim()
    );

    if (validMedicines.length === 0) {
      toast.error("Please add at least one medicine");
      return;
    }

    setLoading(true);

    try {
      // First update vitals if changed
      await updateVitals();

      // Then create prescription
      const token = localStorage.getItem("token");
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient_id: patient.id,
          ...form,
          next_visit_date: nextVisitDate
            ? format(nextVisitDate, "yyyy-MM-dd")
            : undefined,
          medicines: validMedicines,
        }),
      });

      if (response.ok) {
        toast.success("Prescription created successfully!");
        const data = await response.json();
        router.push(`/dashboard/prescriptions/${data.prescriptionId}/preview`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create prescription");
      }
    } catch (error) {
      toast.error("Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold text-foreground">New Prescription</h2>
        <p className="text-muted-foreground text-lg">
          Create a professional prescription for your patient
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Search Section */}
        <Card>
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
            <CardDescription className="text-base">
              Search for patient by ID to auto-fill information
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
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), searchPatient())
                    }
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

        {/* Clinical Information Section */}
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
            {/* CC and Diagnosis in one row */}
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

            {/* History and Tests in one row */}
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

            {/* Vitals and Next Visit */}
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
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal text-base h-12",
                          !nextVisitDate && "text-muted-foreground"
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
              {/* Advice Section */}
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

        {/* Medicines Section */}
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

        {/* Submit Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/prescriptions")}
                className="flex-1 sm:flex-none h-12 text-base"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !patient}
                className="flex-1 sm:flex-none h-12 text-base"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Create Prescription
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
