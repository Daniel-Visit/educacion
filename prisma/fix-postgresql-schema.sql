-- Script para corregir PostgreSQL y hacerlo exactamente igual a SQLite
-- SOLO eliminar campos extra de MatrizEspecificacion que no existen en SQLite

-- 1. Eliminar campos extra de MatrizEspecificacion que no existen en SQLite
ALTER TABLE "MatrizEspecificacion" DROP COLUMN IF EXISTS "asignatura_id";
ALTER TABLE "MatrizEspecificacion" DROP COLUMN IF EXISTS "nivel_id";

-- 2. Las relaciones foreign key se eliminarán automáticamente al eliminar las columnas

-- 3. Verificar que la estructura es idéntica a SQLite
-- Comandos para verificar:
-- \d "MatrizEspecificacion"  -- Debería mostrar solo: id, nombre, total_preguntas, createdAt
-- \d "asignatura"            -- Verificar estructura
-- \d "nivel"                 -- Verificar estructura

-- NOTA: Los mapas SQLite SÍ existen en SQLite actual, por lo que NO se deben eliminar
-- PostgreSQL está correcto en mantener los mapas de índices SQLite 