-- CreateTable
CREATE TABLE "Evaluacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "archivoId" INTEGER NOT NULL,
    "matrizId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Evaluacion_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "Archivo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evaluacion_matrizId_fkey" FOREIGN KEY ("matrizId") REFERENCES "MatrizEspecificacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pregunta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "evaluacionId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    CONSTRAINT "Pregunta_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alternativa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "preguntaId" INTEGER NOT NULL,
    "letra" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "esCorrecta" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Alternativa_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
