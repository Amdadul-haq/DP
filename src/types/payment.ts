// types/payment.ts
export type PaymentMethod = 'bkash' | 'nagad' | 'rocket';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentConfig {
  id: number;
  payment_method: PaymentMethod;
  account_number: string;
  account_name: string;
  instructions: string;
  is_active: boolean;
}

export interface PaymentRequest {
  id: number;
  user_id: number;
  plan_id: number;
  billing_cycle: 'monthly' | 'yearly';
  payment_method: PaymentMethod;
  sender_number_last_4: string;
  transaction_id: string;
  amount: number;
  recipient_number: string;
  status: PaymentStatus;
  admin_id?: number;
  admin_note?: string;
  reviewed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentRequestWithDetails extends PaymentRequest {
  user_email: string;
  user_name: string;
  plan_name: string;
}

export interface CreatePaymentRequest {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  paymentMethod: PaymentMethod;
  senderNumberLast4: string;
  transactionId: string;
}
