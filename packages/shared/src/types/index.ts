// Shared types used across mobile and server

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  monthlyIncome?: number; // in paise
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  accountType: "savings" | "current" | "credit_card";
  balance: number; // in paise
  lastSynced: string;
  finvuConsentId?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number; // in paise (positive = credit, negative = debit)
  currency: "INR";
  description: string;
  merchantName?: string;
  category?: string;
  subcategory?: string;
  emoji?: string;
  transactionDate: string;
  referenceId?: string;
  mode: "UPI" | "NEFT" | "IMPS" | "CARD" | "CASH" | "OTHER";
  isRecurring: boolean;
  enriched: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Memory {
  id: string;
  userId: string;
  content: string;
  embedding?: number[];
  category: "preference" | "fact" | "context" | "financial";
  createdAt: string;
}

export interface Insight {
  id: string;
  userId: string;
  type: "spending_spike" | "recurring_charge" | "savings_opportunity" | "roast" | "tip" | "deep_dive";
  title: string;
  body: string;
  amountRelated?: number; // in paise
  category?: string;
  read: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limitAmount: number; // in paise
  spentAmount: number; // in paise
  period: "weekly" | "monthly";
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number; // in paise
  currentAmount: number; // in paise
  emoji: string;
  deadline?: string;
  createdAt: string;
}

export interface RecurringCharge {
  id: string;
  userId: string;
  merchantName: string;
  amount: number; // in paise
  frequency: "weekly" | "monthly" | "quarterly" | "yearly";
  category: string;
  lastChargedAt: string;
  nextExpectedAt: string;
  isActive: boolean;
}

export interface AdvanceRequest {
  id: string;
  userId: string;
  amount: number; // in paise
  status: "pending" | "approved" | "disbursed" | "repaid" | "rejected";
  repayDate: string;
  razorpayPaymentId?: string;
  createdAt: string;
}
