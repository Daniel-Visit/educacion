import { Listbox } from '@headlessui/react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OA {
  id: number;
  oas_id: string;
  descripcion_oas: string;
  eje_id: number;
  eje_descripcion: string;
  nivel_id: number;
  asignatura_id: number;
  nivel: { nombre: string };
  asignatura: { nombre: string };
  basal?: boolean;
  tipo_eje: 'Contenido' | 'Habilidad' | 'Actitud';
}

interface Eje {
  id: number;
  descripcion: string;
}

interface MatrizOASelectorProps {
  // OAs y ejes disponibles
  oasContenido: OA[];
  oasHabilidad: OA[];
  ejesContenido: Eje[];
  ejesHabilidad: Eje[];

  // Estados seleccionados
  selectedEjeContenido: number | null;
  onEjeContenidoChange: (ejeId: number | null) => void;
  selectedEjeHabilidad: number | null;
  onEjeHabilidadChange: (ejeId: number | null) => void;
  selectedOAsContenido: OA[];
  onOAsContenidoChange: (oas: OA[]) => void;
  selectedOAsHabilidad: OA[];
  onOAsHabilidadChange: (oas: OA[]) => void;

  // OAs filtrados por eje
  oasDelEjeContenido: OA[];
  oasDelEjeHabilidad: OA[];

  // Información de contexto
  selectedAsignatura: number | null;
  selectedNivel: number | null;
  asignaturas: { id: number; nombre: string }[];
  niveles: { id: number; nombre: string }[];

  // Navegación
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;

  // Importación (opcional para modo edición)
  onImportClick?: () => void;

  // Nuevas props para modo edición
  mode?: 'create' | 'edit';
}

export default function MatrizOASelector({
  oasContenido,
  oasHabilidad,
  ejesContenido,
  ejesHabilidad,
  selectedEjeContenido,
  onEjeContenidoChange,
  selectedEjeHabilidad,
  onEjeHabilidadChange,
  selectedOAsContenido,
  onOAsContenidoChange,
  selectedOAsHabilidad,
  onOAsHabilidadChange,
  oasDelEjeContenido,
  oasDelEjeHabilidad,
  selectedAsignatura,
  selectedNivel,
  asignaturas,
  niveles,
  onBack,
  onNext,
  canProceed,
  onImportClick,
  mode = 'create',
}: MatrizOASelectorProps) {
  const isEditMode = mode === 'edit';

  // Verificar si hay OAs disponibles (solo en modo creación)
  if (!isEditMode && oasContenido.length === 0 && oasHabilidad.length === 0) {
    return (
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-3xl p-8 shadow-lg">
        <div className="text-center">
          {/* Icono decorativo */}
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>

          {/* Título principal */}
          <h3 className="text-2xl font-bold text-amber-800 mb-3">
            No hay OAs disponibles
          </h3>

          {/* Descripción */}
          <div className="max-w-md mx-auto space-y-3">
            <p className="text-amber-700 text-base leading-relaxed">
              No se encontraron Objetivos de Aprendizaje (contenido o habilidad)
              para la combinación de&nbsp;
              <span className="font-semibold text-amber-800">
                {asignaturas.find(a => a.id === selectedAsignatura)?.nombre}
              </span>
              &nbsp;y&nbsp;
              <span className="font-semibold text-amber-800">
                {niveles.find(n => n.id === selectedNivel)?.nombre}
              </span>
              .
            </p>
            <p className="text-amber-600 text-sm">
              Esto puede deberse a que aún no se han definido OAs para esta
              combinación específica.
            </p>
          </div>

          {/* Línea decorativa */}
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto my-6"></div>

          {/* Botón de acción */}
          <div className="flex justify-center">
            <button
              onClick={onBack}
              className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Volver al Paso 1
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-white/50 rounded-2xl border border-amber-100">
            <p className="text-amber-600 text-xs font-medium">
              💡 Tip: Prueba con otras asignaturas como &ldquo;Lenguaje y
              Comunicación&rdquo; o &ldquo;Matemática&rdquo; que suelen tener
              más OAs disponibles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Botón de importación (solo en modo creación) */}
      {!isEditMode && onImportClick && (
        <div className="flex justify-end">
          <button
            onClick={onImportClick}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Importar CSV
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Fila 1: Eje de Contenido + OAs de Contenido */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative mt-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eje de Contenido
              </label>
              <Select
                value={selectedEjeContenido?.toString() || 'none'}
                onValueChange={value =>
                  onEjeContenidoChange(
                    value === 'none' ? null : parseInt(value)
                  )
                }
              >
                <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Selecciona un eje de contenido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    Selecciona un eje de contenido
                  </SelectItem>
                  {ejesContenido.map(eje => (
                    <SelectItem key={eje.id} value={eje.id.toString()}>
                      {eje.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1">
            <Listbox
              value={selectedOAsContenido}
              onChange={onOAsContenidoChange}
              multiple
            >
              <div className="relative mt-1">
                <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
                  OAs de Contenido
                </Listbox.Label>
                <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2.25 pl-3 pr-8 text-left border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <span className="block truncate">
                    {selectedOAsContenido.length === 0
                      ? 'Selecciona OAs de contenido'
                      : `${selectedOAsContenido.length} OAs de contenido seleccionados`}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronsUpDown
                      className="h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                {selectedOAsContenido.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedOAsContenido.map(oa => (
                      <span
                        key={oa.id}
                        className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {oa.oas_id}
                        <button
                          type="button"
                          onClick={() =>
                            onOAsContenidoChange(
                              selectedOAsContenido.filter(o => o.id !== oa.id)
                            )
                          }
                          className="ml-1 text-blue-400 hover:text-blue-700 focus:outline-none"
                          aria-label={`Eliminar ${oa.oas_id}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                    {oasDelEjeContenido.map(oa => (
                      <Listbox.Option
                        key={oa.id}
                        value={oa}
                        className={({ active }) =>
                          `relative cursor-default text-sm select-none mx-1 my-1 rounded-sm py-2 pl-10 pr-4 ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-900'}`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate`}>
                              {oa.oas_id} -{' '}
                              {oa.descripcion_oas.substring(0, 50)}...
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-900">
                                <Check className="h-4 w-4" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </div>
            </Listbox>
          </div>
        </div>

        {/* Fila 2: Eje de Habilidad + OAs de Habilidad (solo si existen) */}
        {ejesHabilidad.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative mt-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eje de Habilidad
                </label>
                <Select
                  value={selectedEjeHabilidad?.toString() || 'none'}
                  onValueChange={value =>
                    onEjeHabilidadChange(
                      value === 'none' ? null : parseInt(value)
                    )
                  }
                >
                  <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Selecciona un eje de habilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Selecciona un eje de habilidad
                    </SelectItem>
                    {ejesHabilidad.map(eje => (
                      <SelectItem key={eje.id} value={eje.id.toString()}>
                        {eje.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-1">
              <Listbox
                value={selectedOAsHabilidad}
                onChange={onOAsHabilidadChange}
                multiple
              >
                <div className="relative mt-1">
                  <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
                    OAs de Habilidad
                  </Listbox.Label>
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2.25 pl-3 pr-8 text-left border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="block truncate">
                      {selectedOAsHabilidad.length === 0
                        ? 'Selecciona OAs de habilidad'
                        : `${selectedOAsHabilidad.length} OAs de habilidad seleccionados`}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronsUpDown
                        className="h-4 w-4 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  {selectedOAsHabilidad.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedOAsHabilidad.map(oa => (
                        <span
                          key={oa.id}
                          className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                        >
                          {oa.oas_id}
                          <button
                            type="button"
                            onClick={() =>
                              onOAsHabilidadChange(
                                selectedOAsHabilidad.filter(o => o.id !== oa.id)
                              )
                            }
                            className="ml-1 text-green-400 hover:text-green-700 focus:outline-none"
                            aria-label={`Eliminar ${oa.oas_id}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full text-sm overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                      {oasDelEjeHabilidad.map(oa => (
                        <Listbox.Option
                          key={oa.id}
                          value={oa}
                          className={({ active }) =>
                            `relative cursor-default select-none mx-1 my-1 rounded-sm py-2 pl-10 pr-4 ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-900'}`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate`}>
                                {oa.oas_id} -{' '}
                                {oa.descripcion_oas.substring(0, 50)}...
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-900">
                                  <Check
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </div>
              </Listbox>
            </div>
          </div>
        )}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between gap-4 mt-6">
        <Button variant="outlineGray" size="outlineGrayLg" onClick={onBack}>
          Anterior
        </Button>
        <Button
          variant="gradient"
          size="gradientLg"
          onClick={onNext}
          disabled={!canProceed}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
