import { Transaction, Subscription, Budget, Category, Notification } from '../types';
import { getDefaultCategories } from './defaults';

// Initialize IndexedDB
const initDB = async () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('financeApp', 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores with indexes
      if (!db.objectStoreNames.contains('transactions')) {
        const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
        transactionStore.createIndex('date', 'date', { unique: false });
        transactionStore.createIndex('type', 'type', { unique: false });
        transactionStore.createIndex('categoryId', 'categoryId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('subscriptions')) {
        const subscriptionStore = db.createObjectStore('subscriptions', { keyPath: 'id' });
        subscriptionStore.createIndex('renewalDate', 'renewalDate', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('budgets')) {
        const budgetStore = db.createObjectStore('budgets', { keyPath: 'id' });
        budgetStore.createIndex('period', 'period', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('categories')) {
        const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
        categoryStore.createIndex('type', 'type', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('notifications')) {
        const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
        notificationStore.createIndex('date', 'date', { unique: false });
        notificationStore.createIndex('isRead', 'isRead', { unique: false });
      }
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onerror = (event) => {
      reject(`Database error: ${(event.target as IDBOpenDBRequest).error}`);
    };
  });
};

// Generic function to get all items from a store
const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await initDB();
    return new Promise<T[]>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(`Error fetching data from ${storeName}`);
      };
    });
  } catch (error) {
    console.error(`Failed to get items from ${storeName}:`, error);
    return [];
  }
};

// Generic function to save all items to a store
const saveAllItems = async <T>(storeName: string, items: T[]): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Clear existing items
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(`Error clearing ${storeName}`);
    });
    
    // Add all items
    items.forEach(item => {
      store.add(item);
    });
    
    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(`Error saving data to ${storeName}`);
    });
  } catch (error) {
    console.error(`Failed to save items to ${storeName}:`, error);
  }
};

// Specific functions for each data type
export const loadTransactions = async (): Promise<Transaction[]> => {
  return getAllItems<Transaction>('transactions');
};

export const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
  await saveAllItems<Transaction>('transactions', transactions);
};

export const loadSubscriptions = async (): Promise<Subscription[]> => {
  return getAllItems<Subscription>('subscriptions');
};

export const saveSubscriptions = async (subscriptions: Subscription[]): Promise<void> => {
  await saveAllItems<Subscription>('subscriptions', subscriptions);
};

export const loadBudgets = async (): Promise<Budget[]> => {
  return getAllItems<Budget>('budgets');
};

export const saveBudgets = async (budgets: Budget[]): Promise<void> => {
  await saveAllItems<Budget>('budgets', budgets);
};

export const loadCategories = async (): Promise<Category[]> => {
  const categories = await getAllItems<Category>('categories');
  
  // Initialize with default categories if empty
  if (categories.length === 0) {
    const defaultCategories = getDefaultCategories();
    await saveCategories(defaultCategories);
    return defaultCategories;
  }
  
  return categories;
};

export const saveCategories = async (categories: Category[]): Promise<void> => {
  await saveAllItems<Category>('categories', categories);
};

export const loadNotifications = async (): Promise<Notification[]> => {
  return getAllItems<Notification>('notifications');
};

export const saveNotifications = async (notifications: Notification[]): Promise<void> => {
  await saveAllItems<Notification>('notifications', notifications);
};

// Function for storing receipt images
export const storeReceiptImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      
      // In a production app, we'd upload to a server
      // For this MVP, we'll store in localStorage with a size check
      if (dataUrl.length > 5000000) { // ~5MB limit
        reject('File too large. Please choose a smaller image.');
        return;
      }
      
      const timestamp = new Date().getTime();
      const key = `receipt_${timestamp}_${file.name}`;
      
      try {
        localStorage.setItem(key, dataUrl);
        resolve(key);
      } catch (e) {
        reject('Storage is full. Try clearing some data or using smaller images.');
      }
    };
    
    reader.onerror = () => {
      reject('Error reading file');
    };
    
    reader.readAsDataURL(file);
  });
};

export const getReceiptImage = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const deleteReceiptImage = (key: string): void => {
  localStorage.removeItem(key);
};