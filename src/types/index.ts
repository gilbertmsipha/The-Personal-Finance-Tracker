export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  categoryId: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  receiptUrl?: string;
  notes?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  startDate: string;
  renewalDate: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  categoryId: string;
  description?: string;
  logoUrl?: string;
  color?: string;
  isActive: boolean;
}

export interface Budget {
  id: string;
  name: string;
  amount: number; // This might represent the target budget amount
  allocatedAmount?: number; // Optional: The total funds allocated to this budget
  spentAmount?: number; // Optional: The amount spent from the allocated funds
  period: 'monthly' | 'quarterly' | 'yearly';
  categoryId?: string;
  startDate: string;
  endDate?: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  relatedItemId?: string;
  relatedItemType?: 'transaction' | 'subscription' | 'budget';
}