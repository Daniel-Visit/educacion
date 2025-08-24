/**
 * Utilidades para manejar URLs según el ambiente
 */

export function getBaseUrl(): string {
  // En producción, usar la URL de goodly.cl
  if (process.env.NODE_ENV === 'production') {
    return 'https://www.goodly.cl';
  }

  // En desarrollo, usar localhost
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Fallback para desarrollo
  return 'http://localhost:3000';
}

export function getInvitationUrl(token: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/auth/set-password?token=${token}`;
}

export function getResetPasswordUrl(token: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/auth/reset-password?token=${token}`;
}
