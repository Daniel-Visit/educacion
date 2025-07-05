"use client";
import React from "react";

interface OrbVideoProps {
  step: number;
  showResumen: boolean;
}

const OrbVideo: React.FC<OrbVideoProps> = ({ step, showResumen }) => {
  // Mostrar orb solo si no estamos en el resumen
  if (step === 8 && showResumen) {
    return null;
  }

  return (
    <div className="flex justify-center mb-0 mt-4">
      <div className="w-30 h-30 rounded-full overflow-hidden mx-auto flex items-center justify-center">
        <video 
          src="/orb.mp4" 
          autoPlay 
          loop 
          muted 
          className="w-full h-full object-cover object-center scale-125"
        />
      </div>
    </div>
  );
};

export default OrbVideo; 