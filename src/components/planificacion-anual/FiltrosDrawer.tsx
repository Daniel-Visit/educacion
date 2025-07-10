import Dropdown from "@/components/entrevista/Dropdown";
import { Switch } from "@headlessui/react";

interface FiltrosDrawerProps {
  selectedEjeId: string;
  setSelectedEjeId: (value: string) => void;
  showOnlyAssignable: boolean;
  setShowOnlyAssignable: (value: boolean) => void;
  ejeOptions: { value: string; label: string }[];
}

export default function FiltrosDrawer({
  selectedEjeId,
  setSelectedEjeId,
  showOnlyAssignable,
  setShowOnlyAssignable,
  ejeOptions,
}: FiltrosDrawerProps) {
  return (
    <div className="flex items-center gap-6 mb-8">
      {/* Dropdown de ejes */}
      <div className="w-64">
        <Dropdown
          value={selectedEjeId}
          onChange={setSelectedEjeId}
          options={ejeOptions}
          placeholder="Filtrar por eje"
        />
      </div>
      {/* Switch OA asignables */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">
          Solo OA asignables
        </span>
        <Switch
          checked={showOnlyAssignable}
          onChange={setShowOnlyAssignable}
          className="group relative flex h-7 w-14 cursor-pointer rounded-full bg-indigo-500/10 p-1 ease-in-out focus:not-data-focus:outline-none data-checked:bg-gradient-to-r data-checked:from-indigo-600 data-checked:to-purple-500 data-focus:outline data-focus:outline-white"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out group-data-checked:translate-x-7"
          />
        </Switch>
      </div>
    </div>
  );
} 