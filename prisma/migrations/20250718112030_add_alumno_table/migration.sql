-- CreateTable
CREATE TABLE "alumno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rut" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "curso" TEXT,
    "nivelId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "alumno_rut_key" UNIQUE ("rut")
);

-- AlterTable
ALTER TABLE "ResultadoEvaluacion" ADD COLUMN "escalaNota" REAL NOT NULL DEFAULT 7.0;

-- AlterTable
ALTER TABLE "ResultadoAlumno" ADD COLUMN "alumnoId" INTEGER NOT NULL;
ALTER TABLE "ResultadoAlumno" ADD COLUMN "nota" REAL NOT NULL;

-- CreateIndex
CREATE INDEX "alumno_nivelId_idx" ON "alumno"("nivelId");

-- CreateIndex
CREATE INDEX "ResultadoAlumno_alumnoId_idx" ON "ResultadoAlumno"("alumnoId"); 