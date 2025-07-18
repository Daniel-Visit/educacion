'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  Download,
  Info,
  Users,
  BarChart3
} from 'lucide-react';

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
  onResultadosCargados
}: CargarResultadosModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

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
          const values = line.split(separator).map(v => v.trim());
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
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = (formato: 'estandar' | 'compacto') => {
    let csvContent, filename;
    
    if (formato === 'estandar') {
      csvContent = 'rut,nombre,apellido,pregunta_id,alternativa_dada\n12345678-9,Juan,Pérez,1,A\n98765432-1,María,González,1,B\n12345678-9,Juan,Pérez,2,C\n';
      filename = 'template_resultados_estandar.csv';
    } else {
      csvContent = 'ID;NOMBRE;RESPUESTA;PREGUNTA\n1;Juan Pérez;A;1\n2;María González;B;1\n1;Juan Pérez;C;2\n';
      filename = 'template_resultados_compacto.csv';
    }
    
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
        {/* Header fijo */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Cargar Resultados</h3>
                <p className="text-indigo-100">
                  {evaluacionNombre}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-800">Formato 1 - Estándar:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>rut:</strong> RUT del alumno (ej: 12345678-9)</li>
                    <li>• <strong>nombre:</strong> Nombre del alumno</li>
                    <li>• <strong>apellido:</strong> Apellido del alumno</li>
                    <li>• <strong>pregunta_id:</strong> ID de la pregunta</li>
                    <li>• <strong>alternativa_dada:</strong> Alternativa marcada (A, B, C, D)</li>
                  </ul>
                  <div className="bg-white p-3 rounded-lg border border-blue-200 text-xs font-mono text-blue-800">
                    rut,nombre,apellido,pregunta_id,alternativa_dada<br/>
                    12345678-9,Juan,Pérez,1,A<br/>
                    98765432-1,María,González,1,B<br/>
                    12345678-9,Juan,Pérez,2,C
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-800">Formato 2 - Compacto:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>ID:</strong> ID del alumno</li>
                    <li>• <strong>NOMBRE:</strong> Nombre completo del alumno</li>
                    <li>• <strong>RESPUESTA:</strong> Alternativa marcada (A, B, C, D)</li>
                    <li>• <strong>PREGUNTA:</strong> Número de la pregunta</li>
                  </ul>
                  <div className="bg-white p-3 rounded-lg border border-blue-200 text-xs font-mono text-blue-800">
                    ID;NOMBRE;RESPUESTA;PREGUNTA<br/>
                    1;Juan Pérez;A;1<br/>
                    2;María González;B;1<br/>
                    1;Juan Pérez;C;2
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => downloadTemplate('estandar')}
                  variant="outline"
                  size="sm"
                  className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Plantilla Estándar
                </Button>
                <Button 
                  onClick={() => downloadTemplate('compacto')}
                  variant="outline"
                  size="sm"
                  className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Plantilla Compacta
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Área de carga */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-t-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-indigo-900">
                <FileText className="h-6 w-6 text-indigo-600" />
                Seleccionar Archivo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                  <Upload className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-indigo-900">
                      {file ? file.name : 'Arrastra tu archivo CSV aquí'}
                    </p>
                    <p className="text-indigo-600">
                      o haz clic para seleccionar
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {file && (
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      <div>
                        <p className="font-semibold text-emerald-900">Archivo seleccionado</p>
                        <p className="text-sm text-emerald-700">
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                ¡Resultados cargados exitosamente!
              </AlertDescription>
            </Alert>
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
                  Cargando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
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