'use client';
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Respuestas } from './constants';

interface SummaryProps {
  respuestas: Respuestas;
}

const Summary: React.FC<SummaryProps> = ({ respuestas }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px]">
      <div className="flex flex-col items-center w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 border border-indigo-100">
        <div className="mb-6 flex flex-col items-center">
          <CheckCircle2
            className="text-indigo-500 animate-pulse mb-2"
            size={48}
          />
          <h2 className="text-2xl font-bold text-indigo-800 mb-2 text-center">
            Resumen de tus respuestas
          </h2>
          <p className="mb-4 text-gray-600 text-center">
            Hola Francisca, aquí tienes un resumen de la información que me has
            proporcionado:
          </p>
        </div>
        <div className="space-y-4 w-full">
          <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div>
              <div className="font-semibold">Años trabajando en el colegio</div>
              <div className="text-indigo-700">{respuestas.anios} años</div>
            </div>
            <CheckCircle2 className="text-indigo-400" />
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div>
              <div className="font-semibold">Nivel educativo</div>
              <div className="text-indigo-700">{respuestas.nivel}</div>
            </div>
            <CheckCircle2 className="text-indigo-400" />
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div>
              <div className="font-semibold">Asignatura</div>
              <div className="text-indigo-700">{respuestas.asignatura}</div>
            </div>
            <CheckCircle2 className="text-indigo-400" />
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div>
              <div className="font-semibold">Horas lectivas</div>
              <div className="text-indigo-700">{respuestas.horas}</div>
            </div>
            <CheckCircle2 className="text-indigo-400" />
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div>
              <div className="font-semibold">Estudiantes promedio</div>
              <div className="text-indigo-700">{respuestas.estudiantes}</div>
            </div>
            <CheckCircle2 className="text-indigo-400" />
          </div>
        </div>
        <div className="pt-8 w-full">
          <button className="w-full bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-purple-500 text-white font-bold text-lg py-3 rounded-2xl shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg">
            Guardar y continuar{' '}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Summary;
