"use client";
import Link from "next/link";
import { BookOpen, Sparkles, FileText, Edit3, CheckSquare, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-3xl font-bold text-indigo-700 mb-1">
            ¡Hola, Francisca!
          </h1>
          <p className="text-gray-500 text-base">
            Tu tutora pedagógica virtual está listo para comenzar
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] w-full max-w-2xl flex flex-col items-center p-12 transition-all">
          {/* Icono de libro */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-500 w-20 h-20 flex items-center justify-center rounded-[24px] shadow-[0_8px_32px_0_rgba(99,102,241,0.18)] mb-8">
            <BookOpen size={52} strokeWidth={2.5} className="text-white drop-shadow-[0_2px_8px_rgba(80,63,251,0.18)]" />
          </div>
          
          {/* Subtítulo */}
          <p className="text-[#5b6478] text-center mb-10 text-lg font-medium">
            Selecciona una opción para comenzar
          </p>
          
          {/* Botones */}
          <div className="w-full space-y-4">
            <Link href="/entrevista" className="w-full flex justify-center">
              <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold text-lg px-10 py-3 rounded-2xl shadow-[0_4px_24px_0_rgba(99,102,241,0.18)] hover:scale-[1.04] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 group w-full">
                <MessageSquare size={20} />
                Comenzar Entrevista
                <span className="transition-transform duration-300 group-hover:rotate-12">
                  <Sparkles size={20} strokeWidth={2.2} className="text-white drop-shadow-[0_1px_4px_rgba(99,102,241,0.18)]" />
                </span>
              </button>
            </Link>
            
            <Link href="/evaluaciones" className="w-full flex justify-center">
              <button className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm text-indigo-700 font-semibold text-base px-8 py-3 rounded-2xl border border-indigo-200 shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 group w-full">
                <CheckSquare size={20} />
                Evaluaciones
              </button>
            </Link>
            
            <Link href="/matrices" className="w-full flex justify-center">
              <button className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm text-indigo-700 font-semibold text-base px-8 py-3 rounded-2xl border border-indigo-200 shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 group w-full">
                <FileText size={20} />
                Matrices de Especificación
              </button>
            </Link>
            
            <Link href="/editor" className="w-full flex justify-center">
              <button className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm text-indigo-700 font-semibold text-base px-8 py-3 rounded-2xl border border-indigo-200 shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 group w-full">
                <Edit3 size={20} />
                Editor de Planificaciones
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
