import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Repeat, 
  PieChart, 
  BarChart3, 
  Settings, 
  CreditCard,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navigation = [
    { name: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: 'transactions', icon: Receipt },
    { name: 'Subscriptions', href: 'subscriptions', icon: Repeat },
    { name: 'Budgets', href: 'budgets', icon: PieChart },
    { name: 'Reports', href: 'reports', icon: BarChart3 },
    { name: 'Settings', href: 'settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <button
          type="button"
          className="p-2 rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow-md"
          onClick={toggleSidebar}
        >
          <span className="sr-only">Open menu</span>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <CreditCard className="h-8 w-8 text-emerald-500" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">FinTrack</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setCurrentPage(item.href);
                    setIsOpen(false);
                  }}
                  className={`${
                    currentPage === item.href
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-200'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } group flex items-center px-4 py-3 text-base font-medium rounded-md w-full transition-colors duration-150`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      currentPage === item.href
                        ? 'text-emerald-500 dark:text-emerald-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-14" onClick={toggleSidebar}></div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <CreditCard className="h-8 w-8 text-emerald-500" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">FinTrack</span>
              </div>
              <nav className="mt-8 flex-1 px-4 space-y-2">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setCurrentPage(item.href)}
                    className={`${
                      currentPage === item.href
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-200'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } group flex items-center px-4 py-3 text-sm font-medium rounded-md w-full transition-colors duration-150`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        currentPage === item.href
                          ? 'text-emerald-500 dark:text-emerald-300'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    />
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <div className="bg-emerald-200 dark:bg-emerald-700 h-9 w-9 rounded-full flex items-center justify-center">
                  <span className="text-emerald-700 dark:text-emerald-200 font-medium">UD</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">User Demo</p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Personal Account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};