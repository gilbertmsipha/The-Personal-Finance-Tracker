import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Search, Filter, CalendarDays } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate, isSubscriptionRenewalSoon } from '../../utils/helpers';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Subscription } from '../../types';
import { SubscriptionForm } from './SubscriptionForm';

export const Subscriptions: React.FC = () => {
  const { state } = useData();
  const { subscriptions, categories } = state;
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cycleFilter, setCycleFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const handleAddSubscription = () => {
    setCurrentSubscription(null);
    setIsFormOpen(true);
  };
  
  const handleEditSubscription = (subscription: Subscription) => {
    setCurrentSubscription(subscription);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentSubscription(null);
  };
  
  // Calculate total monthly cost of subscriptions
  const totalMonthlyCost = subscriptions
    .filter(s => s.isActive)
    .reduce((total, s) => {
      let monthlyAmount = s.amount;
      if (s.billingCycle === 'quarterly') {
        monthlyAmount = s.amount / 3;
      } else if (s.billingCycle === 'yearly') {
        monthlyAmount = s.amount / 12;
      }
      return total + monthlyAmount;
    }, 0);
  
  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(subscription => {
    // Search term filter
    if (
      searchTerm &&
      !subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(subscription.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }
    
    // Billing cycle filter
    if (cycleFilter !== 'all' && subscription.billingCycle !== cycleFilter) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== 'all' && subscription.categoryId !== categoryFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter === 'active' && !subscription.isActive) {
      return false;
    }
    if (statusFilter === 'inactive' && subscription.isActive) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <SubscriptionForm 
          onClose={handleCloseForm} 
          subscription={currentSubscription} 
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Subscriptions
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="primary" 
                onClick={handleAddSubscription}
                icon={<Plus size={16} />}
              >
                Add Subscription
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                icon={<Filter size={16} />}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </div>
          
          {/* Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                  <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Total Monthly Subscriptions</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalMonthlyCost)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subscriptions.filter(s => s.isActive).length} active subscriptions
                  </p>
                </div>
              </div>
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold mb-2">Upcoming Renewals</h3>
              {subscriptions.filter(s => isSubscriptionRenewalSoon(s) && s.isActive).length > 0 ? (
                <div className="space-y-2">
                  {subscriptions
                    .filter(s => isSubscriptionRenewalSoon(s) && s.isActive)
                    .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())
                    .slice(0, 3)
                    .map(subscription => (
                      <div 
                        key={subscription.id} 
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                            style={{ backgroundColor: subscription.color || '#818cf8' }}
                          >
                            <span className="text-white font-semibold text-xs">
                              {subscription.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {subscription.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Renews on {formatDate(subscription.renewalDate)}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(subscription.amount)}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No renewals due in the next 7 days
                </p>
              )}
            </Card>
          </div>
          
          {showFilters && (
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  icon={<Search size={16} />}
                />
                
                <Select
                  value={cycleFilter}
                  onChange={setCycleFilter}
                  options={[
                    { value: 'all', label: 'All Billing Cycles' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'yearly', label: 'Yearly' },
                  ]}
                  fullWidth
                />
                
                <div className="flex gap-2">
                  <Select
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={[
                      { value: 'all', label: 'All Categories' },
                      ...categories
                        .filter(c => c.type === 'expense')
                        .map(category => ({
                          value: category.id,
                          label: category.name,
                        })),
                    ]}
                    fullWidth
                  />
                  
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                    ]}
                    fullWidth
                  />
                </div>
              </div>
            </Card>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map(subscription => {
                const category = categories.find(c => c.id === subscription.categoryId);
                const isRenewingSoon = isSubscriptionRenewalSoon(subscription);
                
                return (
                  <Card 
                    key={subscription.id}
                    className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                      !subscription.isActive ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleEditSubscription(subscription)}
                  >
                    <div className="flex items-center mb-4">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${
                          !subscription.isActive ? 'opacity-50' : ''
                        }`}
                        style={{ backgroundColor: subscription.color || '#818cf8' }}
                      >
                        <span className="text-white font-bold text-lg">
                          {subscription.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center">
                          {subscription.name}
                          {!subscription.isActive && (
                            <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full">
                              Inactive
                            </span>
                          )}
                        </h3>
                        {category && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {category.name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(subscription.amount)}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            / {subscription.billingCycle}
                          </span>
                        </p>
                      </div>
                      
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Next Renewal</p>
                        <p className={`font-medium ${
                          isRenewingSoon && subscription.isActive
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {formatDate(subscription.renewalDate)}
                          {isRenewingSoon && subscription.isActive && (
                            <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 py-0.5 px-2 rounded-full">
                              Soon
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {subscription.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-3">
                        {subscription.description}
                      </p>
                    )}
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full">
                <Card>
                  <div className="py-6 text-center">
                    <CalendarDays className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      No subscriptions found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                      {subscriptions.length === 0
                        ? "You haven't added any subscriptions yet."
                        : "No subscriptions match your current filters."}
                    </p>
                    {subscriptions.length === 0 && (
                      <Button 
                        variant="primary" 
                        onClick={handleAddSubscription}
                        icon={<Plus size={16} />}
                      >
                        Add your first subscription
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};