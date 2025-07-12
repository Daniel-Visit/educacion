'use client'

import { PanelLeftClose } from 'lucide-react'
import React from 'react'

interface DrawerToggleProps {
  isOpen: boolean
  onClick: () => void
  title?: string
}

export default function DrawerToggle({
  isOpen,
  onClick,
  title = 'Abrir panel',
}: DrawerToggleProps) {
  if (isOpen) return null

  return (
    <button
      onClick={onClick}
      className="fixed top-12 right-26 z-10 h-11 w-11 bg-white text-indigo-600 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-200 flex items-center justify-center"
      title={title}
    >
      <PanelLeftClose size={20} />
    </button>
  )
} 