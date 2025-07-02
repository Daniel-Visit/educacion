import React, { useState } from 'react';
import { FileText, Clock, X } from 'lucide-react';

const planificacionesMock = [
  {
    id: 1,
    titulo: 'Planificación de Clase: El Ciclo del Agua',
    fecha: 'hace 2 días',
  },
  {
    id: 2,
    titulo: 'Introducción a las Fracciones',
    fecha: 'hace 1 semana',
  },
  {
    id: 3,
    titulo: 'La Célula: Unidad de la Vida',
    fecha: 'hace 3 semanas',
  },
  {
    id: 4,
    titulo: 'Poesía del Siglo XX',
    fecha: 'hace 1 mes',
  },
  {
    id: 5,
    titulo: 'Revolución Industrial',
    fecha: 'hace 2 meses',
  },
];

export default function FabPlanificaciones() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FAB */}
      <button
        className={`fixed bottom-8 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-500 text-white text-4xl flex items-center justify-center transition-all duration-300 z-50 hover:scale-110 active:scale-95 focus:outline-none`}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar planificaciones" : "Abrir planificaciones anteriores"}
      >
        {open ? <X size={36} className="text-white" /> : <FileText size={32} className="text-white" />}
      </button>
      {/* Panel flotante */}
      {open && (
        <div
          className="fixed top-24 right-20 w-[380px] bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] border border-gray-100 z-40 px-8 pt-8 pb-4 flex flex-col gap-4 animate-fade-in"
          style={{ minWidth: 340 }}
        >
          <h2 className="text-lg font-bold text-indigo-700 mb-4">Planificaciones Anteriores</h2>
          <div className="flex flex-col gap-2">
            {planificacionesMock.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 p-4 rounded-xl cursor-pointer border border-transparent hover:bg-indigo-50 transition-all group"
                onClick={() => setOpen(false)}
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600">
                  <FileText size={22} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-base truncate group-hover:underline">{p.titulo}</div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={14} className="text-gray-300 mr-1" />
                    {p.fecha}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
} 