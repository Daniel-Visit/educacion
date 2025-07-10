"use client"

import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  isOpen?: boolean
  onClose: () => void
  children: React.ReactNode
  header?: React.ReactNode
  width?: number | string // Nuevo: ancho opcional
}

export default function Drawer({
  isOpen = false,
  onClose,
  children,
  header,
  width = 400,
}: DrawerProps) {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 cursor-pointer"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.5 }}
            className="fixed inset-y-0 right-0 z-100 bg-white shadow-xl flex flex-col"
            style={{ willChange: 'transform', width: typeof width === 'number' ? `${width}px` : width }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>{header}</div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar panel"
              >
                <X size={20} />
              </button>
            </div>
            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 