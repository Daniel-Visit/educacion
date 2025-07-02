/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `asignatura` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `nivel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "asignatura_nombre_key" ON "asignatura"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "nivel_nombre_key" ON "nivel"("nombre");
