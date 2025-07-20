import React from 'react';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  showBackButton?: boolean;
}

export function ErrorDisplay({ 
  title = "Error al cargar datos", 
  message, 
  showBackButton = true 
}: ErrorDisplayProps) {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="bg-red-50 border-2 border-dashed border-red-200 rounded-lg p-8 max-w-md">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-red-600 text-sm mb-4">{message}</p>
              {showBackButton && (
                <button 
                  onClick={() => window.history.back()}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 mx-auto"
                >
                  ← Volver a Resultados
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 