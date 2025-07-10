"use client";
import { useState } from "react";
import { EventCalendar } from "@/components/event-calendar";
import "@/styles/calendar.css";
import Drawer from "@/components/ui/Drawer";
import DrawerToggle from "@/components/ui/DrawerToggle";
import OADrawerContent from "@/components/planificacion-anual/OADrawerContent";
import { usePlanificacionAnual } from "@/hooks/use-planificacion-anual";

export default function PlanificacionAnualPage() {
  const [oaDrawerOpen, setOaDrawerOpen] = useState(false);
  
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
    handleAddClase,
    handleRemoveClase,
    handleEventAdd,
    handleEventUpdate,
    handleEventDelete,
  } = usePlanificacionAnual();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-indigo-700 mb-1">
            Planificación Anual
          </h1>
          <p className="text-gray-500 text-base mb-2">
            Gestiona la planificación anual de clases
          </p>
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
        onClick={() => setOaDrawerOpen(true)}
        title="Objetivos de Aprendizaje"
      />
      <Drawer
        isOpen={oaDrawerOpen}
        onClose={() => setOaDrawerOpen(false)}
        width={600}
      >
        <OADrawerContent
          loadingOAs={loadingOAs}
          ejesFiltrados={ejesFiltrados}
          selectedEjeId={selectedEjeId}
          setSelectedEjeId={setSelectedEjeId}
          showOnlyAssignable={showOnlyAssignable}
          setShowOnlyAssignable={setShowOnlyAssignable}
          ejeOptions={ejeOptions}
          oaClases={oaClases}
          onAddClase={handleAddClase}
          onRemoveClase={handleRemoveClase}
        />
      </Drawer>
    </div>
  );
}
