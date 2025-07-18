-- CreateTable
CREATE TABLE "ResultadoEvaluacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "evaluacionId" INTEGER NOT NULL,
    "fechaCarga" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAlumnos" INTEGER NOT NULL,
    CONSTRAINT "ResultadoEvaluacion_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResultadoAlumno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resultadoEvaluacionId" INTEGER NOT NULL,
    "nombreAlumno" TEXT NOT NULL,
    "puntajeTotal" REAL NOT NULL,
    "puntajeMaximo" REAL NOT NULL,
    "porcentaje" REAL NOT NULL,
    CONSTRAINT "ResultadoAlumno_resultadoEvaluacionId_fkey" FOREIGN KEY ("resultadoEvaluacionId") REFERENCES "ResultadoEvaluacion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RespuestaAlumno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resultadoAlumnoId" INTEGER NOT NULL,
    "preguntaId" INTEGER NOT NULL,
    "alternativaDada" TEXT NOT NULL,
    "esCorrecta" BOOLEAN NOT NULL,
    "puntajeObtenido" REAL NOT NULL,
    CONSTRAINT "RespuestaAlumno_resultadoAlumnoId_fkey" FOREIGN KEY ("resultadoAlumnoId") REFERENCES "ResultadoAlumno" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RespuestaAlumno_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ResultadoEvaluacion_evaluacionId_idx" ON "ResultadoEvaluacion"("evaluacionId");

-- CreateIndex
CREATE INDEX "ResultadoAlumno_resultadoEvaluacionId_idx" ON "ResultadoAlumno"("resultadoEvaluacionId");

-- CreateIndex
CREATE INDEX "RespuestaAlumno_resultadoAlumnoId_idx" ON "RespuestaAlumno"("resultadoAlumnoId");

-- CreateIndex
CREATE INDEX "RespuestaAlumno_preguntaId_idx" ON "RespuestaAlumno"("preguntaId"); 