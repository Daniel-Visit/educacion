'use client';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  InterviewCard,
  Summary,
  OrbVideo,
  useInterview,
  steps,
  preguntas,
  alternativas,
  preguntaToStep,
} from '@/components/entrevista';

function EntrevistaContent() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');
  const initialStep = stepParam ? parseInt(stepParam) : 0;

  const {
    step,
    respuestas,
    showCierre,
    showResumen,
    disableNext,
    handleSelect,
    handleNext,
    handleSidebarClick,
    setShowCierre,
    setShowResumen,
  } = useInterview(preguntas, initialStep);

  // Saber si el paso es tipo S
  const isTypeS = steps[step]?.tipo === 'S';

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 pb-2 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-500 w-12 h-12 flex items-center justify-center rounded-2xl">
            <div className="text-white text-xl font-bold">{step + 1}</div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-indigo-700 mb-1">
              Entrevista Personalizada
            </h1>
            <p className="text-gray-500 text-base">
              {steps[step]?.label} - Paso {step + 1} de {steps.length}
            </p>
          </div>
        </div>

        {/* Indicador de progreso */}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-400 to-indigo-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-600">
              {step + 1}/{steps.length}
            </span>
          </div>
        </div>
      </div>

      {/* Contenido principal sin card blanca */}
      <div className="w-full max-w-3xl mx-auto px-4">
        {/* Orb Video y Card solo si no es resumen */}
        {!showResumen && (
          <>
            <div className="relative h-24 rounded-3xl mb-14 w-full">
              <OrbVideo step={step} showResumen={showResumen} />
            </div>
            {/* Interview Card */}
            <div className="w-full">
              <InterviewCard
                step={step}
                preguntas={preguntas}
                isTypeS={isTypeS}
                respuestas={respuestas}
                alternativas={alternativas}
                handleSelect={handleSelect}
                handleNext={handleNext}
                disableNext={disableNext}
                showCierre={showCierre}
                showResumen={showResumen}
                setShowCierre={setShowCierre}
                setShowResumen={setShowResumen}
                renderResumen={() => <Summary respuestas={respuestas} />}
              />
            </div>
          </>
        )}
        {/* Resumen centrado y con margen superior si es resumen */}
        {showResumen && (
          <div className="mt-16">
            <Summary respuestas={respuestas} />
          </div>
        )}
      </div>
    </>
  );
}

export default function Entrevista() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EntrevistaContent />
    </Suspense>
  );
}
