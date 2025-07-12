"use client";
import { useState, useEffect, useRef } from "react";
import { EventCalendar } from "@/components/event-calendar";
import "@/styles/calendar.css";
import Drawer from "@/components/ui/Drawer";
import DrawerToggle from "@/components/ui/DrawerToggle";
import OADrawerContent from "@/components/planificacion-anual/OADrawerContent";
import ImportarCSVModal from "@/components/planificacion-anual/ImportarCSVModal";
import { usePlanificacionAnual } from "@/hooks/use-planificacion-anual";
import { useHorarios } from "@/hooks/use-horarios";
import GlobalDropdown from "@/components/ui/GlobalDropdown";
import { useSearchParams } from "next/navigation";
import { CloudUpload } from "lucide-react";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function PlanificacionAnualPage() {
  const [oaDrawerOpen, setOaDrawerOpen] = useState(false);
  const [horarioId, setHorarioId] = useState<string>("");
  const [showHorarioMsg, setShowHorarioMsg] = useState(false);
  const [bloquearDropdown, setBloquearDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const initialHorarioId = useRef<string | null>(null);
  const { horarios, loadHorarios } = useHorarios();
  const searchParams = useSearchParams();

  // Cargar horarios solo una vez al montar
  useEffect(() => {
    loadHorarios();
  }, [loadHorarios]);

  // Preseleccionar horario si viene en la URL, solo cuando los horarios ya están cargados
  useEffect(() => {
    const idFromUrl = searchParams.get("horarioId");
    if (idFromUrl && horarios.some(h => h.id.toString() === idFromUrl)) {
      setHorarioId(idFromUrl);
      setBloquearDropdown(true);
      initialHorarioId.current = idFromUrl;
    }
  }, [searchParams, horarios]);

  const horarioSeleccionado = horarios.find(h => h.id.toString() === horarioId);

  // Handler para seleccionar horario
  const handleHorarioChange = (v: string) => {
    if (!horarioId) {
      // Primera selección, mostrar confirmación
      initialHorarioId.current = v;
      setShowConfirmModal(true);
    }
  };

  const confirmarSeleccion = () => {
    setHorarioId(initialHorarioId.current!);
    setBloquearDropdown(true);
    setShowConfirmModal(false);
    setShowHorarioMsg(false);
  };

  const cancelarSeleccion = () => {
    setShowConfirmModal(false);
    initialHorarioId.current = null;
  };

  const handleImportCSV = async (oas: string[]) => {
    if (!horarioSeleccionado) return;
    
    setImporting(true);
    try {
      // TODO: Implementar lógica de importación
      console.log("Importando OA:", oas);
      console.log("Horario seleccionado:", horarioSeleccionado);
      
      // Simular proceso de importación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowImportModal(false);
      // TODO: Recargar eventos después de la importación
    } catch (error) {
      console.error("Error al importar:", error);
    } finally {
      setImporting(false);
    }
  };

  const {
    events,
    loadingOAs,
    showOnlyAssignable,
    setShowOnlyAssignable,
    selectedEjeId,
    setSelectedEjeId,
    ejeOptions,
    ejesFiltrados,
    oaClases,
    skippedOAs,
    handleAddClase,
    handleRemoveClase,
    handleActivateSkippedOA,
    handleDeactivateSkippedOA,
    handleEventAdd,
    handleEventUpdate,
    handleEventDelete,
  } = usePlanificacionAnual(horarioSeleccionado);

  const horarioOptions = horarios.map(h => ({
    value: h.id.toString(),
    label: `${h.nombre} (${h.asignatura?.nombre || "-"}, ${h.nivel?.nombre || "-"})`,
  }));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-indigo-700 mb-1">
            Planificación Anual
          </h1>
          <p className="text-gray-500 text-base mb-2">
            Gestiona la planificación anual de clases
          </p>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <label className="text-base font-medium text-gray-700">Selecciona un horario:</label>
          <div className="min-w-[450px] max-w-[450px]">
            <GlobalDropdown
              value={horarioId}
              onChange={handleHorarioChange}
              options={horarioOptions}
              placeholder="Selecciona un horario"
              disabled={bloquearDropdown}
            />
          </div>
        </div>
        
        {horarioSeleccionado && (
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:bg-gradient-to-r hover:from-green-700 hover:to-emerald-600 transition-colors font-medium"
          >
            <CloudUpload className="w-4 h-4" />
            Importar CSV
          </button>
        )}
      </div>
      {/* Modal de confirmación de selección de horario */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 ">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full min-w-[450px]">
            <h2 className="text-lg font-bold mb-2 text-gray-800">Confirmar selección de horario</h2>
            <p className="mb-6 text-gray-600">¿Estás seguro de seleccionar este horario? <br />No podrás cambiarlo después.</p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelarSeleccion} className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmarSeleccion} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Confirmar</button>
            </div>
          </div>
        </div>
      )}


      {showHorarioMsg && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          Selecciona un horario para poder asignar objetivos académicos y planificar clases.
        </div>
      )}
      <div className="calendar-root">
        <EventCalendar
          events={events}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      </div>
      <DrawerToggle
        isOpen={oaDrawerOpen}
        onClick={() => {
          if (!horarioSeleccionado) {
            setShowHorarioMsg(true);
            return;
          }
          setOaDrawerOpen(true);
        }}
        title="Objetivos de Aprendizaje"
      />
      <Drawer
        isOpen={oaDrawerOpen}
        onClose={() => setOaDrawerOpen(false)}
        width={600}
      >
        {horarioSeleccionado ? (
          <OADrawerContent
            loadingOAs={loadingOAs}
            ejesFiltrados={ejesFiltrados}
            selectedEjeId={selectedEjeId}
            setSelectedEjeId={setSelectedEjeId}
            showOnlyAssignable={showOnlyAssignable}
            setShowOnlyAssignable={setShowOnlyAssignable}
            ejeOptions={ejeOptions}
            oaClases={oaClases}
            skippedOAs={skippedOAs}
            onAddClase={handleAddClase}
            onRemoveClase={handleRemoveClase}
            onActivateSkippedOA={handleActivateSkippedOA}
            onDeactivateSkippedOA={handleDeactivateSkippedOA}
          />
        ) : (
          <div className="p-8 text-center text-gray-500 text-lg">
            Selecciona un horario para poder asignar objetivos académicos y
            planificar clases.
          </div>
        )}
      </Drawer>

      {/* Modal de importación CSV */}
      <ImportarCSVModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportCSV}
        loading={importing}
      />
    </div>
  );
}
