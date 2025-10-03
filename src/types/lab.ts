// types/lab.ts
export interface LabCustomer {
  id: number;
  customer_number: number;
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  mobile: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface LabReport {
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
  customer_name?: string;
}

export interface LabReportWithCustomer extends LabReport {
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  mobile: string;
  email?: string;
  address?: string;
}

export interface LabReportDetails {
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

export interface LabCustomerData {
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  mobile: string;
  email?: string;
  address?: string;
}

export interface LabReportData {
  lab_id: string;
  referred_by?: string;
  test_name: string;
  result: string;
  sample_date: string;
  report_date: string;
  verified_by?: string;
}

export interface LabReportResponse {
  id: number;
  lab_id: string;
  test_name: string;
  report_date: string;
  created_at: string;
  customer_name: string;
}