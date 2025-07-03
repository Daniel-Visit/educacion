"use client";
import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Respuestas } from "./constants";

interface SummaryProps {
  respuestas: Respuestas;
}

const Summary: React.FC<SummaryProps> = ({ respuestas }) => {
  return (
    <div className="flex flex-col flex-1 w-full h-full">
      <div className="p-8 overflow-y-auto flex-1 rounded-t-3xl">
        <h2 className="text-2xl font-bold text-indigo-800 mb-4">Resumen de tus respuestas</h2>
        <p className="mb-6">Hola Francisca, aquí tienes un resumen de la información que me has proporcionado:</p>
        <div className="space-y-4">
          <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div>
              <div className="font-semibold">Años trabajando en el colegio</div>
              <div className="text-indigo-700">{respuestas.anios} años</div>
            </div>
            <CheckCircle2 className="text-indigo-500 animate-pulse" />
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div>
              <div className="font-semibold">Nivel educativo</div>
              <div className="text-indigo-700">{respuestas.nivel}</div>
            </div>
            <CheckCircle2 className="text-indigo-500 animate-pulse" />
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div>
              <div className="font-semibold">Asignatura</div>
              <div className="text-indigo-700">{respuestas.asignatura}</div>
            </div>
            <CheckCircle2 className="text-indigo-500 animate-pulse" />
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div>
              <div className="font-semibold">Horas lectivas</div>
              <div className="text-indigo-700">{respuestas.horas}</div>
            </div>
            <CheckCircle2 className="text-indigo-500 animate-pulse" />
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            <div>
              <div className="font-semibold">Estudiantes promedio</div>
              <div className="text-indigo-700">{respuestas.estudiantes}</div>
            </div>
            <CheckCircle2 className="text-indigo-500 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="p-6 border-t border-gray-100 bg-white rounded-b-3xl">
        <button className="w-full bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-purple-500 text-white font-bold text-lg py-3 rounded-2xl shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg">Continuar a la planificación</button>
      </div>
    </div>
  );
};

export default Summary; 