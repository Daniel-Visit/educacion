# 📊 Sistema de Corrección de Evaluaciones

## 🎯 Descripción General

El sistema de corrección de evaluaciones permite cargar y procesar resultados de evaluaciones desde archivos CSV, calcular puntuaciones automáticamente y almacenar los datos para análisis posterior.

## 🚀 Funcionalidades Implementadas

### 1. **Carga de Resultados**
- **Formato CSV soportado**: `ID;NOMBRE;RESPUESTA;PREGUNTA`
- **Detección automática**: Separa por punto y coma (;) o coma (,)
- **Validación de datos**: Verifica que los datos sean válidos antes de procesar
- **Preview en tiempo real**: Muestra las primeras 5 filas del archivo antes de cargar

### 2. **Procesamiento Automático**
- **Creación de alumnos**: Genera automáticamente registros de alumnos desde el CSV
- **Cálculo de puntuaciones**: Compara respuestas con alternativas correctas
- **Escala de notas**: Convierte porcentajes a escala 1-7
- **Almacenamiento estructurado**: Guarda resultados en múltiples tablas relacionadas

### 3. **Base de Datos**
- **Tabla Alumno**: Almacena información de estudiantes
- **Tabla ResultadoEvaluacion**: Registra cada carga de resultados
- **Tabla ResultadoAlumno**: Puntuaciones individuales por alumno
- **Tabla RespuestaAlumno**: Respuestas específicas por pregunta

## 📁 Estructura de Archivos

```
src/
├── app/
│   ├── correccion-evaluaciones/
│   │   └── page.tsx                    # Página principal de carga
│   └── api/
│       └── evaluaciones/
│           └── resultados/
│               └── route.ts            # API para procesar CSV
├── components/
│   └── correccion/
│       └── CargarResultadosModal.tsx   # Modal de carga de archivos
└── lib/
    └── prisma.ts                       # Cliente de base de datos
```

## 🗄️ Modelos de Base de Datos

### Alumno
```prisma
model Alumno {
  id        Int      @id @default(autoincrement())
  rut       String   @unique
  nombre    String
  apellido  String
  curso     String?
  nivelId   Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  nivel     nivel?   @relation(fields: [nivelId], references: [id])
  resultados ResultadoAlumno[]
}
```

### ResultadoEvaluacion
```prisma
model ResultadoEvaluacion {
  id           Int               @id @default(autoincrement())
  nombre       String
  evaluacionId Int
  fechaCarga   DateTime          @default(now())
  totalAlumnos Int
  escalaNota   Float             @default(7.0)
  resultados   ResultadoAlumno[]
  evaluacion   Evaluacion        @relation(fields: [evaluacionId], references: [id])
}
```

### ResultadoAlumno
```prisma
model ResultadoAlumno {
  id                    Int                 @id @default(autoincrement())
  resultadoEvaluacionId Int
  alumnoId              Int
  puntajeTotal          Float
  puntajeMaximo         Float
  porcentaje            Float
  nota                  Float
  respuestas            RespuestaAlumno[]
  resultadoEvaluacion   ResultadoEvaluacion @relation(fields: [resultadoEvaluacionId], references: [id], onDelete: Cascade)
  alumno                Alumno             @relation(fields: [alumnoId], references: [id], onDelete: Cascade)
}
```

### RespuestaAlumno
```prisma
model RespuestaAlumno {
  id                Int             @id @default(autoincrement())
  resultadoAlumnoId Int
  preguntaId        Int
  alternativaDada   String
  esCorrecta        Boolean
  puntajeObtenido   Float
  pregunta          Pregunta        @relation(fields: [preguntaId], references: [id])
  resultadoAlumno   ResultadoAlumno @relation(fields: [resultadoAlumnoId], references: [id], onDelete: Cascade)
}
```

## 🔌 APIs

### POST /api/evaluaciones/resultados

**Propósito**: Procesa archivo CSV con resultados de evaluación

**Parámetros**:
- `file`: Archivo CSV (FormData)
- `evaluacionId`: ID de la evaluación (FormData)

**Formato CSV soportado**:
```csv
ID;NOMBRE;RESPUESTA;PREGUNTA
1;Juan Pérez;A;1
2;María González;B;1
1;Juan Pérez;C;2
```

**Respuesta exitosa**:
```json
{
  "success": true,
  "message": "Resultados cargados exitosamente",
  "data": {
    "resultadoId": 1,
    "totalAlumnos": 25,
    "totalRespuestas": 150,
    "evaluacion": "Matriz de Matemáticas 5° Básico"
  }
}
```

**Respuesta de error**:
```json
{
  "error": "Formato de archivo no reconocido. Headers encontrados: id, nombre, respuesta, pregunta"
}
```

## 🎨 Interfaz de Usuario

### Página Principal (/correccion-evaluaciones)

**Componentes**:
- **Header**: Título y estadísticas generales
- **Selector de evaluación**: Dropdown para elegir evaluación
- **Botón de carga**: Abre modal para subir archivo CSV
- **Información de evaluación**: Cards con detalles de la evaluación seleccionada

**Estados**:
- **Sin evaluación seleccionada**: Solo muestra selector
- **Con evaluación seleccionada**: Muestra botón de carga y detalles
- **Sin evaluaciones**: Mensaje para crear evaluaciones primero

### Modal de Carga

**Secciones**:
1. **Información del formato**: Explica los formatos CSV soportados
2. **Área de carga**: Drag & drop o click para seleccionar archivo
3. **Preview de datos**: Tabla con las primeras 5 filas del CSV
4. **Botones de acción**: Cancelar y Cargar Resultados

**Características**:
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Header fijo**: Permanece visible durante scroll
- **Validación visual**: Muestra estado del archivo seleccionado
- **Feedback**: Mensajes de éxito y error

## 🔧 Configuración y Uso

### 1. Preparar Archivo CSV

**Formato requerido**:
```csv
ID;NOMBRE;RESPUESTA;PREGUNTA
1;Juan Pérez;A;1
2;María González;B;1
1;Juan Pérez;C;2
```

**Campos**:
- `ID`: Identificador único del alumno
- `NOMBRE`: Nombre completo del alumno
- `RESPUESTA`: Alternativa marcada (A, B, C, D)
- `PREGUNTA`: Número de la pregunta

### 2. Cargar Resultados

1. **Navegar** a `/correccion-evaluaciones`
2. **Seleccionar** una evaluación del dropdown
3. **Hacer clic** en "Cargar Resultados"
4. **Arrastrar** o seleccionar archivo CSV
5. **Revisar** preview de datos
6. **Confirmar** carga

### 3. Verificar Resultados

Los resultados se almacenan automáticamente y pueden ser consultados en la pantalla de "Ver Resultados".

## 🚨 Solución de Problemas

### Error: "Formato de archivo no reconocido"

**Causa**: Headers del CSV no coinciden con el formato esperado
**Solución**: Verificar que el CSV tenga las columnas: `ID`, `NOMBRE`, `RESPUESTA`, `PREGUNTA`

### Error: "Error interno del servidor"

**Causa**: Problema en el procesamiento de datos
**Solución**:
1. Verificar que la evaluación tenga preguntas y alternativas correctas
2. Revisar logs del servidor para detalles específicos
3. Regenerar cliente Prisma: `npx prisma generate`

### Error: "Null constraint violation"

**Causa**: Campo requerido está vacío en el CSV
**Solución**: Verificar que todas las filas tengan datos completos

### Preview no se muestra correctamente

**Causa**: Separador de columnas no detectado automáticamente
**Solución**: Asegurar que el CSV use punto y coma (;) como separador

## 🔄 Flujo de Datos

1. **Usuario selecciona evaluación** → Se cargan preguntas y alternativas correctas
2. **Usuario sube CSV** → Se valida formato y se muestra preview
3. **Usuario confirma carga** → Se procesan datos:
   - Crear/actualizar alumnos
   - Calcular puntuaciones
   - Crear resultado de evaluación
   - Crear resultados por alumno
   - Crear respuestas individuales
4. **Respuesta exitosa** → Se cierra modal y se actualiza lista

## 📊 Métricas y Estadísticas

### Datos calculados automáticamente:
- **Puntaje total**: Suma de respuestas correctas
- **Puntaje máximo**: Total de preguntas respondidas
- **Porcentaje**: (Puntaje total / Puntaje máximo) × 100
- **Nota**: (Porcentaje / 100) × 7.0 (escala 1-7)

### Información almacenada:
- **Resultados por alumno**: Puntuaciones individuales
- **Respuestas específicas**: Cada respuesta con su corrección
- **Metadatos**: Fecha de carga, total de alumnos, escala de notas

## 🔮 Próximas Funcionalidades

### En Desarrollo:
- **Visualización de resultados**: Gráficos y análisis detallado
- **Exportación de reportes**: PDF y Excel
- **Comparación de evaluaciones**: Análisis entre diferentes cargas
- **Filtros avanzados**: Por alumno, pregunta, rango de notas

### Planificadas:
- **Corrección manual**: Interfaz para corregir respuestas individuales
- **Importación masiva**: Múltiples archivos simultáneos
- **Validación avanzada**: Reglas personalizadas de validación
- **Integración con LMS**: Conexión con sistemas externos

## 📝 Notas de Desarrollo

### Consideraciones Técnicas:
- **Transacciones**: Todas las operaciones de base de datos están en transacciones
- **Validación**: Múltiples niveles de validación (frontend y backend)
- **Performance**: Procesamiento optimizado para archivos grandes
- **Seguridad**: Validación de tipos y sanitización de datos

### Mejores Prácticas:
- **Error handling**: Manejo robusto de errores en todos los niveles
- **Logging**: Logs detallados para debugging
- **Testing**: Cobertura de tests para funcionalidades críticas
- **Documentación**: Código documentado y APIs bien definidas 