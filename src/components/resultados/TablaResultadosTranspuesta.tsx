'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { QuestionTooltip } from './QuestionTooltip';

interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
}

interface Respuesta {
  preguntaId: number;
  esCorrecta: boolean;
  alternativaDada?: string | null;
  tieneDatos: boolean;
}

interface EstudianteResultado {
  alumno: Alumno;
  respuestas: Respuesta[];
  porcentajeCorrectas: number;
}

interface Pregunta {
  id: number;
  numero: number;
  texto: string;
}

interface TablaResultadosTranspuestaProps {
  preguntas: Pregunta[];
  respuestasEstudiantes: EstudianteResultado[];
  porcentajePorPregunta: number[];
}

type SortField = 'numero' | 'porcentaje' | null;
type SortDirection = 'asc' | 'desc';

type ColumnSortField = 'nombre' | 'porcentajeEstudiante' | null;
type ColumnSortDirection = 'asc' | 'desc';

export function TablaResultadosTranspuesta({
  preguntas,
  respuestasEstudiantes,
  porcentajePorPregunta,
}: TablaResultadosTranspuestaProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [columnSortField, setColumnSortField] = useState<ColumnSortField>(null);
  const [columnSortDirection, setColumnSortDirection] =
    useState<ColumnSortDirection>('asc');

  const handleSort = (field: SortField) => {
    // Guardar la posición actual del scroll
    const scrollContainer = document.querySelector('.overflow-y-auto');
    const currentScrollTop = scrollContainer?.scrollTop || 0;

    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }

    // Restaurar la posición del scroll después del re-render
    setTimeout(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = currentScrollTop;
      }
    }, 0);
  };

  const handleColumnSort = (field: ColumnSortField) => {
    if (columnSortField === field) {
      setColumnSortDirection(columnSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setColumnSortField(field);
      setColumnSortDirection('asc');
    }
  };

  const sortedPreguntas = useMemo(() => {
    if (!sortField) return preguntas;

    return [...preguntas].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      if (sortField === 'numero') {
        aValue = a.numero;
        bValue = b.numero;
      } else if (sortField === 'porcentaje') {
        aValue = porcentajePorPregunta[a.numero - 1] || 0;
        bValue = porcentajePorPregunta[b.numero - 1] || 0;
      } else {
        return 0;
      }

      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [preguntas, sortField, sortDirection, porcentajePorPregunta]);

  const sortedEstudiantes = useMemo(() => {
    if (!columnSortField) return respuestasEstudiantes;

    return [...respuestasEstudiantes].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (columnSortField === 'nombre') {
        aValue = `${a.alumno.nombre} ${a.alumno.apellido}`.toLowerCase();
        bValue = `${b.alumno.nombre} ${b.alumno.apellido}`.toLowerCase();
      } else if (columnSortField === 'porcentajeEstudiante') {
        aValue = a.porcentajeCorrectas;
        bValue = b.porcentajeCorrectas;
      } else {
        return 0;
      }

      if (columnSortDirection === 'asc') {
        if (typeof aValue === 'string') {
          return aValue.localeCompare(bValue as string);
        }
        return (aValue as number) - (bValue as number);
      } else {
        if (typeof aValue === 'string') {
          return (bValue as string).localeCompare(aValue as string);
        }
        return (bValue as number) - (aValue as number);
      }
    });
  }, [respuestasEstudiantes, columnSortField, columnSortDirection]);

  if (preguntas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay preguntas disponibles para esta evaluación</p>
      </div>
    );
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-gray-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-gray-400" />
    );
  };

  const getColumnSortIcon = (field: ColumnSortField) => {
    if (columnSortField !== field)
      return <ArrowLeftRight className="h-3 w-3 text-gray-400" />;
    return columnSortDirection === 'asc' ? (
      <ArrowLeft className="h-3 w-3 text-gray-400" />
    ) : (
      <ArrowRight className="h-3 w-3 text-gray-400" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="max-h-[500px] overflow-y-auto overflow-visible">
        <table className="table-auto w-full text-sm">
          <thead className="sticky top-0 z-50">
            <tr className="border-b border-gray-200 bg-white">
              <th
                className="sticky left-0 bg-white border-r border-gray-200 z-20 align-bottom min-w-[120px] cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('numero')}
              >
                <div className="flex flex-col items-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                  <div
                    className="my-1 text-center text-[8px] text-gray-400 cursor-pointer hover:text-gray-600 flex items-center gap-1"
                    onClick={e => {
                      e.stopPropagation();
                      handleColumnSort('nombre');
                    }}
                  >
                    {getColumnSortIcon('nombre')}
                    Ordenar columnas
                  </div>
                  <div className="[writing-mode:vertical-lr] [text-orientation:mixed] rotate-180 whitespace-nowrap px-4 max-h-[200px] overflow-hidden text-ellipsis">
                    Número de pregunta
                  </div>
                  <div className="mt-2 mb-2 text-center text-[8px] text-gray-400 flex items-center gap-1">
                    {getSortIcon('numero')}
                    Ordenar filas
                  </div>
                </div>
              </th>
              {sortedEstudiantes.map(estudiante => (
                <th
                  key={estudiante.alumno.id}
                  className="bg-white relative p-0 z-10 align-bottom"
                >
                  <div className="flex justify-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    <div className="[writing-mode:vertical-lr] [text-orientation:mixed] rotate-180 whitespace-nowrap px-4 max-h-[200px] overflow-hidden text-ellipsis">
                      {estudiante.alumno.nombre} {estudiante.alumno.apellido}
                    </div>
                  </div>
                </th>
              ))}
              <th
                className="bg-white relative p-0 z-10 align-bottom border-l border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('porcentaje')}
              >
                <div className="flex flex-col items-center text-[10px] font-medium text-gray-500 uppercase tracking-wider relative z-10">
                  <div className="mb-1">{getSortIcon('porcentaje')}</div>
                  <div className="[writing-mode:vertical-lr] [text-orientation:mixed] rotate-180 whitespace-nowrap px-4">
                    % Aciertos
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPreguntas.map(pregunta => (
              <tr
                key={pregunta.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="sticky left-0 z-20 px-6 py-0 text-[10px] font-medium text-gray-900 border-r border-gray-200 bg-white">
                  <div className="text-center cursor-pointer relative group">
                    {pregunta.numero}
                    <QuestionTooltip
                      numero={pregunta.numero}
                      texto={pregunta.texto}
                    />
                  </div>
                </td>
                {sortedEstudiantes.map(estudiante => {
                  const respuesta = estudiante.respuestas.find(
                    r => r.preguntaId === pregunta.numero
                  );
                  return (
                    <td
                      key={estudiante.alumno.id}
                      className="px-1 py-1 text-center"
                    >
                      {respuesta && respuesta.tieneDatos ? (
                        respuesta.esCorrecta ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-semibold text-white bg-green-400 shadow-sm">
                            {respuesta.alternativaDada || '✓'}
                          </div>
                        ) : respuesta.alternativaDada ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-semibold text-white bg-rose-500 shadow-sm">
                            {respuesta.alternativaDada}
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-semibold text-white bg-gray-400 shadow-sm">
                            -
                          </div>
                        )
                      ) : (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-semibold text-gray-300 bg-gray-100 shadow-sm">
                          -
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-1 py-0 text-center border-l border-gray-200">
                  <div className="inline-flex items-center justify-center mx-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {Math.round(porcentajePorPregunta[pregunta.numero - 1])}
                  </div>
                </td>
              </tr>
            ))}
            {/* Fila de porcentajes por pregunta - SIEMPRE FIJA AL FINAL */}
            <tr className="border-t border-gray-300 bg-white">
              <td className="sticky left-0 z-20 bg-white px-4 py-3 text-[10px] text-center font-medium text-gray-900 border-r border-gray-200">
                <div className="flex flex-col items-center">
                  <div
                    className="mb-1 text-center text-[8px] text-gray-400 cursor-pointer hover:text-gray-600 flex items-center gap-1"
                    onClick={() => handleColumnSort('porcentajeEstudiante')}
                  >
                    {getColumnSortIcon('porcentajeEstudiante')}
                    Ordenar columnas por %
                  </div>
                  <span>% ACIERTOS</span>
                </div>
              </td>
              {sortedEstudiantes.map(estudiante => (
                <td
                  key={estudiante.alumno.id}
                  className="px-1 py-3 text-center"
                >
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {Math.round(estudiante.porcentajeCorrectas)}
                  </div>
                </td>
              ))}
              <td className="px-1 py-3 text-center">
                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {Math.round(
                    sortedEstudiantes.reduce(
                      (sum, estudiante) => sum + estudiante.porcentajeCorrectas,
                      0
                    ) / sortedEstudiantes.length
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
