'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { EventCalendar } from '@/components/event-calendar';
import '@/styles/calendar.css';
import Drawer from '@/components/ui/Drawer';
import DrawerToggle from '@/components/ui/DrawerToggle';
import OADrawerContent from '@/components/planificacion-anual/OADrawerContent';
import ImportarCSVModal from '@/components/planificacion-anual/ImportarCSVModal';
import { usePlanificacionAnual } from '@/hooks/use-planificacion-anual';
import { useHorarios } from '@/hooks/use-horarios';
import GlobalDropdown from '@/components/ui/GlobalDropdown';
import { useSearchParams } from 'next/navigation';
import { CloudUpload, Save, Calendar, FileText } from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import LoadingState from '@/components/ui/LoadingState';

function PlanificacionAnualContent() {
  const [oaDrawerOpen, setOaDrawerOpen] = useState(false);
  const [horarioId, setHorarioId] = useState<string>('');
  const [showHorarioMsg, setShowHorarioMsg] = useState(false);
  const [bloquearDropdown, setBloquearDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [planificacionNombre, setPlanificacionNombre] = useState('');
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const initialHorarioId = useRef<string | null>(null);
  const { horarios, loadHorarios, isLoading } = useHorarios();
  const searchParams = useSearchParams();

  // Obtener planificacionId de la URL
  const planificacionId = searchParams.get('planificacionId');

  // Cargar horarios solo una vez al montar
  useEffect(() => {
    loadHorarios();
  }, [loadHorarios]);

  // Preseleccionar horario si viene en la URL o si se carga una planificación existente
  useEffect(() => {
    const idFromUrl = searchParams.get('horarioId');
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

  const handleImportCSVLocal = async (oas: string[]) => {
    if (!horarioSeleccionado) return;

    setImporting(true);
    try {
      console.log('Importando OA:', oas);
      console.log('Horario seleccionado:', horarioSeleccionado);

      // Usar la función del hook para importar
      const resultado = await handleImportCSV(oas);

      console.log(
        `Importación completada: ${resultado.eventosCreados} eventos creados`
      );
      setShowImportModal(false);

      // Mostrar mensaje de éxito
      setNotification({
        type: 'success',
        message: `Importación completada exitosamente. ${resultado.eventosCreados} eventos creados.`,
      });
    } catch (error) {
      console.error('Error al importar:', error);
      setNotification({
        type: 'error',
        message:
          'Error al importar el CSV. Por favor, verifica el formato del archivo.',
      });
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
      setPlanificacionNombre('');
    } catch (error) {
      console.error('Error al guardar planificación:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar la planificación',
      });
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
    handleImportCSV,
  } = usePlanificacionAnual(horarioSeleccionado, planificacionId || undefined);

  // Preseleccionar horario cuando se carga una planificación existente
  useEffect(() => {
    if (planificacionActual?.horario?.id && horarios.length > 0) {
      const horarioIdFromPlanificacion =
        planificacionActual.horario.id.toString();
      if (horarios.some(h => h.id.toString() === horarioIdFromPlanificacion)) {
        setHorarioId(horarioIdFromPlanificacion);
        setBloquearDropdown(true);
        initialHorarioId.current = horarioIdFromPlanificacion;
      }
    }
  }, [planificacionActual, horarios]);

  const horarioOptions = horarios.map(h => ({
    value: h.id.toString(),
    label: `${h.nombre} (${h.asignatura?.nombre || '-'}, ${
      h.nivel?.nombre || '-'
    })`,
  }));

  // Loading state temprano siguiendo el patrón establecido
  if (isLoading) {
    return (
      <div>
        <LoadingState message="Cargando planificación..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header moderno */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Planificación Anual
              </h1>
              <p className="text-indigo-100 text-sm">
                Gestiona la planificación anual de clases
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          {horarioSeleccionado && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
              >
                <CloudUpload className="w-4 h-4" />
                Importar CSV
              </button>
              {planificacionActual ? (
                <button
                  onClick={() => {
                    setPlanificacionNombre(planificacionActual.nombre || '');
                    setShowSaveModal(true);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
                >
                  <Save className="w-4 h-4" />
                  Actualizar
                </button>
              ) : (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats y información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Horario Seleccionado</p>
                <p className="text-lg font-bold">
                  {horarioSeleccionado ? horarioSeleccionado.nombre : 'Ninguno'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Planificación</p>
                <p className="text-lg font-bold">
                  {planificacionActual
                    ? planificacionActual.nombre
                    : 'Sin guardar'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selección de horario */}
      <div className="mb-6">
        <label
          className="block text-sm font-medium text-gray-700 mb-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Confirmar Horario
                  </h2>
                  <p className="text-indigo-100 text-sm">
                    No podrás cambiarlo después
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que quieres seleccionar este horario? Esta
                acción no se puede deshacer.
              </p>

              {/* Botones */}
              <div className="flex gap-3">
                <SecondaryButton onClick={cancelarSeleccion} className="flex-1">
                  Cancelar
                </SecondaryButton>
                <PrimaryButton onClick={confirmarSeleccion} className="flex-1">
                  Confirmar
                </PrimaryButton>
              </div>
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
            title="Abrir Panel"
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
        onImport={handleImportCSVLocal}
        loading={importing}
      />

      {/* Modal de guardar/actualizar planificación */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {planificacionActual
                ? 'Actualizar Planificación'
                : 'Guardar Planificación'}
            </h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la planificación
              </label>
              <input
                type="text"
                value={planificacionNombre}
                onChange={e => setPlanificacionNombre(e.target.value)}
                placeholder="Ej: Planificación Matemáticas 2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setPlanificacionNombre('');
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
                  ? 'Guardando...'
                  : planificacionActual
                    ? 'Actualizar'
                    : 'Guardar'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="flex-shrink-0 text-white/80 hover:text-white"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanificacionAnualPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PlanificacionAnualContent />
    </Suspense>
  );
}
