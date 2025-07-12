import { useState, useEffect, useCallback } from 'react';

interface Asignatura {
  id: number;
  nombre: string;
}

interface Nivel {
  id: number;
  nombre: string;
}

interface Profesor {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
}

interface Horario {
  id: number;
  nombre: string;
  asignatura: Asignatura;
  nivel: Nivel;
  profesor: Profesor;
  fechaPrimeraClase?: string;
  createdAt: string;
  modulos: Array<{
    id: number;
    dia: string;
    horaInicio: string;
    duracion: number;
  }>;
}

export function useHorarios() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHorarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/horarios');
      if (!response.ok) {
        throw new Error('Error al cargar horarios');
      }
      
      const result = await response.json();
      console.log('Respuesta cruda de la API de horarios:', result);
      setHorarios(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAsignaturas = useCallback(async () => {
    try {
      const response = await fetch('/api/asignaturas');
      if (!response.ok) {
        throw new Error('Error al cargar asignaturas');
      }
      
      const result = await response.json();
      setAsignaturas(result.data || []);
    } catch (err) {
      console.error('Error al cargar asignaturas:', err);
      setAsignaturas([]);
    }
  }, []);

  const fetchNiveles = useCallback(async () => {
    try {
      const response = await fetch('/api/niveles');
      if (!response.ok) {
        throw new Error('Error al cargar niveles');
      }
      
      const result = await response.json();
      setNiveles(result || []);
    } catch (err) {
      console.error('Error al cargar niveles:', err);
      setNiveles([]);
    }
  }, []);

  const fetchProfesores = useCallback(async () => {
    try {
      const response = await fetch('/api/profesores');
      if (!response.ok) {
        throw new Error('Error al cargar profesores');
      }
      
      const result = await response.json();
      setProfesores(result.data || []);
    } catch (err) {
      console.error('Error al cargar profesores:', err);
      setProfesores([]);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    await Promise.all([
      fetchAsignaturas(),
      fetchNiveles(),
      fetchProfesores()
    ]);
  }, [fetchAsignaturas, fetchNiveles, fetchProfesores]);

  const createHorario = useCallback(async (horarioData: {
    nombre: string;
    asignaturaId: number;
    nivelId: number;
    docenteId: number;
    fechaPrimeraClase?: Date;
    modulos: Array<{
      dia: string;
      horaInicio: string;
      duracion: number;
      orden: number;
    }>;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/horarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(horarioData),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear horario');
      }
      
      const newHorario = await response.json();
      setHorarios(prev => [...prev, newHorario]);
      return newHorario;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteHorario = useCallback(async (horarioId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/horarios/${horarioId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar horario');
      }
      
      setHorarios(prev => prev.filter(h => h.id !== horarioId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateHorario = useCallback(async (horarioId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const horario = horarios.find(h => h.id === horarioId);
      if (!horario) {
        throw new Error('Horario no encontrado');
      }
      
      const horarioData = {
        nombre: `${horario.nombre} (Copia)`,
        asignaturaId: horario.asignatura.id,
        nivelId: horario.nivel.id,
        docenteId: horario.profesor.id,
        fechaPrimeraClase: horario.fechaPrimeraClase ? new Date(horario.fechaPrimeraClase) : undefined,
        modulos: horario.modulos.map(modulo => ({
          dia: modulo.dia,
          horaInicio: modulo.horaInicio,
          duracion: modulo.duracion,
          orden: 1, // Se ajustará automáticamente
        })),
      };
      
      const newHorario = await createHorario(horarioData);
      return newHorario;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [horarios, createHorario]);

  const updateHorario = useCallback(async (horarioId: number, horarioData: {
    nombre: string;
    asignaturaId: number;
    nivelId: number;
    docenteId: number;
    fechaPrimeraClase?: Date;
    modulos: Array<{
      dia: string;
      horaInicio: string;
      duracion: number;
      orden: number;
    }>;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/horarios/${horarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(horarioData),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar horario');
      }
      const updatedHorario = await response.json();
      setHorarios(prev => prev.map(h => h.id === horarioId ? updatedHorario.data : h));
      return updatedHorario;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    horarios,
    asignaturas,
    niveles,
    profesores,
    loading,
    error,
    loadHorarios,
    createHorario,
    deleteHorario,
    duplicateHorario,
    loadInitialData,
    updateHorario,
  };
} 