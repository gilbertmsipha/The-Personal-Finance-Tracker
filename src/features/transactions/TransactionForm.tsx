import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FileUpload } from '../../components/ui/FileUpload';
import { useData } from '../../context/DataContext';
import { Transaction } from '../../types';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Save,
  DollarSign,
  Calendar,
  Repeat,
} from 'lucide-react';
import { storeReceiptImage, deleteReceiptImage } from '../../utils/storage';

interface TransactionFormProps {
  transaction?: Transaction | null;
  onClose: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onClose,
}) => {
  const { state, addTransaction, updateTransaction, deleteTransaction } = useData();
  const { categories } = state;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formState, setFormState] = useState<{
    description: string;
    amount: string;
    date: string;
    type: 'income' | 'expense';
    categoryId: string;
    isRecurring: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    receiptFile: File | null;
    receiptUrl?: string;
    notes?: string;
  }>({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    categoryId: '',
    isRecurring: false,
    recurringFrequency: 'monthly',
    receiptFile: null,
    notes: '',
  });
  
  // Initialize form with transaction data if editing
  useEffect(() => {
    if (transaction) {
      setFormState({
        description: transaction.description,
        amount: transaction.amount.toString(),
        date: transaction.date,
        type: transaction.type,
        categoryId: transaction.categoryId,
        isRecurring: transaction.isRecurring,
        recurringFrequency: transaction.recurringFrequency,
        receiptFile: null,
        receiptUrl: transaction.receiptUrl,
        notes: transaction.notes || '',
      });
    }
  }, [transaction]);
  
  // Filter categories based on transaction type
  const filteredCategories = categories.filter(
    category => category.type === formState.type
  );
  
  useEffect(() => {
    // If no categories match the current type, reset categoryId
    if (
      formState.categoryId &&
      !filteredCategories.some(c => c.id === formState.categoryId)
    ) {
      setFormState(prev => ({
        ...prev,
        categoryId: filteredCategories.length > 0 ? filteredCategories[0].id : '',
      }));
    }
  }, [formState.type, formState.categoryId, filteredCategories]);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormState(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleTypeChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      type: value as 'income' | 'expense',
      // Reset category when type changes
      categoryId: '',
    }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFormState(prev => ({ ...prev, categoryId: value }));
  };
  
  const handleRecurringFrequencyChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      recurringFrequency: value as 'daily' | 'weekly' | 'monthly' | 'yearly',
    }));
  };
  
  const handleReceiptChange = async (file: File | null) => {
    setFormState(prev => ({ ...prev, receiptFile: file }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate form
      if (!formState.description.trim()) {
        throw new Error('Description is required');
      }
      
      if (!formState.amount || isNaN(Number(formState.amount)) || Number(formState.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (!formState.date) {
        throw new Error('Date is required');
      }
      
      if (!formState.categoryId) {
        throw new Error('Please select a category');
      }
      
      // Process receipt file if available
      let receiptUrl = formState.receiptUrl;
      
      if (formState.receiptFile) {
        receiptUrl = await storeReceiptImage(formState.receiptFile);
      }
      
      // Create or update transaction
      const transactionData: Transaction = {
        id: transaction?.id || crypto.randomUUID(),
        description: formState.description.trim(),
        amount: parseFloat(formState.amount),
        date: formState.date,
        type: formState.type,
        categoryId: formState.categoryId,
        isRecurring: formState.isRecurring,
        receiptUrl,
        notes: formState.notes?.trim(),
      };
      
      if (formState.isRecurring && formState.recurringFrequency) {
        transactionData.recurringFrequency = formState.recurringFrequency;
      }
      
      if (transaction) {
        // If receipt changed and old receipt exists, delete it
        if (transaction.receiptUrl && receiptUrl !== transaction.receiptUrl) {
          deleteReceiptImage(transaction.receiptUrl);
        }
        
        updateTransaction(transactionData);
      } else {
        addTransaction(transactionData);
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
    if (!transaction) return;
    
    setIsDeleting(true);
    
    // Delete receipt if it exists
    if (transaction.receiptUrl) {
      deleteReceiptImage(transaction.receiptUrl);
    }
    
    deleteTransaction(transaction.id);
    onClose();
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {transaction ? 'Edit Transaction' : 'Add Transaction'}
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
          {/* Transaction Type */}
          <div className="flex space-x-4">
            <button
              type="button"
              className={`flex-1 py-3 rounded-md border ${
                formState.type === 'expense'
                  ? 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onClick={() => handleTypeChange('expense')}
            >
              Expense
            </button>
            <button
              type="button"
              className={`flex-1 py-3 rounded-md border ${
                formState.type === 'income'
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-200'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onClick={() => handleTypeChange('income')}
            >
              Income
            </button>
          </div>
          
          {/* Description */}
          <Input
            label="Description"
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            placeholder="e.g., Groceries, Salary, etc."
            required
            fullWidth
          />
          
          {/* Amount */}
          <Input
            label="Amount"
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
          
          {/* Date */}
          <Input
            label="Date"
            name="date"
            type="date"
            value={formState.date}
            onChange={handleInputChange}
            required
            fullWidth
          />
          
          {/* Category */}
          <Select
            label="Category"
            value={formState.categoryId}
            onChange={handleCategoryChange}
            options={[
              { value: '', label: 'Select a category' },
              ...filteredCategories.map(category => ({
                value: category.id,
                label: category.name,
              })),
            ]}
            required
            fullWidth
          />
          
          {/* Recurring Transaction */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={formState.isRecurring}
              onChange={(e) => setFormState(prev => ({ ...prev, isRecurring: e.target.checked }))}
              className="h-4 w-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              This is a recurring transaction
            </label>
          </div>
          
          {/* Recurring Frequency (shown only when isRecurring is true) */}
          {formState.isRecurring && (
            <div className="pl-6 border-l-2 border-emerald-200 dark:border-emerald-800">
              <Select
                label="Frequency"
                value={formState.recurringFrequency}
                onChange={handleRecurringFrequencyChange}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly' },
                ]}
                fullWidth
                icon={<Repeat size={16} />}
              />
            </div>
          )}
          
          {/* Receipt Upload (for expenses only) */}
          {formState.type === 'expense' && (
            <FileUpload
              label="Receipt (optional)"
              onChange={handleReceiptChange}
              accept="image/jpeg,image/png,application/pdf"
              maxSize={5} // 5MB max
              value={formState.receiptFile}
            />
          )}
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formState.notes}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Add any additional details here..."
            ></textarea>
          </div>
          
          {error && (
            <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 pt-4">
            {transaction ? (
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
                {isSubmitting ? 'Saving...' : transaction ? 'Save Changes' : 'Add Transaction'}
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
                      Delete Transaction
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this transaction? This action cannot be undone.
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