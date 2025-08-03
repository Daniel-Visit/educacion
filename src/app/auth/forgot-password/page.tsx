'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, X } from 'lucide-react';
import { z } from 'zod';

// Schema de validación con Zod
const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email requerido")
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState<ForgotPasswordForm>({
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Partial<ForgotPasswordForm>>({});
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setErrors({});

    try {
      // Validar con Zod
      const validatedData = forgotPasswordSchema.parse(formData);
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message || 'Email de recuperación enviado',
        });
        setFormData({ email: '' });
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Error enviando email de recuperación',
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convertir errores de Zod a formato de errores
        const fieldErrors: Partial<ForgotPasswordForm> = {};
        (error as any).errors.forEach((err: any) => {
          const field = err.path[0] as keyof ForgotPasswordForm;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setMessage({
          type: 'error',
          text: 'Error de conexión. Intenta nuevamente.',
        });
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
            Recuperar contraseña
          </h1>
          <p className="text-gray-600">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            {message && (
              <div className={`mb-4 p-3 rounded-lg border flex items-center justify-between ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-600 border-green-200' 
                  : 'bg-red-100 text-red-600 border-red-200'
              }`}>
                <span className="text-sm">{message.text}</span>
                <button
                  onClick={() => setMessage(null)}
                  className={`ml-3 w-6 h-6 rounded-full flex items-center justify-center hover:opacity-80 ${
                    message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {isLoading ? 'Enviando...' : 'Enviar email de recuperación'}
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Volver al login
                </Link>
              </div>
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