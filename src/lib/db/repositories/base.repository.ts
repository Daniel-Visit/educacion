/**
 * Base repository con operaciones comunes.
 * Extiende para crear repositories específicos.
 */

import { db, TransactionClient } from '../index';

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Calcula offset para paginación.
 */
export function calculatePagination(params: PaginationParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Construye resultado paginado.
 */
export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  pagination: { page: number; limit: number }
): PaginatedResult<T> {
  return {
    data,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

/**
 * Base repository abstracto.
 * Provee acceso a db y transacciones.
 */
export abstract class BaseRepository {
  protected db = db;

  /**
   * Ejecuta operación dentro de transacción existente o crea una nueva.
   */
  protected async withTransaction<T>(
    fn: (tx: TransactionClient) => Promise<T>,
    existingTx?: TransactionClient
  ): Promise<T> {
    if (existingTx) {
      return fn(existingTx);
    }
    return this.db.transaction(fn);
  }
}
