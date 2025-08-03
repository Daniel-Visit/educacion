# 🛡️ Lineamientos para Migraciones de Base de Datos

## Principio Fundamental

**Nunca se debe borrar ningún dato ni realizar migraciones destructivas.**

## Reglas Específicas

1. **Migraciones solo aditivas:**
   - Solo se permite agregar nuevas tablas, columnas o relaciones.
   - No se permite eliminar tablas, columnas ni datos existentes.

2. **Prohibido el uso de comandos destructivos:**
   - No usar `reset`, `drop`, `force`, ni comandos que eliminen datos.
   - No ejecutar migraciones que borren información de producción o desarrollo.

3. **Compatibilidad hacia atrás:**
   - Todos los cambios deben ser compatibles con los datos y estructuras existentes.
   - Las migraciones deben garantizar que ninguna funcionalidad existente se vea afectada.

4. **Migraciones seguras:**
   - Antes de aplicar cualquier migración, revisar que no haya instrucciones de borrado (`DROP`, `DELETE`, `ALTER ... DROP COLUMN`, etc.).
   - Realizar respaldo de la base de datos antes de cualquier cambio estructural.

5. **Documentación:**
   - Documentar cada migración y su propósito.
   - Registrar cualquier cambio estructural en los archivos de documentación del proyecto.

## Ejemplo de migración permitida

```sql
-- ✅ Permitido: Agregar una nueva tabla
CREATE TABLE nueva_tabla (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL
);

-- ✅ Permitido: Agregar una columna
ALTER TABLE tabla_existente ADD COLUMN nueva_columna TEXT;
```

## Ejemplo de migración prohibida

```sql
-- ❌ Prohibido: Eliminar una tabla
DROP TABLE tabla_existente;

-- ❌ Prohibido: Eliminar una columna
ALTER TABLE tabla_existente DROP COLUMN columna_antigua;

-- ❌ Prohibido: Borrar datos
DELETE FROM tabla_existente WHERE ...;
```

---

**Este lineamiento es obligatorio y debe cumplirse en todas las migraciones del proyecto.**
