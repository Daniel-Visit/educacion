import React from 'react';

interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function SecondaryButton({
  children,
  className = '',
  disabled,
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      className={`px-8 py-2 rounded-xl font-semibold text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
