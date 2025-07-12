'use client';

import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import { Play, Edit3, Trash2, Calendar, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import CrearHorarioModal from './CrearHorarioModal';
import { useHorarios } from '@/hooks/use-horarios';
import React, { useEffect, useRef, useState } from 'react';

// Utilidad para generar los números de página con puntos suspensivos
function getPagination(current: number, total: number) {
  const delta = 1;
  const range = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }
  if (current - delta > 2) range.unshift('...');
  if (current + delta < total - 1) range.push('...');
  range.unshift(1);
  if (total > 1) range.push(total);
  return Array.from(new Set(range));
}

export default function HorariosList() {
  const router = useRouter();
  const { horarios, loadHorarios, deleteHorario } = useHorarios();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [horarioEditando, setHorarioEditando] = useState<any | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [pagina, setPagina] = useState(1);
  const porPagina = 6;
  const totalPaginas = Math.ceil(horarios.length / porPagina);
  const horariosPagina = horarios.slice((pagina - 1) * porPagina, pagina * porPagina);

  useEffect(() => {
    loadHorarios();
  }, [loadHorarios]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

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
      <CrearHorarioModal
        isOpen={modalOpen || !!horarioEditando}
        onClose={() => { setModalOpen(false); setHorarioEditando(null); }}
        onHorarioCreated={() => { setModalOpen(false); setHorarioEditando(null); loadHorarios(); }}
        modoEdicion={!!horarioEditando}
        horarioInicial={horarioEditando}
      />
      {horarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Calendar size={80} className="text-gray-300 mb-6" />
          <h3 className="text-3xl font-bold text-gray-900 mb-2">No hay horarios creados</h3>
          <p className="text-xl text-gray-500 mb-8">Crea tu primer horario para comenzar</p>
          <PrimaryButton onClick={() => setModalOpen(true)} className="text-lg px-10 py-4">Nuevo Horario</PrimaryButton>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {horariosPagina.map((horario) => (
              <div key={horario.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl shadow-lg p-6 flex flex-col gap-4 relative transition-transform hover:scale-[1.025] hover:shadow-2xl">
                {/* Botón de acciones arriba a la derecha */}
                <div className="absolute top-4 right-4 z-10" ref={openMenuId === horario.id ? menuRef : undefined}>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === horario.id ? null : horario.id)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-transparent hover:bg-gradient-to-r from-indigo-100 to-purple-100 hover:border hover:border-indigo-300 hover:text-indigo-700  text-gray-500 transition"
                    title="Acciones"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {openMenuId === horario.id && (
                    <div className="absolute right-0 top-full mt-2 p-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[140px]">
                      <button
                        onClick={() => { window.location.href = `/planificacion-anual?horarioId=${horario.id}`; setOpenMenuId(null); }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 rounded-lg"
                      >
                        <Play size={16} /> Seleccionar
                      </button>
                      <button
                        onClick={() => { setHorarioEditando(horario); setOpenMenuId(null); }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 rounded-lg"
                      >
                        <Edit3 size={16} /> Editar
                      </button>
                      <button
                        onClick={() => { deleteHorario(horario.id); setOpenMenuId(null); }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg"
                      >
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
                {/* Resto del contenido de la tarjeta */}
                <Calendar size={40} className="text-indigo-400 mb-2 mx-auto" />
                <h2 className="text-xl font-bold text-indigo-800 text-center mb-1">{horario.nombre}</h2>
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">{horario.asignatura?.nombre || '-'}</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">{horario.nivel?.nombre || '-'}</span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">{horario.profesor?.nombre || '-'}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Paginación exacta estilo imagen */}
          <div className="flex justify-center mt-8">
            <nav className="inline-flex items-center gap-4 select-none" aria-label="Pagination">
              <button
                className="flex items-center gap-1 text-[1.7rem] text-gray-800 font-normal px-2 py-1 rounded-md hover:bg-gray-50 transition disabled:opacity-40"
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
              >
                <ChevronLeft size={20} strokeWidth={2.2} /> 
              </button>
              <div className="flex items-center gap-4">
                {getPagination(pagina, totalPaginas).map((p, idx) =>
                  p === '...'
                    ? <span key={idx} className="text-3xl text-gray-700 font-light px-2">•••</span>
                    : <button
                        key={p}
                        className={
                          pagina === p
                            ? 'flex items-center justify-center text-sm font-medium rounded-xl border-2 border-gray-200 bg-white  shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] px-4 py-2'
                            : 'flex items-center justify-center text-sm font-normal rounded-xl px-4 py-2 hover:bg-gray-50 transition'
                        }
                        onClick={() => setPagina(Number(p))}
                        aria-current={pagina === p ? 'page' : undefined}
                      >
                        {p}
                      </button>
                )}
              </div>
              <button
                className="flex items-center gap-1 text-[1.7rem] text-gray-800 font-normal px-2 py-1 rounded-md hover:bg-gray-50 transition disabled:opacity-40"
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
              >
                 <ChevronRight size={20} strokeWidth={2.2} />
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
} 