// types/prescription.ts
export interface Medicine {
  name: string;
  rules: string;
  days: string;
  notes?: string;
}

export interface Prescription {
  id: number;
  patient_id: number;
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