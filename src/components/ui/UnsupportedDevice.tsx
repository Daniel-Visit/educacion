'use client';

import { useEffect, useState } from 'react';
import { Monitor, Smartphone, BookOpen } from 'lucide-react';

export default function UnsupportedDevice() {
  const [isUnsupported, setIsUnsupported] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop'
  );

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;

      // Detectar tipo de dispositivo basado en dimensiones
      if (width < 768) {
        setDeviceType('mobile');
        setIsUnsupported(true);
      } else if (width < 1024) {
        setDeviceType('tablet');
        setIsUnsupported(true);
      } else {
        setDeviceType('desktop');
        setIsUnsupported(false);
      }
    };

    // Verificar al montar
    checkDevice();

    // Verificar en resize
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!isUnsupported) {
    return null;
  }

  const getDeviceText = () => {
    switch (deviceType) {
      case 'mobile':
        return 'dispositivo móvil';
      case 'tablet':
        return 'tablet';
      default:
        return 'dispositivo';
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 z-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 text-center my-10">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl">
            <BookOpen className="h-16 w-16 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
          Plataforma no disponible en {getDeviceText()}
        </h1>

        <p className="text-gray-600 mb-4 leading-relaxed">
          Por el momento, nuestra plataforma educativa está optimizada
          únicamente para
          <strong className="text-indigo-600"> computadores y laptops</strong>.
          Estamos trabajando para hacerla completamente responsiva.
        </p>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4 border border-indigo-200">
          <h2 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            ¿Por qué solo laptop?
          </h2>
          <p className="text-sm text-left text-indigo-700">
            Las funcionalidades complejas como creación de matrices,
            planificación anual y gestión de evaluaciones requieren una pantalla
            más grande para una experiencia óptima.
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-500">
          <p className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600" />
            <strong>Recomendado:</strong> Laptop o computador de escritorio
          </p>
          <p className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600" />
            <strong>Próximamente:</strong> Versión móvil y tablet
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Si tienes alguna pregunta, contacta a nuestro equipo de soporte
          </p>
        </div>
      </div>
    </div>
  );
}
