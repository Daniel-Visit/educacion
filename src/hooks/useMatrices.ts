import { useState, useEffect, useCallback } from 'react';
import { 
  OA, 
  Eje, 
  Asignatura, 
  Nivel, 
  MatrizEspecificacion,
  MatrizFormState,
  ValidationResult 
} from '@/types/matrices';
import { validateMatrizForm, calculateTotalPreguntas } from '@/utils/matrices';

// Hook para manejar datos básicos (OAs, ejes, asignaturas, niveles)
export const useMatricesData = () => {
  const [oas, setOAs] = useState<OA[]>([]);
  const [ejes, setEjes] = useState<Eje[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOAs = useCallback(async () => {
    try {
      const response = await fetch('/api/oas');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setOAs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching OAs:', error);
      setOAs([]);
    }
  }, []);

  const fetchEjes = useCallback(async () => {
    try {
      const response = await fetch('/api/ejes');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setEjes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching ejes:', error);
      setEjes([]);
    }
  }, []);

  const fetchAsignaturas = useCallback(async () => {
    try {
      const response = await fetch('/api/asignaturas');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setAsignaturas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching asignaturas:', error);
      setAsignaturas([]);
    }
  }, []);

  const fetchNiveles = useCallback(async () => {
    try {
      const response = await fetch('/api/niveles');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setNiveles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching niveles:', error);
      setNiveles([]);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOAs(),
        fetchEjes(),
        fetchAsignaturas(),
        fetchNiveles()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchOAs, fetchEjes, fetchAsignaturas, fetchNiveles]);

  return {
    oas,
    ejes,
    asignaturas,
    niveles,
    loading,
    refetch: {
      fetchOAs,
      fetchEjes,
      fetchAsignaturas,
      fetchNiveles
    }
  };
};

// Hook para manejar el estado del formulario de matriz
export const useMatrizForm = (initialState?: Partial<MatrizFormState>) => {
  const [formState, setFormState] = useState<MatrizFormState>({
    matrizName: '',
    selectedAsignatura: null,
    selectedNivel: null,
    selectedOAsContenido: [],
    selectedOAsHabilidad: [],
    totalPreguntas: 0,
    oaIndicadores: {},
    errors: {},
    ...initialState
  });

  const updateFormState = useCallback((updates: Partial<MatrizFormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateErrors = useCallback((errors: { [key: string]: string }) => {
    setFormState(prev => ({ ...prev, errors }));
  }, []);

  const clearErrors = useCallback(() => {
    setFormState(prev => ({ ...prev, errors: {} }));
  }, []);

  const validateForm = useCallback((): ValidationResult => {
    // Calcular valores necesarios para la validación
    const totalPreguntasIndicadores = Object.values(formState.oaIndicadores).flat().reduce((sum, ind) => sum + (ind.preguntas || 0), 0);
    const totalPreguntasContenido = formState.selectedOAsContenido.reduce((sum, oa) => {
      const indicadores = formState.oaIndicadores[oa.id] || [];
      return sum + indicadores.reduce((indSum, ind) => indSum + (ind.preguntas || 0), 0);
    }, 0);
    const totalPreguntasHabilidad = formState.selectedOAsHabilidad.reduce((sum, oa) => {
      const indicadores = formState.oaIndicadores[oa.id] || [];
      return sum + indicadores.reduce((indSum, ind) => indSum + (ind.preguntas || 0), 0);
    }, 0);
    const hasBothTypes = formState.selectedOAsContenido.length > 0 && formState.selectedOAsHabilidad.length > 0;

    const errors = validateMatrizForm(
      formState.matrizName,
      formState.selectedAsignatura,
      formState.selectedNivel,
      formState.selectedOAsContenido,
      formState.selectedOAsHabilidad,
      formState.totalPreguntas,
      formState.oaIndicadores,
      totalPreguntasContenido,
      totalPreguntasHabilidad,
      totalPreguntasIndicadores,
      hasBothTypes
    );

    updateErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  }, [formState, updateErrors]);

  const updateTotalPreguntas = useCallback(() => {
    const total = calculateTotalPreguntas(formState.oaIndicadores);
    setFormState(prev => ({ ...prev, totalPreguntas: total }));
  }, [formState.oaIndicadores]);

  return {
    formState,
    updateFormState,
    updateErrors,
    clearErrors,
    validateForm,
    updateTotalPreguntas
  };
};

// Hook para manejar la lista de matrices
export const useMatricesList = () => {
  const [matrices, setMatrices] = useState<MatrizEspecificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchMatrices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/matrices');
      if (response.ok) {
        const data = await response.json();
        setMatrices(data);
      }
    } catch (error) {
      console.error('Error fetching matrices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMatriz = useCallback(async (id: number) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/matrices/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMatrices(prev => prev.filter(matriz => matriz.id !== id));
        return { success: true };
      } else {
        return { success: false, error: 'Error al eliminar la matriz' };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    } finally {
      setDeletingId(null);
    }
  }, []);

  useEffect(() => {
    fetchMatrices();
  }, [fetchMatrices]);

  return {
    matrices,
    loading,
    currentPage,
    setCurrentPage,
    deletingId,
    fetchMatrices,
    deleteMatriz
  };
};

// Hook para manejar una matriz específica (para edición)
export const useMatriz = (matrizId: number) => {
  const [matriz, setMatriz] = useState<MatrizEspecificacion | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatriz = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/matrices/${matrizId}`);
      if (response.ok) {
        const data = await response.json();
        setMatriz(data);
      }
    } catch (error) {
      console.error('Error fetching matriz:', error);
    } finally {
      setLoading(false);
    }
  }, [matrizId]);

  useEffect(() => {
    if (matrizId) {
      fetchMatriz();
    }
  }, [matrizId, fetchMatriz]);

  return {
    matriz,
    loading,
    fetchMatriz
  };
}; 