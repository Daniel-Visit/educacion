'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingState, ErrorState, ModalHeader, SuccessState } from '@/components/resultados';
import { 
  Upload, 
  CloudUpload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  Download,
  Info,
  BarChart3,
  BookOpen,
  Target,
  ArrowLeft
} from 'lucide-react';

interface ImportarMatrizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatrizImportada: (data: any) => void;
  asignaturaId: number | null;
  nivelId: number | null;
}

export default function ImportarMatrizModal({
  isOpen,
  onClose,
  onMatrizImportada,
  asignaturaId,
  nivelId
}: ImportarMatrizModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
      
      // Preview del archivo
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) return;
        
        // Detectar separador automáticamente
        const firstLine = lines[0];
        const separator = firstLine.includes(';') ? ';' : ',';
        const headers = firstLine.split(separator).map(h => h.trim());
        
        const previewData = lines.slice(1, 6).map(line => {
          const values = line.split(separator).map(v => {
            const trimmed = v.trim();
            // Remover comillas dobles del inicio y final si existen
            return trimmed.replace(/^"|"$/g, '');
          });
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {} as any);
        }).filter(row => Object.values(row).some(val => val !== ''));
        
        setPreview(previewData);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !asignaturaId || !nivelId) return;

    setIsLoading(true);
    setError(null);

    // Leer el contenido del archivo
    const fileText = await file.text();
    
    // Crear una nueva instancia del archivo para enviar
    const newFile = new File([fileText], file.name, { type: file.type });

    const formData = new FormData();
    formData.append('file', newFile);
    formData.append('asignaturaId', asignaturaId.toString());
    formData.append('nivelId', nivelId.toString());

    try {
      const response = await fetch('/api/matrices/import-csv', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(true);
        setFile(null);
        setPreview([]);
        
        // Llamar a la función callback con los datos importados
        onMatrizImportada(data);
        
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al importar los OAs');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `oa_identificador,tipo_oa,indicador,preguntas_por_indicador
"OA 01","Contenido","Leer textos significativos que incluyan palabras con hiatos",10
"OA 01","Contenido","Comprender textos aplicando estrategias de comprensión",5`;
    
    const filename = 'template_matriz_ejemplo.csv';
    
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
          title="Importar Matriz desde CSV"
          subtitle="Carga una matriz completa con OAs, indicadores y preguntas desde un archivo CSV"
          icon={<CloudUpload className="h-6 w-6 text-white" />}
          onClose={onClose}
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
                <h4 className="font-semibold text-blue-800">Formato para importar OAs:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>oa_identificador:</strong> Identificador del OA (ej: "OA 01", "OAH A")</li>
                  <li>• <strong>tipo_oa:</strong> "Contenido" o "Habilidad"</li>
                  <li>• <strong>indicador:</strong> Descripción del indicador</li>
                  <li>• <strong>preguntas_por_indicador:</strong> Preguntas para este indicador</li>
                </ul>
                
                <div className="bg-white p-3 rounded-lg border border-blue-200 text-xs font-mono text-blue-800">
                  oa_identificador,tipo_oa,indicador,preguntas_por_indicador<br/>
                  "OA 01","Contenido","Leer textos significativos que incluyan palabras con hiatos",10<br/>
                  "OA 01","Contenido","Comprender textos aplicando estrategias de comprensión",5
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h5 className="font-medium text-green-800 mb-2">Validaciones automáticas:</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Todos los campos son obligatorios en cada fila</li>
                    <li>• Todos los OAs deben pertenecer a la asignatura/nivel seleccionados</li>
                    <li>• Cada indicador debe ir en una fila separada</li>
                    <li>• Puedes importar OAs parcialmente y completar el resto en el paso 3</li>
                  </ul>
                </div>
                

              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={downloadTemplate}
                  variant="outline"
                  size="sm"
                  className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-800"
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
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-indigo-400 hover:text-indigo-700 font-medium"
            >
              <CloudUpload className="w-8 h-8 mx-auto mb-2 text-indigo-500 hover:text-indigo-600 transition-colors" />
              {file ? (
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-gray-700 font-medium">{file.name}</span>
                  <span className="text-gray-500 text-sm">Haz clic para cambiar archivo</span>
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
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-t-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-purple-900">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  Vista Previa de Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <tr>
                        {Object.keys(preview[0] || {}).map((header) => (
                          <th key={header} className="text-left p-4 font-semibold text-purple-900">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'}`}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="p-4 text-gray-700">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100">
                  <p className="text-sm text-purple-700">
                    Mostrando las primeras {preview.length} filas del archivo
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mensajes de error/éxito */}
          {error && (
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 border-2 border-dashed border-red-200">
                  <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-red-900 mb-2">Error</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setError(null)}
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 hover:text-red-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                </div>
              </div>
            </div>
          )}

          {success && (
            <SuccessState message="¡OAs importados exitosamente! Redirigiendo al paso 3..." />
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importando...
                </>
              ) : (
                <>
                  <CloudUpload className="h-4 w-4 mr-2" />
                  Importar y Continuar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 