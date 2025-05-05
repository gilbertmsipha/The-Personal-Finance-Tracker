import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sun, 
  Moon, 
  Download,
  Upload,
  Trash2,
  Save,
  Tag,
  Plus
} from 'lucide-react';
import { formatCurrency, downloadFile } from '../../utils/helpers';
import { Category } from '../../types';

export const Settings: React.FC = () => {
  const { state, dispatch, addCategory, updateCategory, deleteCategory } = useData();
  const { theme, toggleTheme } = useTheme();
  
  const [newCategory, setNewCategory] = useState<{
    name: string;
    type: 'income' | 'expense';
    color: string;
  }>({
    name: '',
    type: 'expense',
    color: '#' + Math.floor(Math.random()*16777215).toString(16),
  });
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Export data
  const handleExportData = () => {
    const data = JSON.stringify({
      transactions: state.transactions,
      subscriptions: state.subscriptions,
      budgets: state.budgets,
      categories: state.categories,
    }, null, 2);
    
    downloadFile(data, 'finance-app-data.json', 'application/json');
  };
  
  // Import data
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.transactions) {
          dispatch({ type: 'SET_TRANSACTIONS', payload: data.transactions });
        }
        
        if (data.subscriptions) {
          dispatch({ type: 'SET_SUBSCRIPTIONS', payload: data.subscriptions });
        }
        
        if (data.budgets) {
          dispatch({ type: 'SET_BUDGETS', payload: data.budgets });
        }
        
        if (data.categories) {
          dispatch({ type: 'SET_CATEGORIES', payload: data.categories });
        }
        
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    
    reader.readAsText(file);
  };
  
  // Category management
  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      alert('Please enter a category name');
      return;
    }
    
    addCategory({
      name: newCategory.name.trim(),
      type: newCategory.type,
      color: newCategory.color,
    });
    
    setNewCategory({
      name: '',
      type: 'expense',
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
    });
  };
  
  const handleEditCategory = () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      return;
    }
    
    updateCategory(editingCategory);
    setEditingCategory(null);
  };
  
  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This may affect transactions, subscriptions, and budgets using this category.')) {
      deleteCategory(id);
    }
  };
  
  const startEditingCategory = (category: Category) => {
    setEditingCategory({ ...category });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Settings
      </h2>
      
      {/* Appearance */}
      <Card title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Theme
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose between light and dark mode
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={theme === 'light' ? 'primary' : 'outline'}
              onClick={() => theme === 'dark' && toggleTheme()}
              icon={<Sun size={16} />}
            >
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'primary' : 'outline'}
              onClick={() => theme === 'light' && toggleTheme()}
              icon={<Moon size={16} />}
            >
              Dark
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Data Management */}
      <Card title="Data Management">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Export Data
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Download your data as a JSON file for backup
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExportData}
              icon={<Download size={16} />}
            >
              Export
            </Button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Import Data
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Restore your data from a backup
              </p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportData}
              />
              <span className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800">
                <Upload size={16} className="mr-2" />
                Import
              </span>
            </label>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Clear All Data
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Delete all your data permanently
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
                  dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
                  dispatch({ type: 'SET_SUBSCRIPTIONS', payload: [] });
                  dispatch({ type: 'SET_BUDGETS', payload: [] });
                  // Keep default categories
                }
              }}
              icon={<Trash2 size={16} />}
            >
              Clear All
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Categories */}
      <Card title="Manage Categories">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="col-span-2">
              <input
                type="text"
                placeholder="New category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <select
                value={newCategory.type}
                onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
              className="h-10 w-10 border-0 rounded p-0 cursor-pointer"
            />
            <Button
              variant="primary"
              onClick={handleAddCategory}
              icon={<Plus size={16} />}
            >
              Add Category
            </Button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>
          
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Color
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {state.categories.map(category => (
                  <tr key={category.id}>
                    {editingCategory && editingCategory.id === category.id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-1 px-2 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={editingCategory.type}
                            onChange={(e) => setEditingCategory(prev => prev ? { ...prev, type: e.target.value as 'income' | 'expense' } : null)}
                            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm py-1 px-2 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="color"
                            value={editingCategory.color}
                            onChange={(e) => setEditingCategory(prev => prev ? { ...prev, color: e.target.value } : null)}
                            className="h-8 w-8 border-0 rounded p-0 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleEditCategory}
                            icon={<Save size={14} />}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCategory(null)}
                            className="ml-2"
                          >
                            Cancel
                          </Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <Tag size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                            {category.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {category.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="h-6 w-6 rounded-full"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              {category.color}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditingCategory(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="ml-2"
                          >
                            Delete
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
      
      {/* App Info */}
      <Card title="About FinTrack">
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Version 1.0.0
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            A personal finance management application to help you track income, expenses, 
            subscriptions, and budgets.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All data is stored locally on your device.
          </p>
        </div>
      </Card>
    </div>
  );
};