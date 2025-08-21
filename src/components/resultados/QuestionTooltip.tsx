import React from 'react';

interface QuestionTooltipProps {
  numero: number | string;
  texto: string;
}

export function QuestionTooltip({ numero, texto }: QuestionTooltipProps) {
  return (
    <div className="absolute bottom-full left-0 transform -translate-y-2 px-3 py-2 bg-white text-gray-900 text-xs rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[99999] min-w-sm max-w-xl">
      <div className="font-semibold mb-1 text-gray-900">Pregunta {numero}</div>
      <div className="text-gray-600 break-words normal-case">{texto}</div>
    </div>
  );
}
