/*
  Warnings:

  - You are about to drop the column `nombreAlumno` on the `ResultadoAlumno` table. All the data in the column will be lost.
  - Added the required column `asignatura_id` to the `MatrizEspecificacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel_id` to the `MatrizEspecificacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "oa" ADD COLUMN "tipo_eje" TEXT;

-- CreateTable
CREATE TABLE "asignatura_nivel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "asignatura_id" INTEGER NOT NULL,
    "nivel_id" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    CONSTRAINT "asignatura_nivel_asignatura_id_fkey" FOREIGN KEY ("asignatura_id") REFERENCES "asignatura" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "asignatura_nivel_nivel_id_fkey" FOREIGN KEY ("nivel_id") REFERENCES "nivel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "profesor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rut" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fechaNacimiento" DATETIME
);

-- CreateTable
CREATE TABLE "profesor_asignatura" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profesorId" INTEGER NOT NULL,
    "asignaturaId" INTEGER NOT NULL,
    CONSTRAINT "profesor_asignatura_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignatura" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "profesor_asignatura_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "profesor" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "profesor_nivel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profesorId" INTEGER NOT NULL,
    "nivelId" INTEGER NOT NULL,
    CONSTRAINT "profesor_nivel_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "nivel" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "profesor_nivel_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "profesor" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "horario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "asignaturaId" INTEGER NOT NULL,
    "nivelId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fechaPrimeraClase" DATETIME,
    CONSTRAINT "horario_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "nivel" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "horario_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignatura" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "horario_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "profesor" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "modulo_horario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "horarioId" INTEGER NOT NULL,
    "dia" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "duracion" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    CONSTRAINT "modulo_horario_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "horario" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "modulo_horario_profesor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "moduloHorarioId" INTEGER NOT NULL,
    "profesorId" INTEGER NOT NULL,
    "rol" TEXT NOT NULL,
    CONSTRAINT "modulo_horario_profesor_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "profesor" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "modulo_horario_profesor_moduloHorarioId_fkey" FOREIGN KEY ("moduloHorarioId") REFERENCES "modulo_horario" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "planificacion_anual" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "horarioId" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "planificacion_anual_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "horario" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "asignacion_oa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "planificacionId" INTEGER,
    "moduloHorarioId" INTEGER,
    "oaId" INTEGER NOT NULL,
    "cantidadClases" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "asignacion_oa_oaId_fkey" FOREIGN KEY ("oaId") REFERENCES "oa" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "asignacion_oa_moduloHorarioId_fkey" FOREIGN KEY ("moduloHorarioId") REFERENCES "modulo_horario" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "asignacion_oa_planificacionId_fkey" FOREIGN KEY ("planificacionId") REFERENCES "planificacion_anual" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "pregunta_indicador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "preguntaId" INTEGER NOT NULL,
    "indicadorId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    CONSTRAINT "pregunta_indicador_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pregunta_indicador_indicadorId_fkey" FOREIGN KEY ("indicadorId") REFERENCES "Indicador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MatrizEspecificacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "total_preguntas" INTEGER NOT NULL,
    "asignatura_id" INTEGER NOT NULL,
    "nivel_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatrizEspecificacion_nivel_id_fkey" FOREIGN KEY ("nivel_id") REFERENCES "nivel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatrizEspecificacion_asignatura_id_fkey" FOREIGN KEY ("asignatura_id") REFERENCES "asignatura" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MatrizEspecificacion" ("createdAt", "id", "nombre", "total_preguntas") SELECT "createdAt", "id", "nombre", "total_preguntas" FROM "MatrizEspecificacion";
DROP TABLE "MatrizEspecificacion";
ALTER TABLE "new_MatrizEspecificacion" RENAME TO "MatrizEspecificacion";
CREATE TABLE "new_ResultadoAlumno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resultadoEvaluacionId" INTEGER NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "puntajeTotal" REAL NOT NULL,
    "puntajeMaximo" REAL NOT NULL,
    "porcentaje" REAL NOT NULL,
    "nota" REAL NOT NULL,
    CONSTRAINT "ResultadoAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "alumno" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResultadoAlumno_resultadoEvaluacionId_fkey" FOREIGN KEY ("resultadoEvaluacionId") REFERENCES "ResultadoEvaluacion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ResultadoAlumno" ("alumnoId", "id", "nota", "porcentaje", "puntajeMaximo", "puntajeTotal", "resultadoEvaluacionId") SELECT "alumnoId", "id", "nota", "porcentaje", "puntajeMaximo", "puntajeTotal", "resultadoEvaluacionId" FROM "ResultadoAlumno";
DROP TABLE "ResultadoAlumno";
ALTER TABLE "new_ResultadoAlumno" RENAME TO "ResultadoAlumno";
CREATE INDEX "ResultadoAlumno_alumnoId_idx" ON "ResultadoAlumno"("alumnoId");
CREATE INDEX "ResultadoAlumno_resultadoEvaluacionId_idx" ON "ResultadoAlumno"("resultadoEvaluacionId");
CREATE TABLE "new_alumno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rut" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "curso" TEXT,
    "nivelId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "alumno_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "nivel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_alumno" ("apellido", "createdAt", "curso", "id", "nivelId", "nombre", "rut", "updatedAt") SELECT "apellido", "createdAt", "curso", "id", "nivelId", "nombre", "rut", "updatedAt" FROM "alumno";
DROP TABLE "alumno";
ALTER TABLE "new_alumno" RENAME TO "alumno";
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_alumno_1" ON "alumno"("rut");
Pragma writable_schema=0;
CREATE INDEX "alumno_nivelId_idx" ON "alumno"("nivelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "asignatura_nivel_codigo_key" ON "asignatura_nivel"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "asignatura_nivel_asignatura_id_nivel_id_key" ON "asignatura_nivel"("asignatura_id", "nivel_id");

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_profesor_1" ON "profesor"("rut");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_profesor_asignatura_1" ON "profesor_asignatura"("profesorId", "asignaturaId");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_profesor_nivel_1" ON "profesor_nivel"("profesorId", "nivelId");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_modulo_horario_profesor_1" ON "modulo_horario_profesor"("moduloHorarioId", "profesorId", "rol");
Pragma writable_schema=0;

-- CreateIndex
CREATE UNIQUE INDEX "pregunta_indicador_preguntaId_indicadorId_tipo_key" ON "pregunta_indicador"("preguntaId", "indicadorId", "tipo");
