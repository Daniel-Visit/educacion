import { OA, Indicador } from '@/types/matrices';

// Configuración de gradientes
export const GRADIENT_CONFIGS = [
  {
    gradient: 'from-emerald-500 to-teal-600',
    hoverGradient: 'hover:from-emerald-600 hover:to-teal-700',
  },
  {
    gradient: 'from-amber-500 to-orange-600',
    hoverGradient: 'hover:from-amber-600 hover:to-orange-700',
  },
  {
    gradient: 'from-indigo-500 to-purple-600',
    hoverGradient: 'hover:from-indigo-600 hover:to-purple-700',
  },
  {
    gradient: 'from-cyan-500 to-blue-600',
    hoverGradient: 'hover:from-cyan-600 hover:to-blue-700',
  },
  {
    gradient: 'from-rose-500 to-pink-600',
    hoverGradient: 'hover:from-rose-600 hover:to-pink-700',
  },
  {
    gradient: 'from-violet-500 to-fuchsia-600',
    hoverGradient: 'hover:from-violet-600 hover:to-fuchsia-700',
  },
];

export const getGradient = (index: number): string => {
  return GRADIENT_CONFIGS[index % GRADIENT_CONFIGS.length].gradient;
};

// Pasos del formulario
export const MATRIZ_STEPS = [
  { n: 1, label: 'Datos básicos' },
  { n: 2, label: 'Seleccionar OA' },
  { n: 3, label: 'Indicadores' },
];

// Validaciones
export const validateMatrizForm = (
  matrizName: string,
  selectedAsignatura: number | null,
  selectedNivel: number | null,
  selectedOAsContenido: OA[],
  selectedOAsHabilidad: OA[],
  totalPreguntas: number,
  oaIndicadores: { [oaId: number]: Indicador[] },
  totalPreguntasContenido: number,
  totalPreguntasHabilidad: number,
  totalPreguntasIndicadores: number,
  hasBothTypes: boolean
): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!selectedAsignatura) {
    errors.asignatura = 'Debe seleccionar una asignatura';
  }

  if (!selectedNivel) {
    errors.nivel = 'Debe seleccionar un nivel';
  }

  if (selectedOAsContenido.length === 0 && selectedOAsHabilidad.length === 0) {
    errors.oa = 'Debe seleccionar al menos un OA';
  }

  if (!matrizName.trim()) {
    errors.nombre = 'El nombre de la matriz es requerido';
  }

  if (totalPreguntas === 0) {
    errors.indicadores = 'El total de preguntas debe ser mayor a 0';
  }

  // Validar que cada OA tenga al menos un indicador con al menos 1 pregunta
  const allOAsHaveIndicators = [
    ...selectedOAsContenido,
    ...selectedOAsHabilidad,
  ].every(oa => {
    const indicadores = oaIndicadores[oa.id] || [];
    return indicadores.length > 0 && indicadores.some(ind => ind.preguntas > 0);
  });

  if (!allOAsHaveIndicators) {
    // Encontrar OAs específicos que no tienen indicadores
    const oasWithoutIndicators = [
      ...selectedOAsContenido,
      ...selectedOAsHabilidad,
    ].filter(oa => {
      const indicadores = oaIndicadores[oa.id] || [];
      return (
        indicadores.length === 0 || !indicadores.some(ind => ind.preguntas > 0)
      );
    });

    if (oasWithoutIndicators.length > 0) {
      const oaNames = oasWithoutIndicators.map(oa => oa.oas_id).join(', ');
      errors.indicadores = `Los siguientes OAs deben tener al menos un indicador con al menos 1 pregunta: ${oaNames}`;
    } else {
      errors.indicadores =
        'Cada OA debe tener al menos un indicador con al menos 1 pregunta';
    }
  }

  // Validar que cada tipo de eje sume exactamente el total de preguntas (solo si hay ambos tipos)
  if (hasBothTypes) {
    if (totalPreguntasContenido !== totalPreguntas) {
      errors.contenido = `Las preguntas de contenido deben sumar exactamente ${totalPreguntas} (actual: ${totalPreguntasContenido})`;
    }

    if (totalPreguntasHabilidad !== totalPreguntas) {
      errors.habilidad = `Las preguntas de habilidad deben sumar exactamente ${totalPreguntas} (actual: ${totalPreguntasHabilidad})`;
    }
  } else {
    // Si solo hay un tipo, validar el total general
    if (totalPreguntasIndicadores !== totalPreguntas) {
      errors.indicadores = `El total de preguntas debe ser exactamente ${totalPreguntas} (actual: ${totalPreguntasIndicadores})`;
    }
  }

  return errors;
};

// Funciones de cálculo
export const calculateTotalPreguntas = (oaIndicadores: {
  [oaId: number]: Indicador[];
}): number => {
  return Object.values(oaIndicadores).reduce((total, indicadores) => {
    return (
      total +
      indicadores.reduce((sum, indicador) => sum + indicador.preguntas, 0)
    );
  }, 0);
};

// Funciones de filtrado
export const filterOAsByType = (
  oas: OA[],
  tipo: 'Contenido' | 'Habilidad'
): OA[] => {
  return oas.filter(oa => oa.tipo_eje === tipo);
};

export const filterOAsByEje = (oas: OA[], ejeId: number): OA[] => {
  return oas.filter(oa => oa.eje_id === ejeId);
};

// Funciones de transformación
export const transformOAsForAPI = (
  oasContenido: OA[],
  oasHabilidad: OA[]
): OA[] => {
  return [...oasContenido, ...oasHabilidad];
};

// Funciones de formato
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Funciones de paginación
export const getPageNumbers = (
  currentPage: number,
  totalPages: number
): number[] => {
  const pages: number[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push(totalPages);
    }
  }

  return pages;
};
