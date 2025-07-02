-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "asignaturas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "niveles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ejes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "asignaturaId" INTEGER NOT NULL,
    "nivelId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ejes_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignaturas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ejes_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "niveles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "oas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "basal" BOOLEAN NOT NULL DEFAULT false,
    "minimoClases" INTEGER,
    "ejeId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "oas_ejeId_fkey" FOREIGN KEY ("ejeId") REFERENCES "ejes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "entrevistas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "anios" INTEGER NOT NULL,
    "nivelId" INTEGER NOT NULL,
    "asignaturaId" INTEGER NOT NULL,
    "horas" INTEGER NOT NULL,
    "estudiantes" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "entrevistas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entrevistas_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "niveles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "entrevistas_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignaturas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "asignaturas_nombre_key" ON "asignaturas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "niveles_nombre_key" ON "niveles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ejes_asignaturaId_nivelId_nombre_key" ON "ejes"("asignaturaId", "nivelId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "oas_ejeId_codigo_key" ON "oas"("ejeId", "codigo");
