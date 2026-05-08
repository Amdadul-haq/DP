// src/components/prescription/MedicineForm.tsx
"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Plus } from "lucide-react";
import { HybridInput } from "./HybridInput";
import { HybridField } from "./HybridField";
import { FEEDING_RULES, FEEDING_DAYS,NOTES_OPTIONS } from "@/lib/prescription-options";
import { getDosageShortcut } from "@/lib/dosage-shortcut";

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

interface MedicineFormProps {
  medicine: Medicine;
  index: number;
  onUpdate: (index: number, field: keyof Medicine, value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  onSearch: (term: string, index: number) => Promise<void>;
  searching: boolean;
  searchResults: MedicineSearchResult[];
  activeIndex: number | null;
  onClearResults: () => void;
}

// Simple icon mapping function
const getFormIcon = (form: string) => {
  const lower = form.toLowerCase();
  if (lower.includes("tablet")) return "💊";
  if (lower.includes("cap") || lower.includes("capsule")) return "💊";
  if (
    lower.includes("syrup") ||
    lower.includes("suspension") ||
    lower.includes("liquid")
  )
    return "🧪";
  if (lower.includes("injection") || lower.includes("inj")) return "💉";
  return "💊";
};

export function MedicineForm({
  medicine,
  index,
  onUpdate,
  onRemove,
  onAdd,
  onSearch,
  searching,
  searchResults,
  activeIndex,
  onClearResults,
}: MedicineFormProps) {
  const [localSearch, setLocalSearch] = useState(medicine.name);

  useEffect(() => {
    setLocalSearch(medicine.name);
  }, [medicine.name]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onUpdate(index, "name", value);
    if (value.length > 1) {
      onSearch(value, index);
    } else {
      onClearResults();
    }
  };

  const handleMedicineSelect = (medicineData: MedicineSearchResult) => {

  const dosageShort = getDosageShortcut(medicineData.dosage_form);

  const displayName = `${dosageShort} ${medicineData.brand_name}${
    medicineData.strength ? ` ${medicineData.strength}` : ""
  }`;

  onUpdate(index, "name", displayName);
  setLocalSearch(displayName);
  onClearResults();
  };

  const handleClearMedicine = () => {
    onUpdate(index, "name", "");
    setLocalSearch("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border rounded-lg bg-background">
      {/* Medicine Search */}
      <div className="md:col-span-4 space-y-2 relative">
        <Label className="text-base">Medicine {index + 1} *</Label>
        <div className="relative">
          <Input
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search medicine..."
            className="pr-10 text-base h-12"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() =>
              localSearch.length > 1 && onSearch(localSearch, index)
            }
            disabled={searching || localSearch.length < 2}
          >
            {searching ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {activeIndex === index && searchResults.length > 0 && (
          <div className="absolute z-10 w-80 bg-background border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
            {searchResults.map((med) => (
              <div
                key={med.id}
                className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted border-b last:border-b-0 group"
                onClick={() => handleMedicineSelect(med)}
                title={`${med.brand_name} - ${med.dosage_form}${
                  med.strength ? ` (${med.strength})` : ""
                }`}
              >
                <span className="text-lg">{getFormIcon(med.dosage_form)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {med.brand_name}
                    {med.strength ? ` - ${med.strength}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {med.generic}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {med.dosage_form}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feeding Rules - Hybrid Input */}
      <div className="md:col-span-3 space-y-2">
        <HybridInput
          label="Rules *"
          value={medicine.rules}
          onChange={(value) => onUpdate(index, "rules", value)}
          options={FEEDING_RULES}
          placeholder="e.g., 1+1+1"
        />
      </div>

      {/* Days - Hybrid Input */}
      <div className="md:col-span-2 space-y-2">
        <HybridInput
          label="Duration *"
          value={medicine.days}
          onChange={(value) => onUpdate(index, "days", value)}
          options={FEEDING_DAYS}
          placeholder="e.g., 7 days"
        />
      </div>

      {/* Notes - HybridInput */}
      <div className="md:col-span-3 space-y-2">
        <HybridInput
          label="Notes"
          value={medicine.notes || ""}
          onChange={(value) => onUpdate(index, "notes", value)}
          options={NOTES_OPTIONS}
          placeholder="Add notes or select from options"
        />
      </div>

      {/* Action Buttons */}
      <div className="md:col-span-1 space-y-2">
        <Label className="invisible">Actions</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onRemove(index)}
            className="h-12 w-12 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
            title="Remove medicine"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAdd}
            className="h-12 w-12 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
            title="Add new medicine"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
