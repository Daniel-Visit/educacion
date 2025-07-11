'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import { Play, Edit3, Trash2, Calendar } from 'lucide-react';
import CrearHorarioModal from './CrearHorarioModal';
import { useHorarios } from '@/hooks/use-horarios';
import React, { useEffect } from 'react';

export default function HorariosList() {
  const router = useRouter();
  const { horarios, loadHorarios, deleteHorario } = useHorarios();
  const [modalOpen, setModalOpen] = React.useState(false);

  useEffect(() => {
    loadHorarios();
  }, [loadHorarios]);

  // Log de depuración
  if (typeof window !== 'undefined') {
    if (!horarios || horarios.length === 0) {
      console.warn('No se encontraron horarios para mostrar');
    } else {
      console.log('Horarios recibidos:', horarios);
    }
  }

  // Recargar horarios después de crear uno nuevo
  const handleHorarioCreated = async () => {
    setModalOpen(false);
    await loadHorarios();
  };

  return (
    <>
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-3xl font-bold text-indigo-700 mb-1">Horarios Docentes</h1>
          <p className="text-gray-500 text-base">Gestiona los horarios docentes para la planificación anual</p>
        </div>
        <PrimaryButton onClick={() => setModalOpen(true)} className="flex items-center gap-2">
          <Calendar size={20} />
          Nuevo Horario
        </PrimaryButton>
      </div>
      <CrearHorarioModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onHorarioCreated={handleHorarioCreated} />
      {horarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Calendar size={80} className="text-gray-300 mb-6" />
          <h3 className="text-3xl font-bold text-gray-900 mb-2">No hay horarios creados</h3>
          <p className="text-xl text-gray-500 mb-8">Crea tu primer horario para comenzar</p>
          <PrimaryButton onClick={() => setModalOpen(true)} className="text-lg px-10 py-4">Nuevo Horario</PrimaryButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {horarios.map((horario) => (
            <div key={horario.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl shadow-lg p-6 flex flex-col gap-4 relative transition-transform hover:scale-[1.025] hover:shadow-2xl">
              <Calendar size={40} className="text-indigo-400 mb-2 mx-auto" />
              <h2 className="text-xl font-bold text-indigo-800 text-center mb-1">{horario.nombre}</h2>
              <div className="flex flex-wrap justify-center gap-2 mb-2">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">{horario.asignatura?.nombre || '-'}</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">{horario.nivel?.nombre || '-'}</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">{horario.profesor?.nombre || '-'}</span>
              </div>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-xs text-gray-500">{horario.createdAt ? new Date(horario.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</span>
                <div className="flex gap-2">
                  <button onClick={() => window.location.href = `/planificacion-anual?horarioId=${horario.id}`} title="Usar" className="h-9 w-9 flex items-center justify-center rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition"><Play size={18} /></button>
                  <button onClick={() => window.location.href = `/horarios/${horario.id}/editar`} title="Editar" className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"><Edit3 size={18} /></button>
                  <button onClick={() => deleteHorario(horario.id)} title="Eliminar" className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
} 