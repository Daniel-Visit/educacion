import FiltrosDrawer from "./FiltrosDrawer";
import EjeSection from "./EjeSection";
import { OA, Eje, OAClases } from "./types";

interface OADrawerContentProps {
  loadingOAs: boolean;
  ejesFiltrados: Eje[];
  selectedEjeId: string;
  setSelectedEjeId: (value: string) => void;
  showOnlyAssignable: boolean;
  setShowOnlyAssignable: (value: boolean) => void;
  ejeOptions: { value: string; label: string }[];
  oaClases: OAClases;
  onAddClase: (oa: OA, prevOA: OA | null) => void;
  onRemoveClase: (oa: OA, nextOA: OA | null) => void;
}

export default function OADrawerContent({
  loadingOAs,
  ejesFiltrados,
  selectedEjeId,
  setSelectedEjeId,
  showOnlyAssignable,
  setShowOnlyAssignable,
  ejeOptions,
  oaClases,
  onAddClase,
  onRemoveClase,
}: OADrawerContentProps) {
  return (
    <div className="p-8">
      <FiltrosDrawer
        selectedEjeId={selectedEjeId}
        setSelectedEjeId={setSelectedEjeId}
        showOnlyAssignable={showOnlyAssignable}
        setShowOnlyAssignable={setShowOnlyAssignable}
        ejeOptions={ejeOptions}
      />
      {loadingOAs ? (
        <div className="text-center py-8 text-gray-400">
          Cargando OAs...
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {ejesFiltrados.map((eje: Eje, ejeIdx: number) => (
            <EjeSection
              key={eje.id}
              eje={eje}
              ejeIdx={ejeIdx}
              oaClases={oaClases}
              onAddClase={onAddClase}
              onRemoveClase={onRemoveClase}
            />
          ))}
        </div>
      )}
    </div>
  );
} 