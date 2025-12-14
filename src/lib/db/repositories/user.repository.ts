/**
 * Repository para operaciones de usuarios.
 * Encapsula toda la lógica de acceso a datos de User.
 */

import { Prisma } from '@prisma/client';
import {
  BaseRepository,
  PaginationParams,
  calculatePagination,
  buildPaginatedResult,
} from './base.repository';
import { TransactionClient } from '../index';

export type CreateUserData = {
  email: string;
  name?: string | null;
  password?: string | null;
  roleId: string;
  mustChangePassword?: boolean;
  avatarId?: string | null;
  avatarBgColorId?: string | null;
};

export type UpdateUserData = Partial<
  Omit<CreateUserData, 'email'> & { email?: string }
>;

export type UserWithRole = Prisma.UserGetPayload<{
  include: { role: true };
}>;

export type UserWithAvatar = Prisma.UserGetPayload<{
  include: {
    role: true;
    avatar: true;
    avatarBgColor: true;
  };
}>;

class UserRepository extends BaseRepository {
  /**
   * Busca usuario por ID.
   */
  async findById(id: string): Promise<UserWithRole | null> {
    return this.db.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  /**
   * Busca usuario por email.
   */
  async findByEmail(email: string): Promise<UserWithRole | null> {
    return this.db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true },
    });
  }

  /**
   * Busca usuario con datos de avatar.
   */
  async findWithAvatar(id: string): Promise<UserWithAvatar | null> {
    return this.db.user.findUnique({
      where: { id },
      include: {
        role: true,
        avatar: true,
        avatarBgColor: true,
      },
    });
  }

  /**
   * Lista usuarios paginados.
   */
  async findMany(
    params: PaginationParams & {
      roleId?: string;
      search?: string;
    }
  ) {
    const { page, limit, skip } = calculatePagination(params);

    const where: Prisma.UserWhereInput = {};

    if (params.roleId) {
      where.roleId = params.roleId;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.db.user.findMany({
        where,
        include: { role: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.user.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  /**
   * Crea usuario nuevo.
   */
  async create(data: CreateUserData, tx?: TransactionClient) {
    const createData: Prisma.UserCreateInput = {
      email: data.email.toLowerCase(),
      name: data.name,
      password: data.password,
      mustChangePassword: data.mustChangePassword ?? false,
      role: { connect: { id: data.roleId } },
    };

    if (data.avatarId) {
      createData.avatar = { connect: { id: data.avatarId } };
    }

    if (data.avatarBgColorId) {
      createData.avatarBgColor = { connect: { id: data.avatarBgColorId } };
    }

    if (tx) {
      return tx.user.create({
        data: createData,
        include: { role: true },
      });
    }

    return this.db.user.create({
      data: createData,
      include: { role: true },
    });
  }

  /**
   * Actualiza usuario.
   */
  async update(id: string, data: UpdateUserData, tx?: TransactionClient) {
    const updateData: Prisma.UserUpdateInput = {};

    if (data.email !== undefined) {
      updateData.email = data.email.toLowerCase();
    }
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.password !== undefined) {
      updateData.password = data.password;
    }
    if (data.mustChangePassword !== undefined) {
      updateData.mustChangePassword = data.mustChangePassword;
    }
    if (data.roleId !== undefined) {
      updateData.role = { connect: { id: data.roleId } };
    }
    if (data.avatarId !== undefined) {
      if (data.avatarId === null) {
        updateData.avatar = { disconnect: true };
      } else {
        updateData.avatar = { connect: { id: data.avatarId } };
      }
    }
    if (data.avatarBgColorId !== undefined) {
      if (data.avatarBgColorId === null) {
        updateData.avatarBgColor = { disconnect: true };
      } else {
        updateData.avatarBgColor = { connect: { id: data.avatarBgColorId } };
      }
    }

    if (tx) {
      return tx.user.update({
        where: { id },
        data: updateData,
        include: { role: true },
      });
    }

    return this.db.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });
  }

  /**
   * Elimina usuario.
   */
  async delete(id: string, tx?: TransactionClient) {
    if (tx) {
      return tx.user.delete({ where: { id } });
    }
    return this.db.user.delete({ where: { id } });
  }

  /**
   * Verifica si email existe.
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.UserWhereInput = {
      email: email.toLowerCase(),
    };

    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const count = await this.db.user.count({ where });
    return count > 0;
  }

  /**
   * Actualiza solo el password.
   */
  async updatePassword(
    id: string,
    hashedPassword: string,
    mustChangePassword = false
  ) {
    return this.db.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustChangePassword,
      },
    });
  }
}

// Singleton
export const userRepository = new UserRepository();
