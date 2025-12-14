'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const gradients = {
  red: 'from-red-600 to-pink-600',
  blue: 'from-blue-600 to-cyan-600',
  green: 'from-green-600 to-emerald-600',
  purple: 'from-purple-600 to-pink-600',
  indigo: 'from-indigo-600 to-purple-600',
} as const;

export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  gradient?: keyof typeof gradients;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

/**
 * Base modal component with consistent styling.
 * Use this as the foundation for all application modals.
 */
export function BaseModal({
  open,
  onClose,
  title,
  description,
  icon,
  gradient,
  children,
  footer,
  isLoading,
  className,
}: BaseModalProps) {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn('max-w-lg', className)}>
        {gradient ? (
          // Styled header with gradient
          <div
            className={cn(
              'bg-gradient-to-r p-6 -m-6 mb-0 text-white rounded-t-lg',
              gradients[gradient]
            )}
          >
            <div className="flex items-center gap-4">
              {icon && <div className="bg-white/20 p-2 rounded-lg">{icon}</div>}
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-white/80 mt-1">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Standard header
          <DialogHeader>
            <div className="flex items-center gap-3">
              {icon}
              <div>
                <DialogTitle>{title}</DialogTitle>
                {description && (
                  <DialogDescription>{description}</DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>
        )}

        <div className={gradient ? 'pt-6' : undefined}>{children}</div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export interface ModalFooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

/**
 * Standard modal footer with cancel and confirm buttons.
 */
export function ModalFooter({
  onCancel,
  onConfirm,
  cancelText = 'Cancelar',
  confirmText = 'Confirmar',
  isLoading,
  variant = 'default',
  disabled,
}: ModalFooterProps) {
  return (
    <>
      <Button variant="outline" onClick={onCancel} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button
        variant={variant === 'destructive' ? 'destructive' : 'default'}
        onClick={onConfirm}
        disabled={isLoading || disabled}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {confirmText}
      </Button>
    </>
  );
}

// Attach ModalFooter as a static property for convenience
BaseModal.Footer = ModalFooter;
