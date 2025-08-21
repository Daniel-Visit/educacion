-- Script para resetear la secuencia de IDs de moduloHorario
-- Este script corrige el error "Unique constraint failed on the fields: (id)"

-- 1. Verificar el estado actual de la secuencia
SELECT 
    sequence_name,
    last_value,
    start_value,
    increment_by
FROM moduloHorario_id_seq;

-- 2. Resetear la secuencia al valor máximo + 1
SELECT setval('moduloHorario_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM "moduloHorario"));

-- 3. Verificar que se corrigió
SELECT 
    sequence_name,
    last_value,
    start_value,
    increment_by
FROM moduloHorario_id_seq;

-- 4. Verificar que no hay conflictos de IDs
SELECT id, COUNT(*) as count
FROM "moduloHorario"
GROUP BY id
HAVING COUNT(*) > 1;
