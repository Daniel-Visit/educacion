'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DrawerToggleButtonProps {
  isOpen: boolean
  onClick: () => void
  drawerWidth?: number // en px, default 400
}

export default function DrawerToggleButton({
  isOpen,
  onClick,
  drawerWidth = 400,
}: DrawerToggleButtonProps) {
  // Offset para que la oreja sobresalga un poco del drawer
  const offset = 40 // px

  return (
    <motion.button
      onClick={onClick}
      className="fixed top-8 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
      initial={false}
      animate={{
        right: isOpen ? drawerWidth + offset : offset,
      }}
      transition={{ type: 'tween', duration: 0.5 }}
      title={isOpen ? 'Cerrar panel de preguntas' : 'Abrir panel de preguntas'}
      style={{ position: 'fixed' }}
    >
      {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
    </motion.button>
  )
} 