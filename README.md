# Personal Finance Tracker

This application helps users track their personal finances, including income, expenses, budgets, and subscriptions.

## Features

- **Dashboard:** Provides an overview of financial health, including account balances, recent transactions, budget summaries, and upcoming subscription renewals. (Located in `src/features/dashboard`)
- **Transactions:** Allows users to add, edit, delete, and view income and expense transactions. Includes filtering and sorting capabilities. (Located in `src/features/transactions`)
- **Budgets:** Enables users to create, manage, and track spending against budgets for different categories or overall spending. (Located in `src/features/budgets`)
- **Subscriptions:** Helps manage recurring subscriptions, track costs, and view upcoming renewal dates. (Located in `src/features/subscriptions`)
- **Reports:** (Future Feature) Intended to provide detailed financial reports and visualizations. (Located in `src/features/reports`)
- **Settings:** Allows users to manage categories, accounts (future), and application preferences like theme. (Located in `src/features/settings`)

## Project Structure

```
src/
├── App.tsx             # Main application component, routing
├── components/         # Reusable UI components
│   ├── layout/         # Layout components (Sidebar, Header)
│   └── ui/             # Basic UI elements (Button, Card, Input, etc.)
├── context/            # React Context for global state management
│   ├── DataContext.tsx   # Manages financial data (transactions, budgets, etc.)
│   └── ThemeContext.tsx  # Manages application theme (light/dark)
├── features/           # Feature-specific modules
│   ├── budgets/        # Budget management components and logic
│   ├── dashboard/      # Dashboard components and logic
│   ├── reports/        # Reporting components and logic (Placeholder)
│   ├── settings/       # Settings components and logic
│   ├── subscriptions/  # Subscription management components and logic
│   └── transactions/   # Transaction management components and logic
├── index.css           # Global CSS styles
├── main.tsx            # Application entry point
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── defaults.ts     # Default data/configurations
│   ├── helpers.ts      # Helper functions (formatting, calculations)
│   └── storage.ts      # Local storage interaction
└── vite-env.d.ts       # Vite environment types
```

## Getting Started

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Run the development server: `npm run dev`

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.