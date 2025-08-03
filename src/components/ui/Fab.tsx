import React, { useEffect, useRef } from 'react';
import { FileText, X } from 'lucide-react';

interface FabProps {
  onClick: () => void;
  open?: boolean;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
}

export default function Fab({
  onClick,
  open = false,
  disabled = false,
  className = '',
  ariaLabel = 'Abrir FAB',
  icon,
  children,
  onClose,
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
      className={`fixed bottom-8 right-22 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-500 text-white text-4xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none z-50 ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      type="button"
    >
      {open ? (
        <X size={36} className="text-white" />
      ) : (
        icon || <FileText size={32} className="text-white" />
      )}
      {children}
    </button>
  );
}
