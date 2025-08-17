'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';

// Schema de validación con Zod
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Contraseña actual requerida'),
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
      .regex(/[a-z]/, 'Debe incluir al menos una letra minúscula')
      .regex(/[0-9]/, 'Debe incluir al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe incluir al menos un carácter especial'),
    confirmPassword: z.string().min(1, 'Confirmar contraseña requerida'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState<ChangePasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ChangePasswordForm>>({});
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const router = useRouter();

  const handleInputChange =
    (field: keyof ChangePasswordForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));

      // Limpiar error del campo cuando el usuario empiece a escribir
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Validar requerimientos de contraseña
  const passwordRequirements = {
    minLength: formData.newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.newPassword),
    hasLowercase: /[a-z]/.test(formData.newPassword),
    hasNumber: /[0-9]/.test(formData.newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(formData.newPassword),
    hasMatch:
      formData.newPassword === formData.confirmPassword &&
      formData.confirmPassword.length > 0,
  };

  const allRequirementsMet =
    passwordRequirements.minLength &&
    passwordRequirements.hasUppercase &&
    passwordRequirements.hasLowercase &&
    passwordRequirements.hasNumber &&
    passwordRequirements.hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      // Validar con Zod
      const validatedData = changePasswordSchema.parse(formData);

      // Llamar al API
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message);
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setErrors({ currentPassword: result.error });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convertir errores de Zod a formato de errores usando z.flattenError()
        const fieldErrors: Partial<ChangePasswordForm> = {};
        const flattened = z.flattenError(error);
        Object.entries(flattened.fieldErrors).forEach(([field, messages]) => {
          fieldErrors[field as keyof ChangePasswordForm] = (
            messages as string[]
          )[0];
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ currentPassword: 'Error interno del servidor' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cambiar Contraseña
          </h1>
          <p className="text-gray-600">
            Por favor, establece una nueva contraseña para tu cuenta
          </p>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            {/* Mensaje de éxito */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-600 rounded-lg border border-green-200">
                <span className="text-sm">{success}</span>
                <p className="text-xs mt-1">
                  Serás redirigido al login en unos segundos...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Contraseña Actual */}
              <div className="space-y-2">
                <Label
                  htmlFor="current-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Contraseña Actual
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="current-password"
                    name="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña actual"
                    value={formData.currentPassword}
                    onChange={handleInputChange('currentPassword')}
                    className="pl-10 pr-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  {errors.currentPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div className="space-y-2">
                <Label
                  htmlFor="new-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Nueva Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="new-password"
                    name="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    placeholder="Ingresa tu nueva contraseña"
                    value={formData.newPassword}
                    onChange={handleInputChange('newPassword')}
                    className="pl-10 pr-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  {errors.newPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.newPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirmar Nueva Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder="Confirma tu nueva contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    className="pl-10 pr-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Cuadro de requerimientos de seguridad */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-medium text-blue-700 mb-2">
                  Requerimientos de seguridad:
                </p>
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-blue-600">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                    Mínimo 8 caracteres
                  </div>
                  <div className="flex items-center text-xs text-blue-600">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                    Incluir al menos una letra mayúscula
                  </div>
                  <div className="flex items-center text-xs text-blue-600">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                    Incluir al menos una letra minúscula
                  </div>
                  <div className="flex items-center text-xs text-blue-600">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                    Incluir al menos un número
                  </div>
                  <div className="flex items-center text-xs text-blue-600">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                    Incluir al menos un carácter especial
                  </div>
                </div>
              </div>

              {/* Botón de envío */}
              <Button
                type="submit"
                disabled={isLoading || !allRequirementsMet}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <a
              href="#"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Contacta al administrador
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
