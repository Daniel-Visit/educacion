/**
 * Tests para API utilities.
 */

import { describe, it, expect } from 'vitest';
import { api } from '@/lib/api-utils';

describe('API Utils', () => {
  describe('success', () => {
    it('should return 200 by default', async () => {
      const res = api.success({ id: 1 });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({ id: 1 });
    });

    it('should accept custom status code', async () => {
      const res = api.success({ id: 1 }, 202);
      expect(res.status).toBe(202);
    });
  });

  describe('created', () => {
    it('should return 201', async () => {
      const res = api.created({ id: 1 });
      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body).toEqual({ id: 1 });
    });
  });

  describe('error', () => {
    it('should return 400 by default', async () => {
      const res = api.error('Bad request');
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body).toEqual({ error: 'Bad request' });
    });

    it('should accept custom status code', async () => {
      const res = api.error('Custom error', 422);
      expect(res.status).toBe(422);
    });
  });

  describe('notFound', () => {
    it('should return 404 with resource name', async () => {
      const res = api.notFound('Usuario');
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body).toEqual({ error: 'Usuario no encontrado' });
    });
  });

  describe('unauthorized', () => {
    it('should return 401', async () => {
      const res = api.unauthorized();
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({ error: 'No autorizado' });
    });
  });

  describe('forbidden', () => {
    it('should return 403', async () => {
      const res = api.forbidden();
      expect(res.status).toBe(403);

      const body = await res.json();
      expect(body).toEqual({ error: 'Acceso denegado' });
    });
  });

  describe('serverError', () => {
    it('should return 500', async () => {
      const res = api.serverError(new Error('test'));
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body).toEqual({ error: 'Error interno del servidor' });
    });
  });
});
