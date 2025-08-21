import React, { useEffect, useState } from 'react';
import {
  Projector,
  BookOpen,
  Users,
  Gamepad2,
  Palette,
  Brain,
  Lightbulb,
  Search,
  Presentation,
  Zap,
  Heart,
  UserCheck,
  Sparkles,
  X,
} from 'lucide-react';

interface Metodologia {
  id: number;
  nombre_metodologia: string;
  descripcion: string;
  nivel_recomendado: string;
  fuentes_literatura: string;
}

interface ModalIAProps {
  open: boolean;
  onClose: () => void;
}

const metodologiaIcons: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  'Aprendizaje Basado en Proyectos (ABP)': Projector,
  'Aula Invertida (Flipped Classroom)': BookOpen,
  'Aprendizaje Cooperativo': Users,
  Gamificación: Gamepad2,
  'Design Thinking (Pensamiento de Diseño)': Palette,
  'Aprendizaje Basado en el Pensamiento (TBL)': Brain,
  'Aprendizaje Basado en Problemas (ABP)': Lightbulb,
  'Aprendizaje por Indagación': Search,
  'Enseñanza Explícita': Presentation,
  'Aceleración Cognitiva': Zap,
  'Tutoría entre Iguales': Heart,
  'Aprendizaje Autónomo': UserCheck,
};

const useMetodologias = (open: boolean) => {
  const [metodologias, setMetodologias] = useState<Metodologia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchMetodologias = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/metodologias');
        if (!response.ok) {
          throw new Error('Error al cargar metodologías');
        }
        const data = await response.json();
        setMetodologias(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error fetching metodologías:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetodologias();
  }, [open]);

  return { metodologias, loading, error };
};

export default function ModalIA({ open, onClose }: ModalIAProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const { metodologias, loading, error } = useMetodologias(open);

  const handleMetodologiaSelect = (id: number) => {
    setSelected(id);
  };

  const handleGenerate = () => {
    if (selected !== null) {
      // Aquí iría la lógica para generar contenido con la metodología seleccionada
      console.log('Generando contenido con metodología:', selected);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-0 relative flex flex-col">
        {/* Header consistente con la plataforma */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Generar Clase con IA
                </h2>
                <p className="text-indigo-100 text-sm mt-2">
                  Planificación de Clase
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pt-6 pb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Metodologías Pedagógicas
          </h3>

          {loading && (
            <div className="text-center py-8 text-gray-500">
              Cargando metodologías...
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500">Error: {error}</div>
          )}

          {!loading && !error && (
            <div className="space-y-4 max-h-72 overflow-y-auto">
              {metodologias.map(metodologia => {
                const Icon =
                  metodologiaIcons[metodologia.nombre_metodologia] || BookOpen;
                const isActive = selected === metodologia.id;

                return (
                  <div
                    key={metodologia.id}
                    className={`border rounded-xl p-5 flex flex-row gap-4 items-start cursor-pointer transition-all duration-200 bg-white ${
                      isActive
                        ? 'border-violet-400 shadow-md'
                        : 'border-gray-200 hover:border-violet-200'
                    } ${isActive ? 'ring-2 ring-violet-100' : ''}`}
                    onClick={() => handleMetodologiaSelect(metodologia.id)}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-violet-50 text-violet-600 mt-1">
                      <div className="w-7 h-7">
                        <Icon />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-base truncate">
                          {metodologia.nombre_metodologia}
                        </span>
                        <span className="ml-2 bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                          {metodologia.nivel_recomendado}
                        </span>
                      </div>
                      <div className="text-gray-700 text-sm mb-1 whitespace-normal">
                        {metodologia.descripcion}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        Fuente: {metodologia.fuentes_literatura}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-8 py-5 bg-white rounded-b-2xl">
          <button
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-bold hover:shadow-sm transition-colors"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold disabled:opacity-50 hover:from-indigo-700 hover:to-purple-600 transition-colors"
            disabled={selected === null}
            onClick={handleGenerate}
          >
            Generar Contenido
          </button>
        </div>
      </div>
    </div>
  );
}
