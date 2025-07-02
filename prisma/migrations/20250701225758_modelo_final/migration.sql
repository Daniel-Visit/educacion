/*
  Warnings:

  - You are about to drop the `asignaturas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ejes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `entrevistas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `niveles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "asignaturas";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ejes";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "entrevistas";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "niveles";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "oas";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "usuarios";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "asignatura" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "nivel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "oa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nivel_id" INTEGER NOT NULL,
    "asignatura_id" INTEGER NOT NULL,
    "eje_id" INTEGER NOT NULL,
    "eje_descripcion" TEXT NOT NULL,
    "oas_id" TEXT NOT NULL,
    "descripcion_oas" TEXT NOT NULL,
    "basal" BOOLEAN NOT NULL,
    "minimo_clases" INTEGER NOT NULL
);
