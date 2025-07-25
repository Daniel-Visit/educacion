# 🎯 Corrección: Filtrado Contextual de OAs en Creación de Matrices

## 📋 **Problema Identificado**

### **Contexto del Problema:**
Los OAs y ejes en la tabla `oa` son **contextuales** según la combinación `asignatura_id + nivel_id`. Esto significa que:

- **Mismo `eje_id`** puede tener **diferentes `eje_descripcion`** según la asignatura
- **Mismo `oas_id`** puede tener **diferente `descripcion_oas`** según la asignatura
- **Ejemplo:** `eje_id = 1` puede ser "Lectura y comprensión" en Lenguaje, pero "Álgebra" en Matemáticas

### **Problema Específico:**
En la creación de matrices, el **Paso 2** no está filtrando correctamente por contexto, lo que puede mostrar OAs de asignaturas diferentes a la seleccionada.

## 🔍 **Análisis del Código Actual**

### **Ubicación del Problema:**
```typescript
// src/app/matrices/crear/page.tsx - Líneas ~90-100
const oasDeAsignaturaNivel = useMemo(() => {
  if (!selectedAsignatura || !selectedNivel) return [];
  return oas.filter(oa => 
    oa.asignatura_id === selectedAsignatura && 
    oa.nivel_id === selectedNivel
  );
}, [oas, selectedAsignatura, selectedNivel]);
```

### **Problemas Identificados:**

#### **1. API `/api/ejes` No Filtra por Contexto:**
```typescript
// src/app/api/ejes/route.ts - Líneas ~10-30
export async function GET() {
  // ❌ PROBLEMA: No filtra por asignatura/nivel
  const oas = await prisma.oa.findMany({
    orderBy: [
      { eje_id: 'asc' },
      { oas_id: 'asc' },
    ],
  });

  // ❌ PROBLEMA: Agrupa todos los OAs sin contexto
  const ejesMap = new Map();
  for (const oa of oas) {
    const ejeKey = `${oa.eje_id}||${oa.eje_descripcion}`;
    // ...
  }
}
```

#### **2. Agrupación de Ejes Sin Contexto:**
```typescript
// src/app/matrices/crear/page.tsx - Líneas ~100-110
const ejesDisponibles = useMemo(() => {
  return oasDeAsignaturaNivel.reduce((acc: Eje[], oa) => {
    const ejeExistente = acc.find(e => e.id === oa.eje_id);
    if (!ejeExistente) {
      acc.push({
        id: oa.eje_id,
        descripcion: oa.eje_descripcion
      });
    }
    return acc;
  }, []);
}, [oasDeAsignaturaNivel]);
```

## 🛠️ **Soluciones Propuestas**

### **Solución 1: Modificar API `/api/ejes`**

#### **Nueva Estructura de API:**
```typescript
// src/app/api/ejes/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const asignaturaId = searchParams.get('asignaturaId');
    const nivelId = searchParams.get('nivelId');

    // ✅ Validar parámetros requeridos
    if (!asignaturaId || !nivelId) {
      return NextResponse.json(
        { error: 'asignaturaId y nivelId son requeridos' },
        { status: 400 }
      );
    }

    // ✅ Filtrar OAs por contexto específico
    const oas = await prisma.oa.findMany({
      where: {
        asignatura_id: parseInt(asignaturaId),
        nivel_id: parseInt(nivelId)
      },
      orderBy: [
        { eje_id: 'asc' },
        { oas_id: 'asc' },
      ],
    });

    // ✅ Agrupar por eje contextualizado
    const ejesMap = new Map();
    for (const oa of oas) {
      const ejeKey = `${oa.eje_id}||${oa.eje_descripcion}`;
      if (!ejesMap.has(ejeKey)) {
        ejesMap.set(ejeKey, {
          id: oa.eje_id,
          descripcion: oa.eje_descripcion,
          oas: [],
        });
      }
      ejesMap.get(ejeKey).oas.push(oa);
    }
    
    const ejes = Array.from(ejesMap.values());
    return NextResponse.json(ejes);
  } catch (error) {
    console.error('Error al obtener ejes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

#### **Uso de la API Modificada:**
```typescript
// Llamada desde el frontend
const response = await fetch(`/api/ejes?asignaturaId=${selectedAsignatura}&nivelId=${selectedNivel}`);
const ejes = await response.json();
```

### **Solución 2: Validación en Paso 1**

#### **Agregar Validación de OAs Disponibles:**
```typescript
// src/app/matrices/crear/page.tsx - Agregar después de la línea ~150
const oasDisponiblesParaCombinacion = useMemo(() => {
  if (!selectedAsignatura || !selectedNivel) return [];
  return oas.filter(oa => 
    oa.asignatura_id === selectedAsignatura && 
    oa.nivel_id === selectedNivel
  );
}, [oas, selectedAsignatura, selectedNivel]);

// Validar si hay OAs disponibles antes de permitir continuar
const puedeContinuarAlPaso2 = matrizName.trim() && 
  totalPreguntas > 0 && 
  selectedAsignatura && 
  selectedNivel && 
  oasDisponiblesParaCombinacion.length > 0;
```

#### **Modificar Botón "Siguiente":**
```typescript
// src/app/matrices/crear/page.tsx - Línea ~440
<PrimaryButton
  onClick={() => setStep(2)}
  disabled={!puedeContinuarAlPaso2}
>
  Siguiente
</PrimaryButton>
```

#### **Agregar Mensaje de Error:**
```typescript
// src/app/matrices/crear/page.tsx - Agregar después de la línea ~430
{selectedAsignatura && selectedNivel && oasDisponiblesParaCombinacion.length === 0 && (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
    <div className="flex items-center gap-2">
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <p className="text-red-700 font-medium">
        No hay OAs disponibles para la combinación seleccionada
      </p>
    </div>
    <p className="text-red-600 text-sm mt-1">
      Por favor, selecciona otra asignatura o nivel.
    </p>
  </div>
)}
```

### **Solución 3: Filtrado Estricto en Paso 2**

#### **Modificar Carga de Ejes:**
```typescript
// src/app/matrices/crear/page.tsx - Reemplazar fetchEjes (línea ~120)
const fetchEjes = async () => {
  try {
    if (!selectedAsignatura || !selectedNivel) return;
    
    const response = await fetch(`/api/ejes?asignaturaId=${selectedAsignatura}&nivelId=${selectedNivel}`);
    if (response.ok) {
      const data = await response.json();
      setEjes(data);
    }
  } catch (error) {
    console.error('Error al obtener ejes:', error);
  }
};

// Agregar useEffect para cargar ejes cuando cambie la selección
useEffect(() => {
  fetchEjes();
}, [selectedAsignatura, selectedNivel]);
```

#### **Eliminar Cálculo Local de Ejes:**
```typescript
// src/app/matrices/crear/page.tsx - Eliminar líneas ~100-110
// ELIMINAR este useMemo ya que los ejes vendrán de la API
// const ejesDisponibles = useMemo(() => { ... }, [oasDeAsignaturaNivel]);
```

## 📝 **Plan de Implementación**

### **Paso 1: Modificar API `/api/ejes`**
1. ✅ Agregar parámetros `asignaturaId` y `nivelId`
2. ✅ Implementar filtrado por contexto
3. ✅ Agrupar ejes correctamente
4. ✅ Agregar validaciones de parámetros

### **Paso 2: Actualizar Frontend - Paso 1**
1. ✅ Agregar validación de OAs disponibles
2. ✅ Modificar botón "Siguiente"
3. ✅ Agregar mensaje de error cuando no hay OAs
4. ✅ Actualizar lógica de validación

### **Paso 3: Actualizar Frontend - Paso 2**
1. ✅ Modificar llamada a API de ejes
2. ✅ Eliminar cálculo local de ejes
3. ✅ Agregar useEffect para recargar ejes
4. ✅ Verificar que solo se muestren OAs del contexto

### **Paso 4: Testing**
1. ✅ Probar con combinaciones válidas
2. ✅ Probar con combinaciones sin OAs
3. ✅ Verificar que no se mezclen contextos
4. ✅ Validar mensajes de error

## 🔧 **Archivos a Modificar**

### **Backend:**
- `src/app/api/ejes/route.ts` - Modificar para filtrar por contexto

### **Frontend:**
- `src/app/matrices/crear/page.tsx` - Agregar validaciones y modificar lógica
- `src/app/matrices/[id]/editar/page.tsx` - Aplicar las mismas correcciones

## 🎯 **Resultado Esperado**

### **Antes de la Corrección:**
- ❌ Paso 1 permite continuar sin verificar OAs disponibles
- ❌ Paso 2 muestra OAs de todas las asignaturas
- ❌ Ejes se agrupan incorrectamente sin contexto

### **Después de la Corrección:**
- ✅ Paso 1 valida que existan OAs para la combinación
- ✅ Paso 2 muestra solo OAs del contexto específico
- ✅ Ejes se agrupan correctamente por contexto
- ✅ Mensajes de error claros cuando no hay datos

## 📊 **Ejemplo de Datos**

### **Estructura de la Tabla `oa`:**
```sql
-- Ejemplo con contexto
INSERT INTO oa (nivel_id, asignatura_id, eje_id, eje_descripcion, oas_id, descripcion_oas) VALUES
(2, 1, 1, 'Lectura y comprensión', 'OA01', 'Leer textos narrativos...'),  -- Lenguaje 2° Básico
(2, 2, 1, 'Álgebra', 'OA01', 'Resolver problemas de suma y resta...'),   -- Matemáticas 2° Básico
(2, 1, 2, 'Escritura', 'OA02', 'Escribir textos narrativos...'),         -- Lenguaje 2° Básico
(2, 2, 2, 'Geometría', 'OA02', 'Identificar figuras geométricas...');    -- Matemáticas 2° Básico
```

### **Resultado del Filtrado:**
```typescript
// Para Lenguaje (asignatura_id: 1) + 2° Básico (nivel_id: 2)
{
  ejes: [
    {
      id: 1,
      descripcion: "Lectura y comprensión",
      oas: [/* solo OAs de Lenguaje */]
    },
    {
      id: 2, 
      descripcion: "Escritura",
      oas: [/* solo OAs de Lenguaje */]
    }
  ]
}

// Para Matemáticas (asignatura_id: 2) + 2° Básico (nivel_id: 2)
{
  ejes: [
    {
      id: 1,
      descripcion: "Álgebra",  // ¡Diferente descripción!
      oas: [/* solo OAs de Matemáticas */]
    },
    {
      id: 2,
      descripcion: "Geometría",  // ¡Diferente descripción!
      oas: [/* solo OAs de Matemáticas */]
    }
  ]
}
```

---

**Fecha de Documentación:** Julio 2025  
**Estado:** Pendiente de implementación  
**Prioridad:** Alta - Corrige funcionalidad crítica  
**Responsable:** Equipo de Desarrollo 