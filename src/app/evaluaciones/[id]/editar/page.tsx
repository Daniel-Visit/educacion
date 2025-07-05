"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EvaluacionForm from '@/components/evaluacion/EvaluacionForm';

export default function EditarEvaluacionPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [evaluacion, setEvaluacion] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/evaluaciones/${id}`)
      .then(res => res.json())
      .then(data => {
        setEvaluacion(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar la evaluación');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  if (error || !evaluacion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Evaluación no encontrada'}</p>
          <button
            onClick={() => router.push('/evaluaciones')}
            className="mt-4 px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            Volver a Evaluaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <EvaluacionForm
      modoEdicion={true}
      evaluacionInicial={evaluacion}
    />
  );
} 