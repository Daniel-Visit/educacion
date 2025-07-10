import { Clock } from "lucide-react";
import { OA, OAClases } from "./types";

interface OACardProps {
  oa: OA;
  oaClases: OAClases;
  onAddClase: (oa: OA, prevOA: OA | null) => void;
  onRemoveClase: (oa: OA, nextOA: OA | null) => void;
  prevOA: OA | null;
  nextOA: OA | null;
}

export default function OACard({
  oa,
  oaClases,
  onAddClase,
  onRemoveClase,
  prevOA,
  nextOA,
}: OACardProps) {
  const prevOk = !prevOA || (oaClases[prevOA.id] || 0) >= prevOA.minimo_clases;
  const nextHasClases = nextOA && (oaClases[nextOA.id] || 0) > 0;
  const currentClases = oaClases[oa.id] || 0;

  return (
    <div
      className={`group flex items-center justify-between rounded-3xl border transition-all px-8 py-6 shadow-sm bg-white hover:shadow-lg ${
        currentClases > 0 ? "border-violet-300" : "border-gray-200"
      }`}
      style={{ minHeight: 90 }}
    >
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-extrabold text-indigo-700 text-lg tracking-wide whitespace-nowrap">
            {oa.oas_id}
          </span>
          {oa.basal && (
            <span className="px-2 py-0.5 rounded-xl bg-indigo-100 text-indigo-600 text-xs font-semibold">
              Basal
            </span>
          )}
          <span className="flex items-center gap-1 text-gray-400 text-sm ml-2">
            <Clock size={15} /> Min: {oa.minimo_clases}
          </span>
        </div>
        <div
          className="text-gray-700 text-base truncate max-w-[400px] group-hover:text-indigo-900 transition-colors"
          title={oa.descripcion_oas}
        >
          {oa.descripcion_oas}
        </div>
      </div>
      <div className="flex items-center gap-3 ml-6">
        <button
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all shadow ${
            prevOk
              ? "bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600"
              : "bg-gray-200 cursor-not-allowed"
          }`}
          onClick={() => onAddClase(oa, prevOA)}
          disabled={!prevOk}
          tabIndex={0}
        >
          +
        </button>
        <span className="w-10 text-center font-extrabold text-2xl text-gray-700 select-none">
          {currentClases}
        </span>
        <button
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all shadow ${
            currentClases > 0 && !nextHasClases
              ? "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              : "bg-gray-200 cursor-not-allowed"
          }`}
          onClick={() => onRemoveClase(oa, nextOA)}
          disabled={currentClases === 0 || !!nextHasClases}
          tabIndex={0}
        >
          -
        </button>
      </div>
    </div>
  );
} 