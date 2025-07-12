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
import { CloudUpload, Save } from "lucide-react";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function PlanificacionAnualPage() {
  const [oaDrawerOpen, setOaDrawerOpen] = useState(false);
  const [horarioId, setHorarioId] = useState<string>("");
  const [showHorarioMsg, setShowHorarioMsg] = useState(false);
  const [bloquearDropdown, setBloquearDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [planificacionNombre, setPlanificacionNombre] = useState("");
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const initialHorarioId = useRef<string | null>(null);
  const { horarios, loadHorarios } = useHorarios();
  const searchParams = useSearchParams();

  // Obtener planificacionId de la URL
  const planificacionId = searchParams.get("planificacionId");

  // Cargar horarios solo una vez al montar
  useEffect(() => {
    loadHorarios();
  }, [loadHorarios]);

  // Preseleccionar horario si viene en la URL o si se carga una planificación existente
  useEffect(() => {
    const idFromUrl = searchParams.get("horarioId");
    if (idFromUrl && horarios.some((h) => h.id.toString() === idFromUrl)) {
      setHorarioId(idFromUrl);
      setBloquearDropdown(true);
      initialHorarioId.current = idFromUrl;
    }
  }, [searchParams, horarios]);



  const horarioSeleccionado = horarios.find(
    (h) => h.id.toString() === horarioId
  );

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
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setShowImportModal(false);
      // TODO: Recargar eventos después de la importación
    } catch (error) {
      console.error("Error al importar:", error);
    } finally {
      setImporting(false);
    }
  };

  const handleGuardarPlanificacion = async () => {
    if (!horarioSeleccionado || !planificacionNombre.trim()) return;

    setSaving(true);
    try {
      if (planificacionActual) {
        await actualizarPlanificacion(planificacionNombre);
      } else {
        await guardarPlanificacion(planificacionNombre, horarioId);
      }
      setShowSaveModal(false);
      setPlanificacionNombre("");
    } catch (error) {
      console.error("Error al guardar planificación:", error);
      alert("Error al guardar la planificación");
    } finally {
      setSaving(false);
    }
  };

  const {
    events,
    loadingOAs,
    loadingPlanificacion,
    showOnlyAssignable,
    setShowOnlyAssignable,
    selectedEjeId,
    setSelectedEjeId,
    ejeOptions,
    ejesFiltrados,
    oaClases,
    skippedOAs,
    planificacionActual,
    handleAddClase,
    handleRemoveClase,
    handleActivateSkippedOA,
    handleDeactivateSkippedOA,
    handleEventAdd,
    handleEventUpdate,
    handleEventDelete,
    guardarPlanificacion,
    actualizarPlanificacion,
  } = usePlanificacionAnual(horarioSeleccionado, planificacionId || undefined);

  // Preseleccionar horario cuando se carga una planificación existente
  useEffect(() => {
    if (planificacionActual?.horario?.id && horarios.length > 0) {
      const horarioIdFromPlanificacion = planificacionActual.horario.id.toString();
      if (horarios.some((h) => h.id.toString() === horarioIdFromPlanificacion)) {
        setHorarioId(horarioIdFromPlanificacion);
        setBloquearDropdown(true);
        initialHorarioId.current = horarioIdFromPlanificacion;
      }
    }
  }, [planificacionActual, horarios]);

  const horarioOptions = horarios.map((h) => ({
    value: h.id.toString(),
    label: `${h.nombre} (${h.asignatura?.nombre || "-"}, ${
      h.nivel?.nombre || "-"
    })`,
  }));

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-700 mb-1">
            Planificación Anual
          </h1>
          <p className="text-gray-500 text-base mb-2">
            Gestiona la planificación anual de clases
          </p>
          {planificacionActual && (
            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p className="text-indigo-800 text-sm">
                <strong>Editando:</strong> {planificacionActual.nombre}
                <span className="ml-2 text-indigo-600">
                  (Creada:{" "}
                  {new Date(planificacionActual.createdAt).toLocaleDateString()}
                  )
                </span>
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-row gap-3 w-full md:w-auto justify-end">
          {horarioSeleccionado && (
            <>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center justify-center gap-2 px-4 h-12 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:bg-gradient-to-r hover:from-green-700 hover:to-emerald-600 transition-colors min-w-[160px]"
                style={{ minHeight: "48px", height: "48px" }}
              >
                <CloudUpload className="w-4 h-4" />
                Importar CSV
              </button>
              {planificacionActual ? (
                <button
                  onClick={() => {
                    setPlanificacionNombre(planificacionActual.nombre);
                    setShowSaveModal(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 h-12 text-base font-medium bg-gradient-to-r  from-purple-600 to-pink-500 text-white rounded-lg hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-600 transition-colors min-w-[180px]"
                  style={{ minHeight: "48px", height: "48px" }}
                >
                  <Save className="w-4 h-4" />
                  Actualizar
                </button>
              ) : (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center justify-center gap-2 px-4 h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:bg-gradient-to-r hover:from-purple-700 hover:to-pink-600 transition-colors min-w-[180px]"
                  style={{ minHeight: "48px", height: "48px" }}
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <label
          className="text-base font-medium text-gray-700"
          htmlFor="horario-dropdown"
        >
          Selecciona un horario:
        </label>
        <div className="min-w-[300px] max-w-[450px]">
          <GlobalDropdown
            value={horarioId}
            onChange={handleHorarioChange}
            options={horarioOptions}
            placeholder="Selecciona un horario"
            disabled={bloquearDropdown}
            className="h-12"
          />
        </div>
      </div>
      {/* Modal de confirmación de selección de horario */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 ">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full min-w-[450px]">
            <h2 className="text-lg font-bold mb-2 text-gray-800">
              Confirmar selección de horario
            </h2>
            <p className="mb-6 text-gray-600">
              ¿Estás seguro de seleccionar este horario? <br />
              No podrás cambiarlo después.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelarSeleccion}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarSeleccion}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingPlanificacion && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Cargando planificación...
        </div>
      )}

      {showHorarioMsg && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          Selecciona un horario para poder asignar objetivos académicos y
          planificar clases.
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
      {/* Drawer Toggle */}
      <div style={{ position: 'relative', height: '0' }}>
        <div style={{ position: 'absolute', top: '-100px', left: 0 }}>
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
        </div>
      </div>

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

      {/* Modal de guardar/actualizar planificación */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {planificacionActual
                ? "Actualizar Planificación"
                : "Guardar Planificación"}
            </h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la planificación
              </label>
              <input
                type="text"
                value={planificacionNombre}
                onChange={(e) => setPlanificacionNombre(e.target.value)}
                placeholder="Ej: Planificación Matemáticas 2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setPlanificacionNombre("");
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                disabled={saving}
              >
                Cancelar
              </button>
              <PrimaryButton
                onClick={handleGuardarPlanificacion}
                disabled={!planificacionNombre.trim() || saving}
                >
                {saving
                  ? "Guardando..."
                  : planificacionActual
                  ? "Actualizar"
                  : "Guardar"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
