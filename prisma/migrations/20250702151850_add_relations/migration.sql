-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_oa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nivel_id" INTEGER NOT NULL,
    "asignatura_id" INTEGER NOT NULL,
    "eje_id" INTEGER NOT NULL,
    "eje_descripcion" TEXT NOT NULL,
    "oas_id" TEXT NOT NULL,
    "descripcion_oas" TEXT NOT NULL,
    "basal" BOOLEAN NOT NULL,
    "minimo_clases" INTEGER NOT NULL,
    CONSTRAINT "oa_nivel_id_fkey" FOREIGN KEY ("nivel_id") REFERENCES "nivel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "oa_asignatura_id_fkey" FOREIGN KEY ("asignatura_id") REFERENCES "asignatura" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_oa" ("asignatura_id", "basal", "descripcion_oas", "eje_descripcion", "eje_id", "id", "minimo_clases", "nivel_id", "oas_id") SELECT "asignatura_id", "basal", "descripcion_oas", "eje_descripcion", "eje_id", "id", "minimo_clases", "nivel_id", "oas_id" FROM "oa";
DROP TABLE "oa";
ALTER TABLE "new_oa" RENAME TO "oa";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
