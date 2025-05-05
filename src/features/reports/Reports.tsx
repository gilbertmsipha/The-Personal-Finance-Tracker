import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useData } from '../../context/DataContext';
import { 
  BarChart3, 
  Download, 
  FileText,
  TrendingUp,
} from 'lucide-react';
import { 
  formatCurrency, 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateBalance,
  generateTransactionsCSV,
  downloadFile,
} from '../../utils/helpers';

export const Reports: React.FC = () => {
  const { state } = useData();
  const { transactions, subscriptions, categories } = state;
  
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  
  const [periodType, setPeriodType] = useState<'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter' | 'thisYear' | 'lastYear' | 'custom'>('thisYear');
  
  // Update date range when period type changes
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    let start = new Date();
    let end = new Date();
    
    switch (periodType) {
      case 'thisMonth':
        start = new Date(currentYear, currentMonth, 1);
        end = new Date(currentYear, currentMonth + 1, 0);
        break;
      case 'lastMonth':
        start = new Date(currentYear, currentMonth - 1, 1);
        end = new Date(currentYear, currentMonth, 0);
        break;
      case 'thisQuarter':
        const currentQuarter = Math.floor(currentMonth / 3);
        start = new Date(currentYear, currentQuarter * 3, 1);
        end = new Date(currentYear, (currentQuarter + 1) * 3, 0);
        break;
      case 'lastQuarter':
        const lastQuarter = Math.floor(currentMonth / 3) - 1;
        const lastQuarterYear = lastQuarter < 0 ? currentYear - 1 : currentYear;
        const actualLastQuarter = lastQuarter < 0 ? 3 : lastQuarter;
        start = new Date(lastQuarterYear, actualLastQuarter * 3, 1);
        end = new Date(lastQuarterYear, (actualLastQuarter + 1) * 3, 0);
        break;
      case 'thisYear':
        start = new Date(currentYear, 0, 1);
        end = new Date(currentYear, 11, 31);
        break;
      case 'lastYear':
        start = new Date(currentYear - 1, 0, 1);
        end = new Date(currentYear - 1, 11, 31);
        break;
      case 'custom':
        // Keep existing custom dates
        return;
    }
    
    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  }, [periodType]);
  
  // Handle custom date changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPeriodType('custom');
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  // Calculate summary data
  const totalIncome = calculateTotalIncome(transactions, dateRange);
  const totalExpense = calculateTotalExpenses(transactions, subscriptions, dateRange);
  const balance = calculateBalance(transactions, subscriptions, dateRange);
  
  // Export reports
  const exportToCSV = () => {
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    const csvData = generateTransactionsCSV(filteredTransactions, categories);
    
    const periodName = periodType === 'custom' 
      ? 'custom-period'
      : periodType;
    
    downloadFile(csvData, `transactions-${periodName}.csv`, 'text/csv');
  };
  
  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Period
            </label>
            <Select
              value={periodType}
              onChange={(value) => setPeriodType(value as any)}
              options={[
                { value: 'thisMonth', label: 'This Month' },
                { value: 'lastMonth', label: 'Last Month' },
                { value: 'thisQuarter', label: 'This Quarter' },
                { value: 'lastQuarter', label: 'Last Quarter' },
                { value: 'thisYear', label: 'This Year' },
                { value: 'lastYear', label: 'Last Year' },
                { value: 'custom', label: 'Custom Range' },
              ]}
              fullWidth
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={exportToCSV}
              fullWidth
              icon={<Download size={16} />}
            >
              Export to CSV
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Total Income</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 mr-4">
              <BarChart3 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Total Expenses</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900 p-3 mr-4">
              <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Balance</h3>
              <p className={`text-2xl font-bold ${
                balance >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Transactions Table */}
      <Card title="Transactions">
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
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions
                .filter(transaction => {
                  const transactionDate = new Date(transaction.date);
                  const startDate = new Date(dateRange.startDate);
                  const endDate = new Date(dateRange.endDate);
                  
                  return transactionDate >= startDate && transactionDate <= endDate;
                })
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transaction) => {
                  const category = categories.find(c => c.id === transaction.categoryId);
                  
                  return (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleDateString()}
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
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};