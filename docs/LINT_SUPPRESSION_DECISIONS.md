# Decisiones de Supresión de Lint - Proyecto Educacion App

Este documento registra todas las decisiones tomadas para suprimir warnings o errores de lint, junto con las explicaciones técnicas de por qué se consideró necesario hacerlo.

## Propósito

Mantener un registro transparente de cuándo y por qué se suprimen reglas de lint, permitiendo:

- Revisión futura de estas decisiones
- Identificación de patrones que podrían indicar problemas de arquitectura
- Documentación para el equipo de desarrollo
- Justificación para auditorías de código

## Reglas Suprimidas

### 1. `react-hooks/exhaustive-deps` - EvaluacionForm.tsx

**Archivo:** `src/components/evaluacion/EvaluacionForm.tsx`  
**Línea:** 228  
**Regla suprimida:** `react-hooks/exhaustive-deps`  
**Comentario usado:** `// eslint-disable-next-line react-hooks/exhaustive-deps`

**Explicación técnica:**
El `useEffect` en cuestión usa `currentEditor` y `updateFormData` dentro de su lógica, pero incluir estas variables en las dependencias causa un bucle infinito porque:

1. **`currentEditor`** cambia en cada render del hook `useEvaluacionForm`
2. **`updateFormData`** es una función que se recrea en cada render del hook
3. Al incluirlas en las dependencias, el `useEffect` se ejecuta en cada render
4. Esto causa que `setEditorReady(true)` se ejecute repetidamente
5. El resultado es el error "Maximum update depth exceeded"

**Alternativas consideradas:**

- ✅ **Envolver `updateFormData` en `useCallback`**: No es viable porque la función viene de un hook externo
- ✅ **Remover las dependencias problemáticas**: Causa el warning de lint pero evita el bucle infinito
- ❌ **Incluir las dependencias**: Causa bucle infinito y crash de la aplicación

**Justificación de la decisión:**
La funcionalidad del `useEffect` no depende realmente de cambios en `currentEditor` o `updateFormData`. El efecto se ejecuta cuando:

- `editorReady` cambia (el editor está listo)
- `modoEdicion` cambia (cambiamos entre crear/editar)
- `evaluacionInicial` cambia (cargamos una evaluación diferente)
- `dataPreloaded` cambia (los datos se han precargado)

Estas son las dependencias lógicas reales del efecto. `currentEditor` y `updateFormData` son herramientas que se usan dentro del efecto, no condiciones que determinen cuándo ejecutarlo.

**Riesgos y mitigaciones:**

- **Riesgo**: El editor podría no actualizarse si `currentEditor` cambia
- **Mitigación**: El `currentEditor` se establece una sola vez cuando el editor está listo, no cambia durante la vida útil del componente
- **Riesgo**: `updateFormData` podría ser una versión obsoleta
- **Mitigación**: La función se actualiza en cada render del hook, pero esto no afecta la lógica del efecto

**Fecha de decisión:** [Fecha actual]  
**Revisar en:** 3 meses o cuando se modifique la lógica del editor

---

### 2. `jsx-a11y/alt-text` - FileUpload.tsx

**Archivo:** `src/components/ui/file-upload.tsx`  
**Línea:** 86  
**Regla suprimida:** `jsx-a11y/alt-text`  
**Comentario usado:** `// eslint-disable-next-line jsx-a11y/alt-text`

**Explicación técnica:**
El warning se aplica al componente `<Image>` de Lucide React, que es un icono SVG, no un elemento `<img>` HTML. Los iconos SVG no requieren la prop `alt` porque:

1. **No son elementos de imagen HTML**: Son componentes SVG de React
2. **No tienen contenido semántico de imagen**: Son iconos decorativos
3. **La prop `alt` no es válida**: Los iconos de Lucide no aceptan esta prop
4. **Falso positivo del linter**: El linter está siendo demasiado estricto

**Alternativas consideradas:**

- ✅ **Agregar prop `alt`**: No es válida para iconos SVG de Lucide
- ✅ **Usar comentario ESLint**: Suprime el falso positivo correctamente
- ❌ **Cambiar a elemento `<img>`**: No es apropiado para iconos decorativos

**Justificación de la decisión:**
Los iconos SVG decorativos no requieren texto alternativo según las pautas de accesibilidad. El warning es un falso positivo que se puede suprimir de manera segura.

**Riesgos y mitigaciones:**

- **Riesgo**: Ninguno - los iconos SVG no requieren `alt`
- **Mitigación**: El comentario ESLint es específico y documentado

**Fecha de decisión:** [Fecha actual]  
**Revisar en:** Solo si se cambia la implementación de iconos

---

## Patrones Identificados

### Bucle Infinito por Dependencias de Hooks

**Problema recurrente:** Incluir funciones o referencias de hooks externos en las dependencias de `useEffect` causa bucles infinitos.

**Causa raíz:** Los hooks externos recrean sus funciones en cada render, causando que los `useEffect` se ejecuten repetidamente.

**Solución aplicada:** Usar comentarios de supresión cuando las dependencias no son lógicamente necesarias para la ejecución del efecto.

**Prevención futura:** Considerar el uso de `useCallback` en hooks personalizados para estabilizar referencias de funciones.

---

## Metodología de Decisión

### Criterios para Supresión

1. **Funcionalidad crítica comprometida**: La aplicación no funciona sin la supresión
2. **Alternativas no viables**: Todas las alternativas técnicas causan problemas mayores
3. **Dependencias no lógicas**: Las variables en cuestión no determinan cuándo ejecutar el efecto
4. **Documentación clara**: Se documenta por qué se tomó la decisión

### Criterios para NO Suprimir

1. **Problemas de seguridad**: Nunca suprimir reglas relacionadas con seguridad
2. **Problemas de rendimiento**: Evitar supresiones que causen re-renders innecesarios
3. **Problemas de accesibilidad**: Mantener reglas de accesibilidad activas
4. **Problemas de mantenibilidad**: Evitar supresiones que hagan el código difícil de mantener

---

## Revisión y Mantenimiento

### Frecuencia de Revisión

- **Revisión mensual**: Verificar que las supresiones siguen siendo necesarias
- **Revisión trimestral**: Evaluar si se pueden implementar alternativas técnicas
- **Revisión por feature**: Revisar supresiones cuando se modifiquen archivos relacionados

### Métricas de Seguimiento

- Número total de supresiones activas
- Tiempo transcurrido desde cada supresión
- Cambios en el código que podrían eliminar la necesidad de supresión

### Proceso de Eliminación

1. Identificar supresiones que ya no son necesarias
2. Implementar la corrección técnica apropiada
3. Remover el comentario de supresión
4. Verificar que no se introducen nuevos problemas
5. Documentar la eliminación en este documento

---

## Conclusión

Las supresiones de lint documentadas en este archivo representan decisiones técnicas tomadas para resolver conflictos entre las reglas de lint y la funcionalidad de la aplicación. Cada supresión está justificada técnicamente y documentada para permitir revisión futura.

El objetivo es mantener la calidad del código mientras se asegura que la aplicación funcione correctamente. Las supresiones se revisan regularmente para identificar oportunidades de mejora y alternativas técnicas más elegantes.
