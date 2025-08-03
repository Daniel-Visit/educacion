import { Clock, Plus, Minus } from 'lucide-react';
import OACard from './OACard';
import { OA, Eje, OAClases } from './types';

interface EjeSectionProps {
  eje: Eje;
  ejeIdx: number;
  oaClases: OAClases;
  skippedOAs: Set<number>;
  onAddClase: (oa: OA, prevOA: OA | null) => void;
  onRemoveClase: (oa: OA, nextOA: OA | null) => void;
  onActivateSkippedOA: (oa: OA, eje: Eje) => void;
  onDeactivateSkippedOA: (oa: OA) => void;
}

export default function EjeSection({
  eje,
  ejeIdx,
  oaClases,
  skippedOAs,
  onAddClase,
  onRemoveClase,
  onActivateSkippedOA,
  onDeactivateSkippedOA,
}: EjeSectionProps) {
  // Encontrar el siguiente OA que se puede activar (saltando la lógica)
  const getNextActivatableOA = () => {
    for (let i = 0; i < eje.oas.length; i++) {
      const oa = eje.oas[i];
      const prevOA = i > 0 ? eje.oas[i - 1] : null;

      // Si el OA ya está habilitado, continuar al siguiente
      if (skippedOAs.has(oa.id)) continue;

      // Si es el primer OA o el OA anterior cumple su mínimo, no necesita ser saltado
      if (!prevOA || (oaClases[prevOA.id] || 0) >= prevOA.minimo_clases)
        continue;

      // Si es del eje actitud, no necesita ser saltado
      if (oa.eje_descripcion.toLowerCase() === 'actitud') continue;

      return oa;
    }
    return null;
  };

  // Encontrar el último OA saltado que se puede desactivar
  const getLastSkippedOA = () => {
    for (let i = eje.oas.length - 1; i >= 0; i--) {
      const oa = eje.oas[i];
      // Solo desactivar OA que fueron habilitados y no tienen clases asignadas
      if (skippedOAs.has(oa.id) && (oaClases[oa.id] || 0) === 0) {
        return oa;
      }
    }
    return null;
  };

  const nextOA = getNextActivatableOA();
  const lastSkippedOA = getLastSkippedOA();

  return (
    <div className={ejeIdx > 0 ? 'mt-0' : ''}>
      <div className="flex items-center gap-4 mb-6">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-violet-100 text-violet-600 text-xl">
          <Clock size={28} />
        </span>
        <span className="font-extrabold text-2xl text-violet-700 tracking-tight">
          {eje.descripcion}
        </span>
        {eje.descripcion.toLowerCase() !== 'actitud' && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              className={`flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg border-2 transition ${
                nextOA
                  ? 'border-gray-200 bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] hover:bg-gray-50 cursor-pointer'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
              }`}
              title={nextOA ? 'Activar OA' : 'No hay OA para activar'}
              onClick={() => nextOA && onActivateSkippedOA(nextOA, eje)}
              disabled={!nextOA}
            >
              <Plus size={16} />
            </button>
            <button
              className={`flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg border-2 transition ${
                lastSkippedOA
                  ? 'border-gray-200 bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] hover:bg-gray-50 cursor-pointer'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
              }`}
              title={
                lastSkippedOA
                  ? 'Desactivar OA'
                  : 'No hay OA saltados para desactivar'
              }
              onClick={() =>
                lastSkippedOA && onDeactivateSkippedOA(lastSkippedOA)
              }
              disabled={!lastSkippedOA}
            >
              <Minus size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-6">
        {eje.oas.map((oa: OA, idx: number) => {
          const prevOA = idx > 0 ? eje.oas[idx - 1] : null;
          const nextOA = idx < eje.oas.length - 1 ? eje.oas[idx + 1] : null;

          return (
            <OACard
              key={oa.id}
              oa={oa}
              oaClases={oaClases}
              skippedOAs={skippedOAs}
              onAddClase={onAddClase}
              onRemoveClase={onRemoveClase}
              prevOA={prevOA}
              nextOA={nextOA}
            />
          );
        })}
      </div>
    </div>
  );
}
