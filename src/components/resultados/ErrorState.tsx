import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
}

export default function ErrorState({
  title = 'Error',
  message,
}: ErrorStateProps) {
  return (
    <div className="bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border border-red-200 rounded-3xl p-8 shadow-lg">
      <div className="text-center">
        {/* Icono decorativo */}
        <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <AlertTriangle className="w-10 h-10 text-white" />
        </div>

        {/* Título principal */}
        <h3 className="text-2xl font-bold text-red-800 mb-3">{title}</h3>

        {/* Descripción */}
        <div className="max-w-md mx-auto space-y-3">
          <p className="text-red-700 text-base leading-relaxed">{message}</p>
        </div>

        {/* Línea decorativa */}
        <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-pink-500 rounded-full mx-auto my-6"></div>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-white/50 rounded-2xl border border-red-100">
          <p className="text-red-600 text-xs font-medium">
            💡 Tip: Verifica que el archivo CSV tenga el formato correcto con
            las columnas: rut, pregunta_id, alternativa_dada
          </p>
        </div>
      </div>
    </div>
  );
}
