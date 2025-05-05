import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './features/dashboard/Dashboard';
import { Transactions } from './features/transactions/Transactions';
import { Subscriptions } from './features/subscriptions/Subscriptions';
import { Budgets } from './features/budgets/Budgets';
import { Reports } from './features/reports/Reports';
import { Settings } from './features/settings/Settings';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'subscriptions':
        return <Subscriptions />;
      case 'budgets':
        return <Budgets />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <DataProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header currentPage={currentPage} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {renderPage()}
            </main>
          </div>
        </div>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;