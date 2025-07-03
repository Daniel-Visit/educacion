/*
  Warnings:

  - You are about to drop the `archivo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "archivo";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Archivo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Imagen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "tamaño" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ArchivoImagen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "archivoId" INTEGER NOT NULL,
    "imagenId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArchivoImagen_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "Archivo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArchivoImagen_imagenId_fkey" FOREIGN KEY ("imagenId") REFERENCES "Imagen" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ArchivoImagen_archivoId_imagenId_key" ON "ArchivoImagen"("archivoId", "imagenId");
