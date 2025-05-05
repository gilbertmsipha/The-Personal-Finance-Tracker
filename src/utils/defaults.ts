import { Category } from '../types';

export const getDefaultCategories = (): Category[] => {
  return [
    // Income categories
    {
      id: 'income-salary',
      name: 'Salary',
      type: 'income',
      icon: 'BriefcaseIcon',
      color: '#10b981' // Emerald-500
    },
    {
      id: 'income-business',
      name: 'Business',
      type: 'income',
      icon: 'BuildingIcon',
      color: '#059669' // Emerald-600
    },
    {
      id: 'income-investments',
      name: 'Investments',
      type: 'income',
      icon: 'TrendingUpIcon',
      color: '#047857' // Emerald-700
    },
    {
      id: 'income-gifts',
      name: 'Gifts',
      type: 'income',
      icon: 'GiftIcon',
      color: '#065f46' // Emerald-800
    },
    {
      id: 'income-other',
      name: 'Other Income',
      type: 'income',
      icon: 'PlusCircleIcon',
      color: '#064e3b' // Emerald-900
    },
    
    // Expense categories
    {
      id: 'expense-housing',
      name: 'Housing',
      type: 'expense',
      icon: 'HomeIcon',
      color: '#3b82f6' // Blue-500
    },
    {
      id: 'expense-transportation',
      name: 'Transportation',
      type: 'expense',
      icon: 'CarIcon',
      color: '#2563eb' // Blue-600
    },
    {
      id: 'expense-food',
      name: 'Food & Dining',
      type: 'expense',
      icon: 'UtensilsIcon',
      color: '#1d4ed8' // Blue-700
    },
    {
      id: 'expense-utilities',
      name: 'Utilities',
      type: 'expense',
      icon: 'ZapIcon',
      color: '#1e40af' // Blue-800
    },
    {
      id: 'expense-healthcare',
      name: 'Healthcare',
      type: 'expense',
      icon: 'ActivityIcon',
      color: '#1e3a8a' // Blue-900
    },
    {
      id: 'expense-entertainment',
      name: 'Entertainment',
      type: 'expense',
      icon: 'FilmIcon',
      color: '#4f46e5' // Indigo-600
    },
    {
      id: 'expense-shopping',
      name: 'Shopping',
      type: 'expense',
      icon: 'ShoppingBagIcon',
      color: '#4338ca' // Indigo-700
    },
    {
      id: 'expense-subscriptions',
      name: 'Subscriptions',
      type: 'expense',
      icon: 'RepeatIcon',
      color: '#3730a3' // Indigo-800
    },
    {
      id: 'expense-education',
      name: 'Education',
      type: 'expense',
      icon: 'BookOpenIcon',
      color: '#312e81' // Indigo-900
    },
    {
      id: 'expense-other',
      name: 'Other Expenses',
      type: 'expense',
      icon: 'MoreHorizontalIcon',
      color: '#6366f1' // Indigo-500
    }
  ];
};

export const getDefaultBudgets = (): { name: string; amount: number; categoryId: string }[] => {
  return [
    { name: 'Housing', amount: 1500, categoryId: 'expense-housing' },
    { name: 'Food', amount: 600, categoryId: 'expense-food' },
    { name: 'Transportation', amount: 300, categoryId: 'expense-transportation' },
    { name: 'Entertainment', amount: 200, categoryId: 'expense-entertainment' },
    { name: 'Subscriptions', amount: 100, categoryId: 'expense-subscriptions' }
  ];
};