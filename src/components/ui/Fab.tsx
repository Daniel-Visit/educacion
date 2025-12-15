import React, { useEffect, useRef } from 'react';
import { FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type FabSize = 'sm' | 'md' | 'lg';

interface FabProps {
  onClick: () => void;
  open?: boolean;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
  size?: FabSize;
}

const sizeClasses: Record<FabSize, string> = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-16 h-16',
};

const iconSizes: Record<FabSize, number> = {
  sm: 24,
  md: 28,
  lg: 32,
};

export default function Fab({
  onClick,
  open = false,
  disabled = false,
  className = '',
  ariaLabel = 'Abrir FAB',
  icon,
  children,
  onClose,
  size = 'lg',
}: FabProps) {
  const fabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !onClose) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (fabRef.current && !fabRef.current.contains(target)) {
        const isClickInChildren = Array.from(
          document.querySelectorAll('[data-fab-panel]')
        ).some(panel => panel.contains(target));

        if (!isClickInChildren) {
          onClose();
        }
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  return (
    <button
      ref={fabRef}
      data-testid="fab"
      className={cn(
        'fixed bottom-6 right-6 rounded-full',
        'bg-gradient-to-br from-indigo-600 to-purple-500',
        'text-white flex items-center justify-center',
        'transition-all duration-300 hover:scale-110 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2',
        'shadow-lg hover:shadow-xl z-50',
        sizeClasses[size],
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      type="button"
    >
      {open ? (
        <X size={iconSizes[size] + 4} className="text-white" />
      ) : (
        icon || <FileText size={iconSizes[size]} className="text-white" />
      )}
      {children}
    </button>
  );
}
