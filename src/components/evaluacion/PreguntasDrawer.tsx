"use client"

import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

interface PreguntasDrawerProps {
  isOpen?: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function PreguntasDrawer({
  isOpen = false,
  onClose,
  children,
}: PreguntasDrawerProps) {
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
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.5 }}
            className="fixed inset-y-0 right-0 z-50 w-[400px] bg-white shadow-xl flex flex-col"
            style={{ willChange: 'transform' }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 