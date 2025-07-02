-- CreateTable
CREATE TABLE "metodologia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre_metodologia" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "nivel_recomendado" TEXT NOT NULL,
    "fuentes_literatura" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "metodologia_nombre_metodologia_key" ON "metodologia"("nombre_metodologia");
