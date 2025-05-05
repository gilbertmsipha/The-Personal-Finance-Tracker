import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Transaction, Subscription, Budget, Category } from '../types';
import { 
  loadTransactions, 
  saveTransactions, 
  loadSubscriptions, 
  saveSubscriptions,
  loadBudgets,
  saveBudgets,
  loadCategories,
  saveCategories
} from '../utils/storage';

interface AppState {
  transactions: Transaction[];
  subscriptions: Subscription[];
  budgets: Budget[];
  categories: Category[];
  isLoading: boolean;
}

type Action = 
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_SUBSCRIPTIONS'; payload: Subscription[] }
  | { type: 'ADD_SUBSCRIPTION'; payload: Subscription }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: Subscription }
  | { type: 'DELETE_SUBSCRIPTION'; payload: string }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

interface DataContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void;
  updateSubscription: (subscription: Subscription) => void;
  deleteSubscription: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
}

const initialState: AppState = {
  transactions: [],
  subscriptions: [],
  budgets: [],
  categories: [],
  isLoading: true,
};

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    case 'SET_SUBSCRIPTIONS':
      return { ...state, subscriptions: action.payload };
    case 'ADD_SUBSCRIPTION':
      return { ...state, subscriptions: [...state.subscriptions, action.payload] };
    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map(s =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'DELETE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.filter(s => s.id !== action.payload),
      };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'ADD_BUDGET':
      // Ensure new fields are initialized if not provided
      const newBudget = { 
        ...action.payload, 
        allocatedAmount: action.payload.allocatedAmount ?? 0, 
        spentAmount: action.payload.spentAmount ?? 0 
      };
      return { ...state, budgets: [...state.budgets, newBudget] };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(b =>
          b.id === action.payload.id 
            ? { 
                ...action.payload, 
                allocatedAmount: action.payload.allocatedAmount ?? b.allocatedAmount ?? 0, 
                spentAmount: action.payload.spentAmount ?? b.spentAmount ?? 0 
              } 
            : b
        ),
      };
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(b => b.id !== action.payload),
      };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const transactions = await loadTransactions();
        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
        
        const subscriptions = await loadSubscriptions();
        dispatch({ type: 'SET_SUBSCRIPTIONS', payload: subscriptions });
        
        const budgets = await loadBudgets();
        dispatch({ type: 'SET_BUDGETS', payload: budgets });
        
        const categories = await loadCategories();
        dispatch({ type: 'SET_CATEGORIES', payload: categories });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    saveTransactions(state.transactions);
  }, [state.transactions]);

  useEffect(() => {
    saveSubscriptions(state.subscriptions);
  }, [state.subscriptions]);

  useEffect(() => {
    saveBudgets(state.budgets);
  }, [state.budgets]);

  useEffect(() => {
    saveCategories(state.categories);
  }, [state.categories]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
  };

  const updateTransaction = (transaction: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const addSubscription = (subscription: Omit<Subscription, 'id'>) => {
    const newSubscription: Subscription = {
      ...subscription,
      id: crypto.randomUUID(),
    };
    dispatch({ type: 'ADD_SUBSCRIPTION', payload: newSubscription });
  };

  const updateSubscription = (subscription: Subscription) => {
    dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: subscription });
  };

  const deleteSubscription = (id: string) => {
    dispatch({ type: 'DELETE_SUBSCRIPTION', payload: id });
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      allocatedAmount: budget.allocatedAmount ?? 0, // Initialize new fields
      spentAmount: budget.spentAmount ?? 0, // Initialize new fields
    };
    dispatch({ type: 'ADD_BUDGET', payload: newBudget });
  };

  const updateBudget = (budget: Budget) => {
    dispatch({ type: 'UPDATE_BUDGET', payload: budget });
  };

  const deleteBudget = (id: string) => {
    dispatch({ type: 'DELETE_BUDGET', payload: id });
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
  };

  const updateCategory = (category: Category) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });
  };

  const deleteCategory = (id: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  };

  return (
    <DataContext.Provider
      value={{
        state,
        dispatch,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        addBudget,
        updateBudget,
        deleteBudget,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};