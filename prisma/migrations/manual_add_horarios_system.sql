-- Crear tabla Profesor
CREATE TABLE IF NOT EXISTS "profesor" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "rut" TEXT NOT NULL UNIQUE,
  "nombre" TEXT NOT NULL,
  "email" TEXT,
  "telefono" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

-- Crear tabla ProfesorAsignatura
CREATE TABLE IF NOT EXISTS "profesor_asignatura" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "profesorId" INTEGER NOT NULL,
  "asignaturaId" INTEGER NOT NULL,
  CONSTRAINT "profesor_asignatura_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "profesor" ("id") ON DELETE CASCADE,
  CONSTRAINT "profesor_asignatura_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignatura" ("id") ON DELETE CASCADE,
  UNIQUE("profesorId", "asignaturaId")
);

-- Crear tabla ProfesorNivel
CREATE TABLE IF NOT EXISTS "profesor_nivel" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "profesorId" INTEGER NOT NULL,
  "nivelId" INTEGER NOT NULL,
  CONSTRAINT "profesor_nivel_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "profesor" ("id") ON DELETE CASCADE,
  CONSTRAINT "profesor_nivel_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "nivel" ("id") ON DELETE CASCADE,
  UNIQUE("profesorId", "nivelId")
);

-- Crear tabla Horario
CREATE TABLE IF NOT EXISTS "horario" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "nombre" TEXT NOT NULL,
  "docenteId" INTEGER NOT NULL,
  "asignaturaId" INTEGER NOT NULL,
  "nivelId" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "horario_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "profesor" ("id"),
  CONSTRAINT "horario_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignatura" ("id"),
  CONSTRAINT "horario_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "nivel" ("id")
);

-- Crear tabla ModuloHorario
CREATE TABLE IF NOT EXISTS "modulo_horario" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "horarioId" INTEGER NOT NULL,
  "dia" TEXT NOT NULL,
  "horaInicio" TEXT NOT NULL,
  "duracion" INTEGER NOT NULL,
  "orden" INTEGER NOT NULL,
  CONSTRAINT "modulo_horario_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "horario" ("id") ON DELETE CASCADE
);

-- Crear tabla ModuloHorarioProfesor
CREATE TABLE IF NOT EXISTS "modulo_horario_profesor" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "moduloHorarioId" INTEGER NOT NULL,
  "profesorId" INTEGER NOT NULL,
  "rol" TEXT NOT NULL,
  CONSTRAINT "modulo_horario_profesor_moduloHorarioId_fkey" FOREIGN KEY ("moduloHorarioId") REFERENCES "modulo_horario" ("id") ON DELETE CASCADE,
  CONSTRAINT "modulo_horario_profesor_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "profesor" ("id") ON DELETE CASCADE,
  UNIQUE("moduloHorarioId", "profesorId", "rol")
);

-- Crear tabla PlanificacionAnual
CREATE TABLE IF NOT EXISTS "planificacion_anual" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "nombre" TEXT NOT NULL,
  "horarioId" INTEGER NOT NULL,
  "ano" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "planificacion_anual_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "horario" ("id") ON DELETE CASCADE
);

-- Crear tabla AsignacionOA
CREATE TABLE IF NOT EXISTS "asignacion_oa" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "planificacionId" INTEGER,
  "moduloHorarioId" INTEGER,
  "oaId" INTEGER NOT NULL,
  "cantidadClases" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "asignacion_oa_planificacionId_fkey" FOREIGN KEY ("planificacionId") REFERENCES "planificacion_anual" ("id") ON DELETE CASCADE,
  CONSTRAINT "asignacion_oa_moduloHorarioId_fkey" FOREIGN KEY ("moduloHorarioId") REFERENCES "modulo_horario" ("id") ON DELETE CASCADE,
  CONSTRAINT "asignacion_oa_oaId_fkey" FOREIGN KEY ("oaId") REFERENCES "oa" ("id") ON DELETE CASCADE
); 