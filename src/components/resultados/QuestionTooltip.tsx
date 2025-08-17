import React from 'react';

interface QuestionTooltipProps {
  numero: number;
  texto: string;
}

export function QuestionTooltip({ numero, texto }: QuestionTooltipProps) {
  return (
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-white text-gray-900 text-xs rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] min-w-sm max-w-xl">
      <div className="font-semibold mb-1 text-gray-900">Pregunta {numero}</div>
      <div className="text-gray-600 break-words normal-case">{texto}</div>
    </div>
  );
}
