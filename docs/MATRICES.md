# 🎯 Gestión de Matrices de Especificación

## Descripción General

El módulo de matrices de especificación permite a los docentes crear, editar y gestionar matrices que definen la estructura de evaluaciones basadas en Objetivos de Aprendizaje (OAs) del currículum chileno.

## Características Principales

### ✨ Funcionalidades de Matrices
- **Creación de matrices** con nombre y número total de preguntas
- **Gestión de OAs** asociados a cada matriz
- **Indicadores específicos** para cada OA
- **Asignación de preguntas** por indicador
- **Interfaz intuitiva** para docentes
- **Validación automática** de datos

### 📊 Estructura de una Matriz
```
Matriz de Especificación
├── Información General
│   ├── Nombre de la matriz
│   └── Total de preguntas
└── OAs Asociados
    ├── OA 1
    │   ├── Indicador 1 (X preguntas)
    │   ├── Indicador 2 (Y preguntas)
    │   └── ...
    ├── OA 2
    │   ├── Indicador 1 (Z preguntas)
    │   └── ...
    └── ...
```

## Estructura de Archivos

```
src/app/matrices/
├── page.tsx                    # Lista de matrices
├── crear/
│   └── page.tsx               # Crear nueva matriz (refactorizado)
└── [id]/
    ├── page.tsx               # Ver matriz específica
    └── editar/
        └── page.tsx           # Editar matriz

src/app/api/
└── matrices/
    ├── route.ts               # CRUD de matrices
    ├── [id]/route.ts          # Operaciones por ID
    └── import-csv/route.ts    # Importación desde CSV

src/components/matrices/        # Componentes refactorizados
├── MatrizBasicForm.tsx        # Formulario básico reutilizable
├── MatrizOASelector.tsx       # Selector de OAs (Paso 2)
├── MatrizIndicadoresSection.tsx # Gestión de indicadores (Paso 3)
├── OASelector.tsx             # Componente base para selección de OAs
├── IndicadoresSection.tsx     # Componente base para indicadores
├── MatrizStepIndicator.tsx    # Indicador de pasos
├── MatrizHeader.tsx           # Encabezado con estadísticas
└── ImportarMatrizModal.tsx    # Modal de importación CSV

src/hooks/
└── useMatrices.ts             # Hook para gestión de matrices

src/types/
└── matrices.ts                # Tipos centralizados

src/utils/
└── matrices.ts                # Funciones utilitarias
```

## Uso del Módulo

### 1. Ver Todas las Matrices
```bash
# Navegar a la página de matrices
http://localhost:3000/matrices
```

### 2. Crear Nueva Matriz
1. Haz clic en "Crear Nueva Matriz"
2. Completa el nombre y total de preguntas
3. Asocia OAs relevantes
4. Define indicadores para cada OA
5. Asigna número de preguntas por indicador
6. Guarda la matriz

### 3. Editar Matriz Existente
1. Selecciona una matriz de la lista
2. Haz clic en "Editar"
3. Modifica la información necesaria
4. Guarda los cambios

### 4. Ver Detalles de Matriz
1. Selecciona una matriz de la lista
2. Revisa la estructura completa
3. Verifica la distribución de preguntas

### 5. Importar Matriz desde CSV
1. En el Paso 2 de creación, haz clic en "Importar OAs desde CSV"
2. Descarga el template de ejemplo
3. Completa el archivo CSV con los OAs e indicadores
4. Sube el archivo y revisa la previsualización
5. Confirma la importación para continuar al Paso 3

## 🏗️ Refactorización Reciente

### Componentes Modulares
La página de creación de matrices ha sido refactorizada para mejorar la mantenibilidad y reutilización:

#### Componentes Principales
- **`MatrizBasicForm`**: Maneja el formulario básico (nombre, asignatura, nivel, total preguntas)
- **`MatrizOASelector`**: Gestiona la selección de OAs con validaciones automáticas
- **`MatrizIndicadoresSection`**: Controla la definición de indicadores y distribución de preguntas

#### Componentes Base
- **`OASelector`**: Componente reutilizable para selección de OAs
- **`IndicadoresSection`**: Componente reutilizable para gestión de indicadores
- **`MatrizStepIndicator`**: Indicador visual de progreso
- **`MatrizHeader`**: Encabezado con estadísticas de la matriz

#### Utilidades y Hooks
- **`useMatrices`**: Hook personalizado para gestión de datos de matrices
- **`src/types/matrices.ts`**: Tipos TypeScript centralizados
- **`src/utils/matrices.ts`**: Funciones utilitarias compartidas

### Beneficios de la Refactorización
- **Mantenibilidad**: Código más modular y fácil de mantener
- **Reutilización**: Componentes que pueden usarse en otras páginas
- **Legibilidad**: Separación clara de responsabilidades
- **Escalabilidad**: Arquitectura preparada para futuras expansiones

## APIs de Matrices

### Matrices (`/api/matrices`)

#### GET `/api/matrices`
Obtiene todas las matrices con sus OAs asociados.
```typescript
// Response
{
  id: number
  nombre: string
  total_preguntas: number
  createdAt: string
  oas: MatrizOA[]
}[]
```

#### POST `/api/matrices`
Crea una nueva matriz.
```typescript
{
  nombre: string
  total_preguntas: number
  oas: {
    oaId: number
    indicadores: {
      descripcion: string
      preguntas: number
    }[]
  }[]
}
```

#### PUT `/api/matrices/[id]`
Actualiza una matriz existente.
```typescript
{
  nombre?: string
  total_preguntas?: number
  oas?: MatrizOA[]
}
```

#### DELETE `/api/matrices/[id]`
Elimina una matriz y todos sus datos asociados.

## Base de Datos

### Tabla `MatrizEspecificacion`
```sql
CREATE TABLE MatrizEspecificacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  total_preguntas INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `MatrizOA`
```sql
CREATE TABLE MatrizOA (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matrizId INTEGER NOT NULL,
  oaId INTEGER NOT NULL,
  FOREIGN KEY (matrizId) REFERENCES MatrizEspecificacion(id) ON DELETE CASCADE,
  FOREIGN KEY (oaId) REFERENCES oa(id) ON DELETE CASCADE
);
```

### Tabla `Indicador`
```sql
CREATE TABLE Indicador (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matrizOAId INTEGER NOT NULL,
  descripcion TEXT NOT NULL,
  preguntas INTEGER NOT NULL,
  FOREIGN KEY (matrizOAId) REFERENCES MatrizOA(id) ON DELETE CASCADE
);
```

## Flujo de Creación de Matriz

### 1. Información Básica
```typescript
{
  nombre: "Evaluación Sumativa - Lenguaje 2° Básico",
  total_preguntas: 20
}
```

### 2. Selección de OAs
- Filtrar por nivel y asignatura
- Seleccionar OAs relevantes para la evaluación
- Cada OA puede tener múltiples indicadores

### 3. Definición de Indicadores
```typescript
{
  oaId: 1,
  indicadores: [
    {
      descripcion: "Identifica elementos de textos narrativos",
      preguntas: 5
    },
    {
      descripcion: "Comprende vocabulario específico",
      preguntas: 3
    }
  ]
}
```

### 4. Validación
- Total de preguntas debe coincidir con la suma de indicadores
- Cada OA debe tener al menos un indicador
- Descripciones no pueden estar vacías

## Componentes de Interfaz

### Lista de Matrices
- Tabla con nombre, total de preguntas y fecha de creación
- Botones de acción (Ver, Editar, Eliminar)
- Filtros por asignatura y nivel

### Formulario de Creación/Edición
- Campos para información básica
- Selector de OAs con filtros
- Gestión dinámica de indicadores
- Validación en tiempo real

### Vista de Matriz
- Estructura jerárquica clara
- Distribución visual de preguntas
- Información detallada de cada OA

## Validaciones

### Reglas de Negocio
1. **Total de preguntas:** Debe ser igual a la suma de preguntas de todos los indicadores
2. **Indicadores:** Cada OA debe tener al menos un indicador
3. **Descripciones:** No pueden estar vacías
4. **Preguntas por indicador:** Debe ser un número positivo

### Validaciones de Frontend
```typescript
const validations = {
  nombre: (value: string) => value.length > 0,
  total_preguntas: (value: number) => value > 0,
  indicadores: (indicadores: Indicador[]) => {
    return indicadores.every(ind => 
      ind.descripcion.length > 0 && ind.preguntas > 0
    )
  }
}
```

## Integración con OAs

### Objetivos de Aprendizaje Disponibles
- **13 asignaturas** del currículum chileno
- **12 niveles** educativos (1° Básico a 4° Medio)
- **37 OAs** con descripciones detalladas

### Filtrado de OAs
```typescript
// Filtrar OAs por nivel y asignatura
const oasFiltrados = oas.filter(oa => 
  oa.nivel_id === nivelSeleccionado && 
  oa.asignatura_id === asignaturaSeleccionada
)
```

## Troubleshooting

### Problemas Comunes

1. **Error al crear matriz:**
   - Verificar que el total de preguntas coincida con la suma
   - Revisar que todos los campos estén completos

2. **OAs no aparecen:**
   - Verificar que se haya seleccionado nivel y asignatura
   - Revisar que la base de datos tenga OAs cargados

3. **Error de validación:**
   - Revisar que todos los indicadores tengan descripción
   - Verificar que las preguntas sean números positivos

### Logs de Debug
```bash
# Ver matrices en la base de datos
sqlite3 prisma/dev.db 'SELECT * FROM MatrizEspecificacion;'

# Ver OAs asociados
sqlite3 prisma/dev.db 'SELECT * FROM MatrizOA;'
```

## Mejoras Futuras

- [ ] Plantillas predefinidas de matrices
- [ ] Exportación a PDF/Excel
- [ ] Generación automática de preguntas
- [ ] Estadísticas de uso de OAs
- [ ] Colaboración entre docentes
- [ ] Historial de versiones
- [ ] Búsqueda avanzada en matrices 