# 📝 Editor de Contenido

## Descripción General

El editor de contenido es el núcleo de la plataforma educativa, permitiendo a los docentes crear y gestionar planificaciones de clase y materiales de apoyo con un editor TipTap avanzado.

## Características Principales

### ✨ Funcionalidades del Editor
- **Editor TipTap completo** con todas las extensiones necesarias
- **Guardado y carga** de archivos con persistencia en base de datos
- **Upload de imágenes** con almacenamiento Base64
- **Generación con IA** para planificaciones (con modal de metodologías)
- **Limpieza automática** al cambiar entre tipos de contenido
- **Interfaz responsive** y moderna

### 🎨 Extensiones TipTap Implementadas
- **Formato de texto:** Bold, Italic, Underline, Strike, Subscript, Superscript
- **Encabezados:** H1-H6 con dropdown
- **Listas:** Ordenadas, no ordenadas, tareas
- **Alineación:** Izquierda, centro, derecha, justificado
- **Enlaces:** Con validación y preview
- **Imágenes:** Upload y gestión
- **Código:** Bloques de código con syntax highlighting
- **Citas:** Blockquotes
- **Resaltado:** Colores personalizables
- **Deshacer/Rehacer:** Control de historial

## Estructura de Archivos

```
src/app/editor/
└── page.tsx                    # Página principal del editor

src/components/editor/
├── FabPlanificaciones.tsx      # FAB para cargar archivos
├── ModalIA.tsx                 # Modal de generación con IA
├── SaveContentModal.tsx        # Modal de guardado
├── SavedContentList.tsx        # Lista de archivos guardados
└── SidebarEditor.tsx           # Sidebar con selector de tipo

src/hooks/
├── use-content-save.ts         # Hook para guardado/carga
└── use-image-upload.ts         # Hook para upload de imágenes

src/app/api/
├── archivos/
│   ├── route.ts               # CRUD de archivos
│   └── [id]/route.ts          # Operaciones por ID
└── imagenes/
    ├── route.ts               # CRUD de imágenes
    └── [id]/route.ts          # Servir imágenes
```

## Uso del Editor

### 1. Acceso al Editor
```bash
# Navegar a la página del editor
http://localhost:3000/editor
```

### 2. Selección de Tipo de Contenido
- **Planificación de Clase:** Para crear planificaciones detalladas
- **Material de Apoyo:** Para crear materiales para estudiantes

### 3. Creación de Contenido
1. Selecciona el tipo de contenido en la sidebar
2. Usa la barra de herramientas para formatear texto
3. Sube imágenes con el botón de imagen
4. Guarda tu trabajo con "Guardar" o "Guardar Cambios"

### 4. Carga de Archivos Existentes
1. Haz clic en el FAB flotante (botón circular)
2. Selecciona el archivo que quieres cargar
3. El contenido se cargará automáticamente en el editor

## APIs del Editor

### Archivos (`/api/archivos`)

#### GET `/api/archivos`
Obtiene todos los archivos filtrados por tipo.
```typescript
// Query parameters
{
  tipo?: 'planificacion' | 'material'
}
```

#### POST `/api/archivos`
Crea un nuevo archivo.
```typescript
{
  titulo: string
  tipo: 'planificacion' | 'material'
  contenido: string // JSON de TipTap
}
```

#### PUT `/api/archivos/[id]`
Actualiza un archivo existente.
```typescript
{
  titulo?: string
  contenido?: string
}
```

#### DELETE `/api/archivos/[id]`
Elimina un archivo.

### Imágenes (`/api/imagenes`)

#### POST `/api/imagenes`
Sube una nueva imagen.
```typescript
{
  nombre: string
  tipo: string // MIME type
  data: string // Base64
  tamaño: number
}
```

#### GET `/api/imagenes/[id]`
Sirve la imagen como respuesta de imagen.

## Hooks Personalizados

### use-content-save
```typescript
const {
  saveContent,
  loadContent,
  savedFiles,
  isLoading,
  error
} = useContentSave(tipoContenido)
```

### use-image-upload
```typescript
const {
  uploadImage,
  isUploading,
  uploadError
} = useImageUpload()
```

## Base de Datos

### Tabla `Archivo`
```sql
CREATE TABLE Archivo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `Imagen`
```sql
CREATE TABLE Imagen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  data TEXT NOT NULL, -- Base64
  tamaño INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `ArchivoImagen`
```sql
CREATE TABLE ArchivoImagen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  archivoId INTEGER,
  imagenId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (archivoId) REFERENCES Archivo(id) ON DELETE CASCADE,
  FOREIGN KEY (imagenId) REFERENCES Imagen(id) ON DELETE CASCADE,
  UNIQUE(archivoId, imagenId)
);
```

## Configuración del Editor

### TipTap Configuration
```typescript
// src/components/tiptap-templates/simple/simple-editor.tsx
const extensions = [
  StarterKit,
  Image,
  Link,
  TextAlign,
  Highlight,
  Underline,
  Subscript,
  Superscript,
  TaskList,
  TaskItem,
  Typography
]
```

### Estilos
- **SCSS:** `src/components/tiptap-templates/simple/simple-editor.scss`
- **Variables:** `src/styles/_variables.scss`
- **Animaciones:** `src/styles/_keyframe-animations.scss`

## Flujo de Trabajo Típico

1. **Crear nuevo contenido:**
   - Seleccionar tipo (planificación/material)
   - Editor se limpia automáticamente
   - Crear contenido con TipTap
   - Guardar con nombre descriptivo

2. **Editar contenido existente:**
   - Cargar archivo desde FAB
   - Realizar modificaciones
   - Guardar cambios (actualiza archivo existente)

3. **Generar con IA:**
   - Planificación: Abre modal de metodologías
   - Material: Generación directa
   - Integrar contenido generado en editor

## Troubleshooting

### Problemas Comunes

1. **Editor no carga contenido:**
   - Verificar formato JSON de TipTap
   - Revisar consola para errores de parsing

2. **Imágenes no se muestran:**
   - Verificar que la imagen se subió correctamente
   - Revisar tamaño de archivo (máximo 5MB)

3. **Error al guardar:**
   - Verificar conexión a base de datos
   - Revisar que el título no esté vacío

### Logs de Debug
```bash
# Ver logs del servidor
npm run dev

# Ver logs de Prisma
npx prisma studio
```

## Mejoras Futuras

- [ ] Exportación a PDF
- [ ] Plantillas predefinidas
- [ ] Colaboración en tiempo real
- [ ] Versionado de archivos
- [ ] Búsqueda avanzada
- [ ] Etiquetas y categorías 