import React from 'react';

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'large';
}

export default function PrimaryButton({
  children,
  className = '',
  disabled,
  variant = 'default',
  ...props
}: PrimaryButtonProps) {
  const roundedClass =
    variant === 'subtle'
      ? 'rounded-md'
      : variant === 'large'
        ? 'rounded-lg'
        : 'rounded-xl';

  return (
    <button
      className={`px-12 py-2 ${roundedClass} font-bold text-lg transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-500 text-white hover:from-indigo-700 hover:to-purple-600 shadow-lg hover:shadow-xl ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
