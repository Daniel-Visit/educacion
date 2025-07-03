-- CreateTable
CREATE TABLE "MatrizEspecificacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "total_preguntas" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MatrizOA" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matrizId" INTEGER NOT NULL,
    "oaId" INTEGER NOT NULL,
    CONSTRAINT "MatrizOA_matrizId_fkey" FOREIGN KEY ("matrizId") REFERENCES "MatrizEspecificacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Indicador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matrizOAId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "preguntas" INTEGER NOT NULL,
    CONSTRAINT "Indicador_matrizOAId_fkey" FOREIGN KEY ("matrizOAId") REFERENCES "MatrizOA" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
