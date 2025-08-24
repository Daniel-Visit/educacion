import React from 'react';
import { ArrowLeft, BarChart3, Target, Check, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MatrizHeaderProps {
  totalPreguntas: number;
  selectedOAsCount: number;
  currentStep: number;
  totalSteps: number;
  // Nuevas props para modo edición
  mode?: 'create' | 'edit';
  matrizOriginal?: {
    nombre: string;
  };
}

export default function MatrizHeader({
  totalPreguntas,
  selectedOAsCount,
  currentStep,
  totalSteps,
  mode = 'create',
  matrizOriginal,
}: MatrizHeaderProps) {
  const router = useRouter();

  const isEditMode = mode === 'edit';

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-white/80 hover:bg-white/20 rounded-lg transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="bg-white/20 p-2 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {isEditMode
                ? 'Editar Matriz de Especificación'
                : 'Crear Nueva Matriz'}
            </h1>
            <p className="text-indigo-100 text-sm">
              {isEditMode
                ? 'Modifica los criterios de evaluación de tu matriz'
                : 'Define los criterios de evaluación para tu matriz de especificación'}
            </p>
          </div>
        </div>

        {/* Información de la matriz (solo en modo edición) */}
        {isEditMode && matrizOriginal && (
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Matriz Original</p>
                <p className="text-lg font-bold">{matrizOriginal.nombre}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-200" />
            <div>
              <p className="text-indigo-200 text-xs">Total Preguntas</p>
              <p className="text-lg font-bold">{totalPreguntas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-200" />
            <div>
              <p className="text-indigo-200 text-xs">OAs Seleccionados</p>
              <p className="text-lg font-bold">{selectedOAsCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-indigo-200" />
            <div>
              <p className="text-indigo-200 text-xs">Paso Actual</p>
              <p className="text-lg font-bold">
                {currentStep} de {totalSteps}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
