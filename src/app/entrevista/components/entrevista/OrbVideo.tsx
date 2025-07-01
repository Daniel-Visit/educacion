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
      <video src="/orb.mp4" autoPlay loop muted className="w-40 h-40 object-contain" />
    </div>
  );
};

export default OrbVideo; 