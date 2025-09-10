//lib/dosage-shortcut.ts
export const getDosageShortcut = (form: string) => {
  const lower = form.toLowerCase();
  if (lower.includes("tablet")) return "Tab.";
  if (lower.includes("cap")) return "Cap.";
  if (lower.includes("syrup")) return "Syp.";
  if (lower.includes("suspension")) return "Syp.";
  if (lower.includes("liquid")) return "Liq.";
  if (lower.includes("injection") || lower.includes("inj")) return "Inj.";
  if (lower.includes("drop")) return "Drop";
  return form; // fallback: original form
};
