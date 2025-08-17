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
    setShowCierre,
    setShowResumen,
    audioEnabled,
    setAudioEnabled,
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
          {/* Botón de activación de audio */}
          {!audioEnabled ? (
            <button
              onClick={() => setAudioEnabled(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
              Activar Audio
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
                Audio Activado
              </div>
            </div>
          )}

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
