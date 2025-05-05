import { Transaction, Subscription, Budget, Category, DateRange } from '../types';

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Calculate total income for a given date range
export const calculateTotalIncome = (
  transactions: Transaction[],
  dateRange?: DateRange
): number => {
  return transactions
    .filter(t => {
      if (t.type !== 'income') return false;
      if (!dateRange) return true;
      
      const transactionDate = new Date(t.date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      return transactionDate >= startDate && transactionDate <= endDate;
    })
    .reduce((total, t) => total + t.amount, 0);
};

// Calculate total expenses for a given date range
export const calculateTotalExpenses = (
  transactions: Transaction[],
  subscriptions: Subscription[],
  dateRange?: DateRange
): number => {
  const expenseTotal = transactions
    .filter(t => {
      if (t.type !== 'expense') return false;
      if (!dateRange) return true;
      
      const transactionDate = new Date(t.date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      return transactionDate >= startDate && transactionDate <= endDate;
    })
    .reduce((total, t) => total + t.amount, 0);
  
  // Only include active subscriptions
  const subscriptionTotal = subscriptions
    .filter(s => s.isActive)
    .reduce((total, s) => {
      if (!dateRange) return total + s.amount;
      
      // Estimate monthly contribution of subscriptions based on billing cycle
      const amountPerMonth = s.billingCycle === 'monthly' 
        ? s.amount 
        : s.billingCycle === 'quarterly' 
          ? s.amount / 3 
          : s.amount / 12;
      
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                          endDate.getMonth() - startDate.getMonth() + 1;
      
      return total + (amountPerMonth * monthsDiff);
    }, 0);
  
  return expenseTotal + subscriptionTotal;
};

// Get current balance
export const calculateBalance = (
  transactions: Transaction[],
  subscriptions: Subscription[],
  dateRange?: DateRange
): number => {
  const income = calculateTotalIncome(transactions, dateRange);
  const expenses = calculateTotalExpenses(transactions, subscriptions, dateRange);
  
  return income - expenses;
};

// Calculate budget progress
export const calculateBudgetProgress = (
  budget: Budget,
  transactions: Transaction[]
): { spent: number; percentage: number; remaining: number } => {
  // Get the start of the current period based on budget period
  const now = new Date();
  let periodStart: Date;
  
  if (budget.period === 'monthly') {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (budget.period === 'quarterly') {
    const quarter = Math.floor(now.getMonth() / 3);
    periodStart = new Date(now.getFullYear(), quarter * 3, 1);
  } else { // yearly
    periodStart = new Date(now.getFullYear(), 0, 1);
  }
  
  // Calculate total spent in this period for this category/budget
  const spent = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const isAfterStart = transactionDate >= periodStart;
      const matchesCategory = !budget.categoryId || t.categoryId === budget.categoryId;
      return t.type === 'expense' && isAfterStart && matchesCategory;
    })
    .reduce((total, t) => total + t.amount, 0);
  
  const percentage = Math.min(Math.round((spent / budget.amount) * 100), 100);
  const remaining = Math.max(budget.amount - spent, 0);
  
  return { spent, percentage, remaining };
};

// Check if a subscription is due for renewal soon (within next 7 days)
export const isSubscriptionRenewalSoon = (subscription: Subscription): boolean => {
  const renewalDate = new Date(subscription.renewalDate);
  const today = new Date();
  const daysUntilRenewal = Math.ceil(
    (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysUntilRenewal >= 0 && daysUntilRenewal <= 7;
};

// Generate array of dates for the current month
export const getDatesForCurrentMonth = (): { start: string; end: string } => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

// Generate array of dates for the current year
export const getDatesForCurrentYear = (): { start: string; end: string } => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear(), 11, 31);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

// Generate CSV data from transactions
export const generateTransactionsCSV = (
  transactions: Transaction[],
  categories: Category[]
): string => {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Notes'];
  
  const categoryMap = categories.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {} as Record<string, string>);
  
  const rows = transactions.map(transaction => [
    formatDate(transaction.date),
    transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
    categoryMap[transaction.categoryId] || 'Uncategorized',
    transaction.description,
    transaction.amount.toString(),
    transaction.notes || '',
  ]);
  
  // Combine headers and rows
  const csvData = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvData;
};

// Download file helper
export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};