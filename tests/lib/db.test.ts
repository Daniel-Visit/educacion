/**
 * Tests para la capa de base de datos.
 */

import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db';
import {
  calculatePagination,
  buildPaginatedResult,
} from '@/lib/db/repositories/base.repository';

describe('Database Layer', () => {
  describe('db export', () => {
    it('should export db object with expected models', () => {
      expect(db).toBeDefined();
      expect(db.user).toBeDefined();
      expect(db.role).toBeDefined();
      expect(db.evaluacion).toBeDefined();
      expect(db.pregunta).toBeDefined();
      expect(db.alternativa).toBeDefined();
    });

    it('should export transaction function', () => {
      expect(typeof db.transaction).toBe('function');
    });

    it('should export disconnect function', () => {
      expect(typeof db.disconnect).toBe('function');
    });
  });

  describe('calculatePagination', () => {
    it('should return default values when no params provided', () => {
      const result = calculatePagination({});
      expect(result).toEqual({ page: 1, limit: 20, skip: 0 });
    });

    it('should calculate skip correctly', () => {
      const result = calculatePagination({ page: 3, limit: 10 });
      expect(result).toEqual({ page: 3, limit: 10, skip: 20 });
    });

    it('should enforce minimum page of 1', () => {
      const result = calculatePagination({ page: 0 });
      expect(result.page).toBe(1);

      const result2 = calculatePagination({ page: -5 });
      expect(result2.page).toBe(1);
    });

    it('should enforce maximum limit of 100', () => {
      const result = calculatePagination({ limit: 500 });
      expect(result.limit).toBe(100);
    });

    it('should enforce minimum limit of 1', () => {
      // limit: 0 is falsy, so default (20) is used
      const result = calculatePagination({ limit: 0 });
      expect(result.limit).toBe(20);

      // Negative values get clamped to minimum 1
      const result2 = calculatePagination({ limit: -10 });
      expect(result2.limit).toBe(1);
    });
  });

  describe('buildPaginatedResult', () => {
    it('should build correct paginated result', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = buildPaginatedResult(data, 50, { page: 2, limit: 10 });

      expect(result).toEqual({
        data,
        total: 50,
        page: 2,
        limit: 10,
        totalPages: 5,
      });
    });

    it('should calculate totalPages correctly for partial last page', () => {
      const result = buildPaginatedResult([], 25, { page: 1, limit: 10 });
      expect(result.totalPages).toBe(3);
    });

    it('should handle zero total', () => {
      const result = buildPaginatedResult([], 0, { page: 1, limit: 10 });
      expect(result.totalPages).toBe(0);
    });
  });
});
