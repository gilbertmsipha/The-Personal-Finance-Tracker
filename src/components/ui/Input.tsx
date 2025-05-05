import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  icon,
  ...props
}) => {
  const id = props.id || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">{icon}</span>
          </div>
        )}
        <input
          id={id}
          className={`
            block rounded-md w-full 
            ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 
            border ${error ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} 
            ${error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-emerald-500 focus:border-emerald-500'} 
            ${error ? 'text-red-900 placeholder-red-300' : 'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500'} 
            dark:bg-gray-700
            sm:text-sm
          `}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};