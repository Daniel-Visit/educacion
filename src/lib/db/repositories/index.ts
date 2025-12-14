/**
 * Exporta todos los repositories.
 * Importar desde aquí para acceso centralizado.
 */

export { userRepository } from './user.repository';
export type {
  CreateUserData,
  UpdateUserData,
  UserWithRole,
  UserWithAvatar,
} from './user.repository';

export {
  BaseRepository,
  calculatePagination,
  buildPaginatedResult,
} from './base.repository';
export type { PaginationParams, PaginatedResult } from './base.repository';
