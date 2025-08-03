import React from 'react';
import { ArrowLeft, BarChart3, Target, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MatrizHeaderProps {
  totalPreguntas: number;
  selectedOAsCount: number;
  currentStep: number;
  totalSteps: number;
}

export default function MatrizHeader({
  totalPreguntas,
  selectedOAsCount,
  currentStep,
  totalSteps,
}: MatrizHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-8 mb-8 shadow-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-3 text-indigo-200 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Crear Nueva Matriz
          </h1>
          <p className="text-indigo-200 text-lg">
            Define los criterios de evaluación para tu matriz de especificación
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-200" />
            <div>
              <p className="text-indigo-200 text-xs">Total Preguntas</p>
              <p className="text-lg font-bold text-white">{totalPreguntas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-200" />
            <div>
              <p className="text-indigo-200 text-xs">OAs Seleccionados</p>
              <p className="text-lg font-bold text-white">{selectedOAsCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-indigo-200" />
            <div>
              <p className="text-indigo-200 text-xs">Paso Actual</p>
              <p className="text-lg font-bold text-white">
                {currentStep} de {totalSteps}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
