# Funcionalidad de Botones de Eje - Planificación Anual

## Resumen
Se implementó un sistema de botones en cada eje de la planificación anual que permite habilitar/deshabilitar OA que no cumplen con la lógica de restricción normal, manteniendo la flexibilidad en la asignación de objetivos académicos.

## Funcionalidad Implementada

### Botones de Eje
Cada eje (excepto "actitud") tiene dos botones pequeños junto al título:
- **Botón `+`**: "Activar OA" - Habilita el siguiente OA que no cumple la lógica de restricción
- **Botón `-`**: "Desactivar OA" - Deshabilita el último OA que fue habilitado (solo si no tiene clases asignadas)

### Lógica de Restricción Mejorada
- **OA del eje "actitud"**: Siempre son asignables, sin importar la configuración
- **OA normales**: Solo se pueden asignar si el OA anterior cumple su mínimo de clases
- **OA habilitados con botón de eje**: Se pueden asignar aunque no cumplan la lógica de restricción

## Flujo de Trabajo

### Escenario Típico
1. **OA 13** no cumple su mínimo de clases requeridas
2. **Botón `+` del eje** habilita el **botón `+` del OA 14**
3. **Usuario puede asignar clases al OA 14** usando su botón `+` normal
4. **Botón `-` del eje** solo disponible si OA 14 fue habilitado pero no tiene clases

### Estados de los Botones

#### Botón `+` del Eje
- **Habilitado**: Cuando hay un OA siguiente que no cumple la lógica de restricción
- **Deshabilitado**: Cuando todos los OA cumplen la lógica o ya están habilitados
- **Tooltip**: "Activar OA" / "No hay OA para activar"

#### Botón `-` del Eje
- **Habilitado**: Cuando hay OA habilitados que no tienen clases asignadas
- **Deshabilitado**: Cuando no hay OA habilitados o todos tienen clases
- **Tooltip**: "Desactivar OA" / "No hay OA saltados para desactivar"

## Implementación Técnica

### Estado Global
```typescript
const [skippedOAs, setSkippedOAs] = useState<Set<number>>(new Set());
```
- Rastrea qué OA fueron habilitados con el botón del eje
- Permite habilitar/deshabilitar OA sin afectar las clases asignadas

### Funciones Principales

#### `handleActivateSkippedOA(oa: OA, eje: Eje)`
- Marca el OA como "habilitado" en `skippedOAs`
- No asigna clases automáticamente
- Solo habilita el botón `+` del OA

#### `handleDeactivateSkippedOA(oa: OA)`
- Remueve el OA de `skippedOAs`
- Solo funciona si el OA no tiene clases asignadas
- Deshabilita el botón `+` del OA

### Lógica de Filtrado
```typescript
const canAdd = prevOk || isSkipped || oa.eje_descripcion.toLowerCase() === 'actitud';
```
- **prevOk**: OA anterior cumple su mínimo
- **isSkipped**: OA fue habilitado con botón del eje
- **eje actitud**: Siempre asignable

## Componentes Modificados

### `EjeSection.tsx`
- Agregados botones `+` y `-` junto al título del eje
- Lógica para determinar cuándo mostrar/habilitar botones
- Integración con estado de OA habilitados

### `OACard.tsx`
- Modificada lógica de habilitación del botón `+`
- Considera OA habilitados con botón del eje
- Mantiene lógica original del botón `-`

### `use-planificacion-anual.ts`
- Nuevo estado `skippedOAs`
- Funciones para activar/desactivar OA
- Integración con lógica de filtrado existente

## Características Visuales

### Diseño de Botones
- **Estilo**: Cuadrados perfectos (8x8) con bordes redondeados
- **Colores**: Consistente con botones de paginación
- **Estados**: Habilitado/deshabilitado con opacidad y cursor
- **Posicionamiento**: Esquina superior derecha del título del eje

### Tooltips Informativos
- Explican claramente la acción de cada botón
- Indican por qué un botón está deshabilitado
- Ayudan al usuario a entender la funcionalidad

## Beneficios

### Flexibilidad
- Permite asignar OA fuera del orden estricto cuando sea necesario
- Mantiene la lógica de restricción como guía, no como limitación absoluta

### Control Granular
- Los OA del eje "actitud" siempre disponibles
- Control específico por eje y OA
- Posibilidad de revertir habilitaciones

### Experiencia de Usuario
- Interfaz intuitiva con botones claros
- Feedback visual inmediato
- Tooltips informativos

## Casos de Uso

### Caso 1: OA Secuencial
- OA 13 → OA 14 → OA 15 (orden normal)
- Si OA 13 no cumple mínimo, OA 14 no se puede asignar
- Botón `+` del eje habilita OA 14 para asignación

### Caso 2: OA de Actitud
- Los OA del eje "actitud" no tienen botones de eje
- Siempre están disponibles para asignación
- No requieren habilitación especial

### Caso 3: Reversión
- OA 14 habilitado pero sin clases asignadas
- Botón `-` del eje deshabilita OA 14
- Vuelve a estado original de restricción

## Consideraciones Técnicas

### Persistencia
- El estado `skippedOAs` se mantiene durante la sesión
- No se persiste en base de datos
- Se reinicia al recargar la página

### Rendimiento
- Uso de `Set` para búsquedas eficientes
- Lógica de filtrado optimizada
- Re-renderizados mínimos

### Compatibilidad
- Funciona con lógica de restricción existente
- No afecta funcionalidad de filtros
- Integración completa con calendario

## Próximas Mejoras Posibles

1. **Persistencia**: Guardar estado de OA habilitados
2. **Historial**: Mostrar qué OA fueron habilitados manualmente
3. **Bulk Operations**: Habilitar múltiples OA a la vez
4. **Validación**: Verificar coherencia de habilitaciones
5. **Exportación**: Incluir información de OA habilitados en reportes 