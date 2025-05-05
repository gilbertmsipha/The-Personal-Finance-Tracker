import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Filter, Search, ArrowDownUp, Download, Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate, generateTransactionsCSV, downloadFile } from '../../utils/helpers';
import { TransactionForm } from './TransactionForm';
import { Transaction } from '../../types';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export const Transactions: React.FC = () => {
  const { state } = useData();
  const { transactions, categories } = state;
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  const handleAddTransaction = () => {
    setCurrentTransaction(null);
    setIsFormOpen(true);
  };
  
  const handleEditTransaction = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentTransaction(null);
  };
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  const exportTransactions = () => {
    const csvData = generateTransactionsCSV(filteredTransactions, categories);
    downloadFile(csvData, 'transactions.csv', 'text/csv');
  };
  
  // Filter and sort transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Search term filter
    if (
      searchTerm &&
      !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    // Type filter
    if (typeFilter !== 'all' && transaction.type !== typeFilter) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== 'all' && transaction.categoryId !== categoryFilter) {
      return false;
    }
    
    // Date range filter
    if (startDate && new Date(transaction.date) < new Date(startDate)) {
      return false;
    }
    
    if (endDate && new Date(transaction.date) > new Date(endDate)) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });
  
  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <TransactionForm 
          onClose={handleCloseForm} 
          transaction={currentTransaction} 
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Transactions
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="primary" 
                onClick={handleAddTransaction}
                icon={<Plus size={16} />}
              >
                Add Transaction
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                icon={<Filter size={16} />}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={exportTransactions}
                icon={<Download size={16} />}
              >
                Export
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    icon={<Search size={16} />}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={[
                      { value: 'all', label: 'All Types' },
                      { value: 'income', label: 'Income' },
                      { value: 'expense', label: 'Expense' },
                    ]}
                    fullWidth
                  />
                  
                  <Select
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={[
                      { value: 'all', label: 'All Categories' },
                      ...categories.map(category => ({
                        value: category.id,
                        label: category.name,
                      })),
                    ]}
                    fullWidth
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      fullWidth
                      label="From"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      fullWidth
                      label="To"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          <Card>
            {filteredTransactions.length > 0 ? (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleSortDirection}
                    icon={<ArrowDownUp size={14} />}
                  >
                    {sortDirection === 'desc' ? 'Newest first' : 'Oldest first'}
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Type
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredTransactions.map((transaction) => {
                        const category = categories.find(c => c.id === transaction.categoryId);
                        
                        return (
                          <tr 
                            key={transaction.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {transaction.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <div 
                                  className="w-2 h-2 rounded-full mr-2" 
                                  style={{ backgroundColor: category?.color }}
                                ></div>
                                {category?.name || 'Uncategorized'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                              <span
                                className={
                                  transaction.type === 'income'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                                }
                              >
                                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  transaction.type === 'income'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}
                              >
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTransaction(transaction);
                                }}
                              >
                                Edit
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No transactions found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                  {transactions.length === 0
                    ? "You haven't recorded any transactions yet."
                    : "No transactions match your current filters."}
                </p>
                {transactions.length === 0 && (
                  <Button 
                    variant="primary" 
                    onClick={handleAddTransaction}
                    icon={<Plus size={16} />}
                  >
                    Add your first transaction
                  </Button>
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};