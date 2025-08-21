'use client';

import { useEffect, useState } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  onDismiss: (id: string) => void;
}

const toastVariants = {
  default: 'bg-white border-gray-200 text-gray-900',
  destructive: 'bg-red-50 border-red-200 text-red-900',
};

const toastIcons = {
  default: Info,
  destructive: AlertCircle,
};

export function Toast({
  id,
  title,
  description,
  variant = 'default',
  onDismiss,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = toastIcons[variant];

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 150);
  };

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-96 max-w-sm transform transition-all duration-200 ease-in-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div
        className={cn(
          'rounded-lg border p-4 shadow-lg',
          toastVariants[variant]
        )}
      >
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{title}</h4>
            {description && (
              <p className="text-sm mt-1 opacity-90">{description}</p>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }>;
  onDismiss: (id: string) => void;
}) {
  return (
    <>
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </>
  );
}
