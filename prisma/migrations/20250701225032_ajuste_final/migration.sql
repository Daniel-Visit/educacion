/*
  Warnings:

  - Added the required column `asignaturaId` to the `oas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ejeDescripcion` to the `oas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivelId` to the `oas` table without a default value. This is not possible if the table is not empty.
  - Made the column `minimoClases` on table `oas` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_oas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nivelId" INTEGER NOT NULL,
    "asignaturaId" INTEGER NOT NULL,
    "ejeId" INTEGER NOT NULL,
    "ejeDescripcion" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "basal" BOOLEAN NOT NULL,
    "minimoClases" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "oas_ejeId_fkey" FOREIGN KEY ("ejeId") REFERENCES "ejes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_oas" ("basal", "codigo", "createdAt", "descripcion", "ejeId", "id", "minimoClases", "updatedAt") SELECT "basal", "codigo", "createdAt", "descripcion", "ejeId", "id", "minimoClases", "updatedAt" FROM "oas";
DROP TABLE "oas";
ALTER TABLE "new_oas" RENAME TO "oas";
CREATE UNIQUE INDEX "oas_ejeId_codigo_key" ON "oas"("ejeId", "codigo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
