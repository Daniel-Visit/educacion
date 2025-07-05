'use client'

import { PanelLeftClose } from 'lucide-react'

interface DrawerToggleButtonProps {
  isOpen: boolean
  onClick: () => void
}

export default function DrawerToggleButton({
  isOpen,
  onClick,
}: DrawerToggleButtonProps) {
  // Solo mostrar el botón cuando el drawer esté cerrado
  if (isOpen) return null

  return (
    <button
      onClick={onClick}
      className="fixed top-19.5 right-26 z-10 h-11 w-11 bg-white text-indigo-600 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-200 flex items-center justify-center"
      title="Abrir panel de preguntas"
    >
      <PanelLeftClose size={20} />
    </button>
  )
} 