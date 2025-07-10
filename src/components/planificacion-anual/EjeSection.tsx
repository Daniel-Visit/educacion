import { Clock } from "lucide-react";
import OACard from "./OACard";
import { OA, Eje, OAClases } from "./types";

interface EjeSectionProps {
  eje: Eje;
  ejeIdx: number;
  oaClases: OAClases;
  onAddClase: (oa: OA, prevOA: OA | null) => void;
  onRemoveClase: (oa: OA, nextOA: OA | null) => void;
}

export default function EjeSection({
  eje,
  ejeIdx,
  oaClases,
  onAddClase,
  onRemoveClase,
}: EjeSectionProps) {
  return (
    <div className={ejeIdx > 0 ? "mt-0" : ""}>
      <div className="flex items-center gap-4 mb-6">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 text-xl">
          <Clock size={28} />
        </span>
        <span className="font-extrabold text-2xl text-violet-700 tracking-tight">
          {eje.descripcion}
        </span>
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