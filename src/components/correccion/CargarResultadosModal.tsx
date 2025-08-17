'use client';

import { useState } from 'react';
import { Upload, Download, Info, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState, ModalHeader, SuccessState } from '@/components/resultados';

// Interfaces para tipar los datos del CSV
interface CSVRowData {
  [key: string]: string;
}

interface CargarResultadosModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluacionId?: number;
  evaluacionNombre?: string;
  onResultadosCargados: () => void;
}

export default function CargarResultadosModal({
  isOpen,
  onClose,
  evaluacionId,
  evaluacionNombre,
  onResultadosCargados,
}: CargarResultadosModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<CSVRowData[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);

      // Preview del archivo
      const reader = new FileReader();
      reader.onload = event => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());

        if (lines.length === 0) return;

        // Detectar separador automáticamente
        const firstLine = lines[0];
        const separator = firstLine.includes(';') ? ';' : ',';
        const headers = firstLine.split(separator).map(h => h.trim());

        const previewData = lines
          .slice(1, 6)
          .map(line => {
            const values = line.split(separator).map(v => v.trim());
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index] || '';
              return obj;
            }, {} as CSVRowData);
          })
          .filter(row => Object.values(row).some(val => val !== ''));

        setPreview(previewData);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !evaluacionId) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('evaluacionId', evaluacionId.toString());

    try {
      const response = await fetch('/api/evaluaciones/resultados', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccess(true);
        setFile(null);
        setPreview([]);
        setTimeout(() => {
          onResultadosCargados();
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al cargar los resultados');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Limpiar todo el estado al cerrar
    setFile(null);
    setError(null);
    setSuccess(false);
    setPreview([]);
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent =
      'rut,pregunta_id,alternativa_dada\n2-1752861555116,1,A\n7-1752861555131,1,B\n2-1752861555116,2,C\n';
    const filename = 'template_resultados.csv';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <ModalHeader
          title="Cargar Resultados"
          subtitle={evaluacionNombre}
          icon={<Upload className="h-6 w-6 text-white" />}
          onClose={handleClose}
          gradient="from-indigo-600 to-purple-600"
        />

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Información del formato */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <Info className="h-6 w-6 text-blue-600" />
                Formato del Archivo CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800">
                  Formato Requerido:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • <strong>rut:</strong> RUT del alumno (debe existir en la
                    base de datos)
                  </li>
                  <li>
                    • <strong>pregunta_id:</strong> ID de la pregunta
                  </li>
                  <li>
                    • <strong>alternativa_dada:</strong> Alternativa marcada (A,
                    B, C, D)
                  </li>
                </ul>
                <div className="bg-white p-3 rounded-lg border border-blue-200 text-xs font-mono text-blue-800">
                  rut,pregunta_id,alternativa_dada
                  <br />
                  2-1752861555116,1,A
                  <br />
                  7-1752861555131,1,B
                  <br />
                  2-1752861555116,2,C
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Importante:</strong> Todos los alumnos deben estar
                    registrados previamente en la base de datos. El sistema
                    validará que cada RUT exista antes de procesar los
                    resultados.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  size="sm"
                  className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Plantilla
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Área de carga */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors min-h-[120px] flex items-center justify-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() =>
                (
                  document.querySelector(
                    'input[type="file"]'
                  ) as HTMLInputElement
                )?.click()
              }
              className="w-full text-indigo-400 hover:text-indigo-700 font-medium"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-indigo-500 hover:text-indigo-600 transition-colors" />
              {file ? (
                <div className="flex flex-col items-center space-y-1">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                    {file.name}
                  </span>
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent text-sm">
                    Haz clic para cambiar archivo
                  </span>
                </div>
              ) : (
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  Haz clic para seleccionar archivo CSV
                </span>
              )}
            </button>
          </div>

          {/* Preview de datos */}
          {preview.length > 0 && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 rounded-t-xl pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-900 text-base">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Vista Previa de Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <tr>
                        {Object.keys(preview[0] || {}).map(header => (
                          <th
                            key={header}
                            className="text-left p-2 font-semibold text-purple-900"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr
                          key={index}
                          className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'}`}
                        >
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="p-2 text-gray-700">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100">
                  <p className="text-xs text-purple-700">
                    Mostrando las primeras {preview.length} filas del archivo
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mensajes de error/éxito */}
          {error && (
            <>
              {console.log('Error renderizando:', error)}
              <ErrorState message={error} />
            </>
          )}

          {success && (
            <SuccessState message="¡Resultados cargados exitosamente!" />
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium text-sm px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Cargando...
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3 mr-2" />
                  Cargar Resultados
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
