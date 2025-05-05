import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useData } from '../../context/DataContext';
import { Subscription } from '../../types';
import { 
  ArrowLeft, 
  X, 
  Save,
  DollarSign,
  Calendar,
} from 'lucide-react';

interface SubscriptionFormProps {
  subscription?: Subscription | null;
  onClose: () => void;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  subscription,
  onClose,
}) => {
  const { state, addSubscription, updateSubscription, deleteSubscription } = useData();
  const { categories } = state;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    const today = new Date();
    return today.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD
  };
  
  // Form state
  const [formState, setFormState] = useState<{
    name: string;
    amount: string;
    startDate: string;
    renewalDate: string;
    billingCycle: 'monthly' | 'quarterly' | 'yearly';
    categoryId: string;
    description?: string;
    color?: string;
    isActive: boolean;
  }>({
    name: '',
    amount: '',
    startDate: getTodayString(),
    renewalDate: getTodayString(),
    billingCycle: 'monthly',
    categoryId: '',
    description: '',
    color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
    isActive: true,
  });
  
  // Initialize form with subscription data if editing
  useEffect(() => {
    if (subscription) {
      setFormState({
        name: subscription.name,
        amount: subscription.amount.toString(),
        startDate: subscription.startDate,
        renewalDate: subscription.renewalDate,
        billingCycle: subscription.billingCycle,
        categoryId: subscription.categoryId,
        description: subscription.description || '',
        color: subscription.color || '#818cf8',
        isActive: subscription.isActive,
      });
    }
  }, [subscription]);
  
  // Filter for expense categories only
  const filteredCategories = categories.filter(
    category => category.type === 'expense'
  );
  
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
  
  const handleCategoryChange = (value: string) => {
    setFormState(prev => ({ ...prev, categoryId: value }));
  };
  
  const handleBillingCycleChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      billingCycle: value as 'monthly' | 'quarterly' | 'yearly',
    }));
  };
  
  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };
  
  const calculateNextRenewalDate = (startDate: string, billingCycle: string): string => {
    // Validate the input date
    if (!isValidDate(startDate)) {
      return getTodayString();
    }
    
    const date = new Date(startDate);
    const today = new Date();
    
    let monthsToAdd = 1;
    if (billingCycle === 'quarterly') monthsToAdd = 3;
    if (billingCycle === 'yearly') monthsToAdd = 12;
    
    // Keep adding the billing period until we get a future date
    while (date < today) {
      date.setMonth(date.getMonth() + monthsToAdd);
    }
    
    // Format the date as YYYY-MM-DD
    return date.toLocaleDateString('en-CA');
  };
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;
    setFormState(prev => {
      const renewalDate = calculateNextRenewalDate(startDate, prev.billingCycle);
      return { ...prev, startDate, renewalDate };
    });
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
      
      if (!formState.startDate || !isValidDate(formState.startDate)) {
        throw new Error('Please enter a valid start date');
      }
      
      if (!formState.renewalDate || !isValidDate(formState.renewalDate)) {
        throw new Error('Please enter a valid renewal date');
      }
      
      if (!formState.categoryId) {
        throw new Error('Please select a category');
      }
      
      // Create or update subscription
      const subscriptionData: Subscription = {
        id: subscription?.id || crypto.randomUUID(),
        name: formState.name.trim(),
        amount: parseFloat(formState.amount),
        startDate: formState.startDate,
        renewalDate: formState.renewalDate,
        billingCycle: formState.billingCycle,
        categoryId: formState.categoryId,
        description: formState.description?.trim(),
        color: formState.color,
        isActive: formState.isActive,
      };
      
      if (subscription) {
        updateSubscription(subscriptionData);
      } else {
        addSubscription(subscriptionData);
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
    if (!subscription) return;
    
    setIsDeleting(true);
    deleteSubscription(subscription.id);
    onClose();
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {subscription ? 'Edit Subscription' : 'Add Subscription'}
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
            label="Subscription Name"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
            placeholder="e.g., Netflix, Spotify, etc."
            required
            fullWidth
          />
          
          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formState.isActive}
              onChange={(e) => setFormState(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              This subscription is active
            </label>
          </div>
          
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
          
          {/* Billing Cycle */}
          <Select
            label="Billing Cycle"
            value={formState.billingCycle}
            onChange={handleBillingCycleChange}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
            required
            fullWidth
          />
          
          {/* Start Date */}
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formState.startDate}
            onChange={handleStartDateChange}
            required
            fullWidth
          />
          
          {/* Next Renewal Date */}
          <Input
            label="Next Renewal Date"
            name="renewalDate"
            type="date"
            value={formState.renewalDate}
            onChange={handleInputChange}
            required
            fullWidth
            icon={<Calendar size={16} />}
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
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              name="description"
              value={formState.description}
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
            {subscription ? (
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
                {isSubmitting ? 'Saving...' : subscription ? 'Save Changes' : 'Add Subscription'}
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
                      Delete Subscription
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this subscription? This action cannot be undone.
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