/**
 * API response utilities.
 * Provides consistent response helpers for API routes.
 */

import { NextResponse } from 'next/server';

export const api = {
  /**
   * Success response with data.
   */
  success<T>(data: T, status = 200) {
    return NextResponse.json(data, { status });
  },

  /**
   * Created response (201).
   */
  created<T>(data: T) {
    return NextResponse.json(data, { status: 201 });
  },

  /**
   * Error response with message.
   */
  error(message: string, status = 400) {
    return NextResponse.json({ error: message }, { status });
  },

  /**
   * Not found response (404).
   */
  notFound(resource: string) {
    return this.error(`${resource} no encontrado`, 404);
  },

  /**
   * Unauthorized response (401).
   */
  unauthorized() {
    return this.error('No autorizado', 401);
  },

  /**
   * Forbidden response (403).
   */
  forbidden() {
    return this.error('Acceso denegado', 403);
  },

  /**
   * Server error response (500).
   * Logs the error in development.
   */
  serverError(err: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Server error:', err);
    }
    return this.error('Error interno del servidor', 500);
  },
};
