import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  message: string;
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
}

export default function ErrorState({
  title = 'Error',
  message,
  showBackButton = true,
  backHref = '/resultados-evaluaciones',
  backText = 'Volver',
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 border-2 border-dashed border-red-200">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 mb-2">{title}</h3>
          <p className="text-red-600 mb-4">{message}</p>
          {showBackButton && (
            <Link href={backHref}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {backText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
