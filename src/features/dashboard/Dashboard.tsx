import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useData } from '../../context/DataContext';
import { Wallet, TrendingUp, TrendingDown, Bell, Calendar } from 'lucide-react';
import { 
  formatCurrency, 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateBalance,
  getDatesForCurrentMonth,
  isSubscriptionRenewalSoon
} from '../../utils/helpers';

export const Dashboard: React.FC = () => {
  const { state } = useData();
  const { transactions, subscriptions, categories } = state;
  
  const [dateRange] = useState({
    startDate: getDatesForCurrentMonth().start,
    endDate: getDatesForCurrentMonth().end,
  });
  
  const totalIncome = calculateTotalIncome(transactions, dateRange);
  const totalExpense = calculateTotalExpenses(transactions, subscriptions, dateRange);
  const balance = calculateBalance(transactions, subscriptions, dateRange);
  
  const upcomingRenewals = subscriptions
    .filter(sub => isSubscriptionRenewalSoon(sub) && sub.isActive)
    .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white/20 p-3 mr-4">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Total Balance</h3>
              <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white/20 p-3 mr-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Total Income</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center">
            <div className="rounded-full bg-white/20 p-3 mr-4">
              <TrendingDown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Total Expenses</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Upcoming Renewals */}
      <Card title="Upcoming Subscription Renewals">
        {upcomingRenewals.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingRenewals.slice(0, 3).map((subscription) => (
              <div key={subscription.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: subscription.color || '#818cf8' }}
                  >
                    <span className="text-white font-semibold">
                      {subscription.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{subscription.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Renews on {new Date(subscription.renewalDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(subscription.amount)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {subscription.billingCycle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No Upcoming Renewals
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              You don't have any subscription renewals coming up in the next 7 days.
            </p>
          </div>
        )}
      </Card>
      
      {/* Recent Activity */}
      <Card title="Recent Activity">
        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                
                return (
                  <div key={transaction.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                        style={{ backgroundColor: category?.color || '#818cf8' }}
                      >
                        <span className="text-white font-semibold">
                          {category?.name.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`text-right ${
                      transaction.type === 'income' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      <p className="font-semibold">
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="py-6 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No Recent Activity
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              You haven't recorded any transactions yet. Start by adding your income and expenses.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};