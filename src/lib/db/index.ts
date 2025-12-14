/**
 * Capa segura de acceso a base de datos.
 *
 * REGLAS:
 * 1. NUNCA importar prisma directamente en rutas API
 * 2. SIEMPRE usar db o repositories
 * 3. Operaciones multi-paso SIEMPRE en transacción
 */

import { PrismaClient } from '@prisma/client';

// Singleton de Prisma (solo para uso interno de este módulo)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Tipos para transacciones
export type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

/**
 * Cliente de base de datos seguro.
 * Expone solo las operaciones permitidas.
 */
export const db = {
  // Modelos de dominio educativo
  asignatura: prisma.asignatura,
  nivel: prisma.nivel,
  oa: prisma.oa,
  metodologia: prisma.metodologia,
  asignaturaNivel: prisma.asignaturaNivel,

  // Evaluaciones
  evaluacion: prisma.evaluacion,
  pregunta: prisma.pregunta,
  alternativa: prisma.alternativa,
  indicador: prisma.indicador,
  matrizEspecificacion: prisma.matrizEspecificacion,
  matrizOA: prisma.matrizOA,
  preguntaIndicador: prisma.preguntaIndicador,

  // Archivos
  archivo: prisma.archivo,
  imagen: prisma.imagen,
  archivoImagen: prisma.archivoImagen,

  // Resultados
  resultadoEvaluacion: prisma.resultadoEvaluacion,
  resultadoAlumno: prisma.resultadoAlumno,
  respuestaAlumno: prisma.respuestaAlumno,
  alumno: prisma.alumno,

  // Planificación
  horario: prisma.horario,
  moduloHorario: prisma.moduloHorario,
  moduloHorarioProfesor: prisma.moduloHorarioProfesor,
  planificacionAnual: prisma.planificacionAnual,
  asignacionOA: prisma.asignacionOA,

  // Profesores
  profesor: prisma.profesor,
  profesorAsignatura: prisma.profesorAsignatura,
  profesorNivel: prisma.profesorNivel,

  // Auth (NextAuth)
  user: prisma.user,
  account: prisma.account,
  session: prisma.session,
  verificationToken: prisma.verificationToken,

  // Sistema
  role: prisma.role,
  availableAvatar: prisma.availableAvatar,
  avatarBackgroundColor: prisma.avatarBackgroundColor,

  /**
   * Ejecuta operaciones en una transacción.
   * SIEMPRE usar para operaciones multi-paso.
   */
  transaction: prisma.$transaction.bind(prisma),

  /**
   * Desconectar (solo para tests/cleanup)
   */
  disconnect: () => prisma.$disconnect(),
} as const;

// Tipo para el cliente de DB
export type DB = typeof db;

// Re-exportar tipos de Prisma que se necesiten
export type { Prisma } from '@prisma/client';
