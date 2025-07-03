import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function PrimaryButton({ children, className = '', disabled, ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`px-12 py-2 rounded-xl font-bold text-lg transition-all duration-200 bg-gradient-to-r from-indigo-500 to-purple-400 text-white hover:from-indigo-600 hover:to-purple-500 shadow-lg hover:shadow-xl ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
} 