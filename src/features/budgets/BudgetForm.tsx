import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useData } from '../../context/DataContext';
import { Budget } from '../../types';
import { 
  ArrowLeft, 
  X, 
  Save,
  DollarSign,
} from 'lucide-react';

interface BudgetFormProps {
  budget?: Budget | null;
  onClose: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  budget,
  onClose,
}) => {
  const { state, addBudget, updateBudget, deleteBudget } = useData();
  const { categories } = state;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formState, setFormState] = useState<{
    name: string;
    amount: string;
    period: 'monthly' | 'quarterly' | 'yearly';
    categoryId?: string;
    startDate: string;
    endDate?: string;
    color?: string;
  }>({
    name: '',
    amount: '',
    period: 'monthly',
    categoryId: '',
    startDate: new Date().toISOString().split('T')[0],
    color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
  });
  
  // Initialize form with budget data if editing
  useEffect(() => {
    if (budget) {
      setFormState({
        name: budget.name,
        amount: budget.amount.toString(),
        period: budget.period,
        categoryId: budget.categoryId,
        startDate: budget.startDate,
        endDate: budget.endDate,
        color: budget.color || '#818cf8',
      });
    }
  }, [budget]);
  
  // Filter for expense categories only
  const filteredCategories = categories.filter(
    category => category.type === 'expense'
  );
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFormState(prev => ({ ...prev, categoryId: value === 'none' ? undefined : value }));
  };
  
  const handlePeriodChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      period: value as 'monthly' | 'quarterly' | 'yearly',
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate form
      if (!formState.name.trim()) {
        throw new Error('Name is required');
      }
      
      if (!formState.amount || isNaN(Number(formState.amount)) || Number(formState.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (!formState.startDate) {
        throw new Error('Start date is required');
      }
      
      // Create or update budget
      const budgetData: Budget = {
        id: budget?.id || crypto.randomUUID(),
        name: formState.name.trim(),
        amount: parseFloat(formState.amount),
        period: formState.period,
        categoryId: formState.categoryId,
        startDate: formState.startDate,
        endDate: formState.endDate,
        color: formState.color,
      };
      
      if (budget) {
        updateBudget(budgetData);
      } else {
        addBudget(budgetData);
      }
      
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = () => {
    if (!budget) return;
    
    setIsDeleting(true);
    deleteBudget(budget.id);
    onClose();
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {budget ? 'Edit Budget' : 'Add Budget'}
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClose}
          icon={<ArrowLeft size={16} />}
        >
          Back
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Name */}
          <Input
            label="Budget Name"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
            placeholder="e.g., Monthly Expenses, Food, etc."
            required
            fullWidth
          />
          
          {/* Amount */}
          <Input
            label="Budget Amount"
            name="amount"
            type="number"
            value={formState.amount}
            onChange={handleInputChange}
            min="0.01"
            step="0.01"
            placeholder="0.00"
            required
            fullWidth
            icon={<DollarSign size={16} />}
          />
          
          {/* Budget Period */}
          <Select
            label="Budget Period"
            value={formState.period}
            onChange={handlePeriodChange}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
            required
            fullWidth
          />
          
          {/* Category (Optional) */}
          <Select
            label="Category (Optional - keep empty for overall budget)"
            value={formState.categoryId || 'none'}
            onChange={handleCategoryChange}
            options={[
              { value: 'none', label: 'No category (Overall budget)' },
              ...filteredCategories.map(category => ({
                value: category.id,
                label: category.name,
              })),
            ]}
            fullWidth
          />
          
          {/* Start Date */}
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formState.startDate}
            onChange={handleInputChange}
            required
            fullWidth
          />
          
          {/* End Date (Optional) */}
          <Input
            label="End Date (Optional)"
            name="endDate"
            type="date"
            value={formState.endDate || ''}
            onChange={handleInputChange}
            fullWidth
          />
          
          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                name="color"
                value={formState.color}
                onChange={handleInputChange}
                className="h-10 w-10 border-0 rounded p-0 cursor-pointer mr-2"
              />
              <input
                type="text"
                name="color"
                value={formState.color}
                onChange={handleInputChange}
                className="block flex-1 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="#000000"
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              />
            </div>
          </div>
          
          {error && (
            <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 pt-4">
            {budget ? (
              <div className="mt-3 sm:mt-0">
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setIsDeleting(true)}
                  disabled={isSubmitting}
                  icon={<X size={16} />}
                >
                  Delete
                </Button>
              </div>
            ) : (
              <div></div>
            )}
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                icon={<Save size={16} />}
              >
                {isSubmitting ? 'Saving...' : budget ? 'Save Changes' : 'Add Budget'}
              </Button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Delete Confirmation Dialog */}
      {isDeleting && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Delete Budget
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this budget? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  className="ml-3"
                >
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleting(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};