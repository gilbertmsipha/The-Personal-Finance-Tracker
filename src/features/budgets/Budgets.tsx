import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Search, Filter, PieChart } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency, calculateBudgetProgress } from '../../utils/helpers';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Budget } from '../../types';
import { BudgetForm } from './BudgetForm';

export const Budgets: React.FC = () => {
  const { state } = useData();
  const { budgets, categories, transactions } = state;
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const handleAddBudget = () => {
    setCurrentBudget(null);
    setIsFormOpen(true);
  };
  
  const handleEditBudget = (budget: Budget) => {
    setCurrentBudget(budget);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentBudget(null);
  };
  
  // Filter budgets
  const filteredBudgets = budgets.filter(budget => {
    // Search term filter
    if (
      searchTerm &&
      !budget.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    // Period filter
    if (periodFilter !== 'all' && budget.period !== periodFilter) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      if (!budget.categoryId && categoryFilter === 'none') {
        return true;
      }
      if (budget.categoryId !== categoryFilter) {
        return false;
      }
    }
    
    return true;
  });
  
  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <BudgetForm 
          onClose={handleCloseForm} 
          budget={currentBudget} 
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Budgets
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="primary" 
                onClick={handleAddBudget}
                icon={<Plus size={16} />}
              >
                Add Budget
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
          
          {showFilters && (
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Search budgets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  icon={<Search size={16} />}
                />
                
                <Select
                  value={periodFilter}
                  onChange={setPeriodFilter}
                  options={[
                    { value: 'all', label: 'All Periods' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'yearly', label: 'Yearly' },
                  ]}
                  fullWidth
                />
                
                <Select
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    { value: 'all', label: 'All Categories' },
                    { value: 'none', label: 'No Category (Overall)' },
                    ...categories
                      .filter(c => c.type === 'expense')
                      .map(category => ({
                        value: category.id,
                        label: category.name,
                      })),
                  ]}
                  fullWidth
                />
              </div>
            </Card>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBudgets.length > 0 ? (
              filteredBudgets.map(budget => {
                const category = budget.categoryId 
                  ? categories.find(c => c.id === budget.categoryId) 
                  : null;
                
                const { spent, percentage, remaining } = calculateBudgetProgress(budget, transactions);
                
                const isOverBudget = percentage >= 100;
                
                return (
                  <Card 
                    key={budget.id}
                    className="transition-all duration-200 hover:shadow-md cursor-pointer"
                    onClick={() => handleEditBudget(budget)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center">
                          {budget.name}
                          <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full capitalize">
                            {budget.period}
                          </span>
                        </h3>
                        {category && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {category.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: budget.color || category?.color || '#818cf8' }}
                        >
                          <PieChart className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300">
                          {formatCurrency(spent)} of {formatCurrency(budget.amount)}
                        </span>
                        <span className={`font-medium ${
                          isOverBudget 
                            ? 'text-red-600 dark:text-red-400' 
                            : percentage > 85 
                              ? 'text-amber-600 dark:text-amber-400' 
                              : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full ${
                            isOverBudget 
                              ? 'bg-red-500' 
                              : percentage > 85 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Remaining
                        </p>
                        <p className={`font-medium ${
                          isOverBudget 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {isOverBudget ? '-' : ''}{formatCurrency(remaining)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                          Budget
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white text-right">
                          {formatCurrency(budget.amount)}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full">
                <Card>
                  <div className="py-12 text-center">
                    <PieChart className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      No budgets found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                      {budgets.length === 0
                        ? "You haven't set up any budgets yet."
                        : "No budgets match your current filters."}
                    </p>
                    {budgets.length === 0 && (
                      <Button 
                        variant="primary" 
                        onClick={handleAddBudget}
                        icon={<Plus size={16} />}
                      >
                        Create your first budget
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