'use client';
import { useState, useRef } from 'react';

import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import { CloudUpload } from 'lucide-react';

interface ImportarCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (oas: string[]) => void;
  loading?: boolean;
}

export default function ImportarCSVModal({
  isOpen,
  onClose,
  onImport,
  loading = false,
}: ImportarCSVModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar que sea un archivo CSV
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Por favor selecciona un archivo CSV válido');
      setFile(null);
      setPreview([]);
      return;
    }

    setError('');
    setFile(selectedFile);

    // Leer y previsualizar el archivo
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim());

      // Ignorar la primera fila (header) y extraer la primera columna (nombres de OA)
      const oas = lines
        .slice(1)
        .map(line => {
          const columns = line.split(',');
          return columns[0]?.trim() || '';
        })
        .filter(oa => oa.length > 0);

      setPreview(oas);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (!file || preview.length === 0) return;
    onImport(preview);
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <CloudUpload className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Importar Planificación CSV
                </h2>
                <p className="text-indigo-100 text-sm">
                  Carga tu planificación desde un archivo CSV
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg
                className="w-6 h-6"
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Instrucciones */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Instrucciones:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>
                • El archivo debe ser un CSV con los nombres de los OA en la
                primera columna
              </li>
              <li>
                • La primera fila será ignorada (se considera como header)
              </li>
              <li>
                • Los OA se asignarán secuencialmente según el horario activo
              </li>
              <li>• No es necesario incluir todos los OA del sistema</li>
              <li>• Se crearán clases automáticamente con los OA importados</li>
            </ul>
          </div>

          {/* Upload */}
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
                  <span className="text-gray-500 text-sm">
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

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">
                Vista previa ({preview.length} OA encontrados):
              </h3>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="space-y-1">
                  {preview.slice(0, 10).map((oa, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-600 py-1 px-2 bg-white rounded border"
                    >
                      {index + 1}. {oa}
                    </div>
                  ))}
                  {preview.length > 10 && (
                    <div className="text-sm text-gray-500 italic py-1 px-2">
                      ... y {preview.length - 10} OA más
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <SecondaryButton onClick={handleClose} disabled={loading}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton
            onClick={handleImport}
            disabled={!file || preview.length === 0 || loading}
            className="flex items-center gap-2"
          >
            <CloudUpload className="w-4 h-4" />
            {loading ? 'Importando...' : 'Importar Planificación'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
