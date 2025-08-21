'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  XCircle,
} from 'lucide-react';
import { z } from 'zod';

// Schema de validación para establecer contraseña
const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type SetPasswordForm = z.infer<typeof setPasswordSchema>;

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setSetPasswordForm] = useState<SetPasswordForm>({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<SetPasswordForm>>({});

  // Verificar que hay token
  useEffect(() => {
    if (!token) {
      setError('Token de invitación no válido');
      return;
    }
  }, [token]);

  const handleInputChange =
    (field: keyof SetPasswordForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSetPasswordForm(prev => ({ ...prev, [field]: value }));

      // Limpiar error del campo cuando el usuario empiece a escribir
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Token de invitación no válido');
      return;
    }

    // Validar formulario
    try {
      const validatedData = setPasswordSchema.parse(formData);
      console.log('✅ Validación exitosa:', validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('❌ Errores de validación:', error.issues);
        const fieldErrors: Partial<SetPasswordForm> = {};
        error.issues.forEach(issue => {
          const field = issue.path[0] as keyof SetPasswordForm;
          fieldErrors[field] = issue.message;
        });
        setErrors(fieldErrors);
        setError('Por favor, corrige los errores en el formulario');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        console.log('✅ Contraseña establecida exitosamente');

        // NO redirigir automáticamente - por seguridad debe ir al login
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al establecer la contraseña');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setError('Error inesperado al establecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="border border-red-200 shadow-sm">
          <CardContent className="p-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-red-600 mb-2">
              Token Inválido
            </h1>
            <p className="text-gray-600">
              El enlace de invitación no es válido o ha expirado.
            </p>
            <Button
              onClick={() => router.push('/auth/login')}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700"
            >
              Ir al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Contraseña Establecida!
            </h1>
            <p className="text-gray-600">
              Tu cuenta ha sido configurada exitosamente
            </p>
          </div>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-6">
                Ahora puedes iniciar sesión con tu nueva contraseña
              </p>

              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                Ir al Login
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              ¿Tienes problemas?{' '}
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Establece tu Contraseña
          </h1>
          <p className="text-gray-600">
            Completa tu registro para acceder a la plataforma
          </p>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg border border-red-200 flex items-center justify-between">
                <span className="text-sm">{error}</span>
                <button
                  onClick={() => setError('')}
                  className="ml-3 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Nueva Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu nueva contraseña"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    className="pl-10 pr-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirma tu nueva contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    className="pl-10 pr-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Establecer Contraseña'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            ¿Tienes problemas?{' '}
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
