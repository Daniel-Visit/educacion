'use client';

import { PanelLeftClose } from 'lucide-react';
import React from 'react';

interface DrawerToggleProps {
  isOpen: boolean;
  onClick: () => void;
  title?: string;
}

export default function DrawerToggle({
  isOpen,
  onClick,
  title = 'Abrir panel',
}: DrawerToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed top-12 right-26 z-10 
        h-10 w-10 
        bg-gradient-to-r from-orange-500 to-pink-500 
        text-white 
        rounded-xl 
        shadow-lg hover:shadow-xl 
        hover:scale-110 
        transition-all duration-300 ease-out
        flex items-center justify-center
        group
        ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        backdrop-blur-sm
        border border-white/20
      `}
      title={title}
    >
      {/* Icono principal con animación */}
      <div className="relative">
        <PanelLeftClose
          size={20}
          className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
        />

        {/* Efecto de brillo en hover */}
        <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
      </div>

      {/* Indicador de pulso */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 group-hover:opacity-30 animate-pulse"></div>

      {/* Tooltip moderno */}
      <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {title}
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
      </div>
    </button>
  );
}
