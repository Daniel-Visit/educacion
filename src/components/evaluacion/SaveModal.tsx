import { Dialog } from '@headlessui/react';
import { Save, AlertCircle } from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  titulo: string;
  onTituloChange: (titulo: string) => void;
  saving: boolean;
  error?: string;
}

export default function SaveModal({
  isOpen,
  onClose,
  onSave,
  titulo,
  onTituloChange,
  saving,
  error,
}: SaveModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Save size={24} className="text-indigo-600" />
            </div>
            <div>
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Guardar Evaluación
              </Dialog.Title>
              <p className="text-sm text-gray-500">
                Ingresa un título para tu evaluación
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Evaluación *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={e => onTituloChange(e.target.value)}
                placeholder="Ej: Evaluación de Matemáticas - Números Naturales"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={saving}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} className="text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <SecondaryButton
                onClick={onClose}
                disabled={saving}
                className="flex-1"
              >
                Cancelar
              </SecondaryButton>
              <PrimaryButton
                onClick={onSave}
                disabled={saving || !titulo.trim()}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar
                  </>
                )}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
