'use client'

import { useState } from 'react'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import ModalIA from '@/components/editor/ModalIA'
import FabPlanificaciones from '@/components/editor/FabPlanificaciones'
import SidebarEditor from '@/components/editor/SidebarEditor'

export default function EditorPage() {
  const [openModalIA, setOpenModalIA] = useState(false)
  const [tipoContenido, setTipoContenido] = useState('planificacion')

  return (
    <div className="min-h-screen bg-[#f7f8fd] flex flex-col w-full">
      <div className="w-full max-w-7xl mx-auto mt-6 mb-6 rounded-3xl bg-white/80 shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] flex flex-row overflow-hidden h-[calc(100vh-48px)] min-h-0 max-h-[calc(100vh-48px)]">
        <SidebarEditor selected={tipoContenido} onSelect={setTipoContenido} />
        <main className="flex-1 min-h-0 flex flex-col relative p-10 overflow-auto">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h1 className="text-3xl font-bold text-indigo-700 mb-1">{tipoContenido === 'planificacion' ? 'Planificación de Clase' : 'Material de Apoyo'}</h1>
              <p className="text-gray-500 text-base">
                {tipoContenido === 'planificacion'
                  ? 'Crea y edita la planificación detallada de tus clases'
                  : 'Gestiona el material de apoyo para tus estudiantes'}
              </p>
            </div>
            <button
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-semibold shadow hover:from-indigo-700 hover:to-purple-600 transition-all text-base"
              onClick={() => setOpenModalIA(true)}
            >
              Generar con IA
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-start items-stretch">
            <div className="bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] w-full max-w-3xl flex-1 flex flex-col items-center min-h-[600px] max-h-[calc(100vh-220px)] mx-auto h-fit p-10 self-start transition-all overflow-y-auto">
              <SimpleEditor />
            </div>
          </div>
          <ModalIA open={openModalIA} onClose={() => setOpenModalIA(false)} />
        </main>
        <FabPlanificaciones />
      </div>
    </div>
  )
} 