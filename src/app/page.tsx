"use client";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100 via-purple-100 to-white font-sans">
      <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_40px_0_rgba(80,63,251,0.13)] px-12 py-14 flex flex-col items-center w-full max-w-xl relative border border-white/40 transition-all duration-300">
        {/* Icono de libro */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-500 w-20 h-20 flex items-center justify-center rounded-[24px] shadow-[0_8px_32px_0_rgba(99,102,241,0.18)] mb-8">
          <BookOpen size={52} strokeWidth={2.5} className="text-white drop-shadow-[0_2px_8px_rgba(80,63,251,0.18)]" />
        </div>
        {/* Título */}
        <h1 className="text-4xl font-extrabold text-center text-[#23272f] mb-3 tracking-tight">
          ¡Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">Francisca</span>!
        </h1>
        {/* Subtítulo */}
        <p className="text-[#5b6478] text-center mb-10 text-lg font-medium">
          Tu tutora pedagógica virtual está listo para comenzar.
        </p>
        {/* Botón */}
        <Link href="/entrevista" className="w-full flex justify-center">
          <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold text-lg px-10 py-3 rounded-2xl shadow-[0_4px_24px_0_rgba(99,102,241,0.18)] hover:scale-[1.04] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 group">
            Comenzar Entrevista
            <span className="transition-transform duration-300 group-hover:rotate-12">
              <Sparkles size={28} strokeWidth={2.2} className="text-white drop-shadow-[0_1px_4px_rgba(99,102,241,0.18)]" />
            </span>
          </button>
        </Link>
      </div>
    </div>
  );
}
