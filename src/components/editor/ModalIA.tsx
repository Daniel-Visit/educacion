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
  Sparkles 
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

const metodologiaIcons: Record<string, React.ComponentType<any>> = {
  'Aprendizaje Basado en Proyectos (ABP)': Projector,
  'Aula Invertida (Flipped Classroom)': BookOpen,
  'Aprendizaje Cooperativo': Users,
  'Gamificación': Gamepad2,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-0 relative">
        {/* Header */}
        <div className="flex items-center gap-4 px-8 pt-8 pb-4 border-b border-gray-100">
          <div className="bg-violet-100 text-violet-600 rounded-xl p-3 flex items-center justify-center">
            <Sparkles size={28} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 leading-tight">Generar con IA</div>
            <div className="text-sm text-gray-400 font-medium mt-1">Planificación de Clase</div>
          </div>
          <button
            className="absolute top-5 right-6 text-gray-400 hover:text-gray-700 transition-colors text-2xl"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pt-6 pb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Metodologías Pedagógicas</h3>
          
          {loading && (
            <div className="text-center py-8 text-gray-500">Cargando metodologías...</div>
          )}
          
          {error && (
            <div className="text-center py-8 text-red-500">Error: {error}</div>
          )}
          
          {!loading && !error && (
            <div className="space-y-4 max-h-72 overflow-y-auto">
              {metodologias.map((metodologia) => {
                const Icon = metodologiaIcons[metodologia.nombre_metodologia] || BookOpen;
                const isActive = selected === metodologia.id;
                
                return (
                  <div
                    key={metodologia.id}
                    className={`border rounded-xl p-5 flex flex-row gap-4 items-start cursor-pointer transition-all duration-200 bg-white ${
                      isActive ? 'border-violet-400 shadow-md' : 'border-gray-200 hover:border-violet-200'
                    } ${isActive ? 'ring-2 ring-violet-100' : ''}`}
                    onClick={() => handleMetodologiaSelect(metodologia.id)}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-violet-50 text-violet-600 mt-1">
                      <Icon size={28} />
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
        <div className="flex justify-end gap-2 px-8 py-5 border-t border-gray-100 bg-white rounded-b-2xl">
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