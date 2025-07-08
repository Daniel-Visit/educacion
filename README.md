# 🎓 Plataforma Educativa - Educacion App

Una plataforma integral para la gestión educativa que incluye planificación de clases, materiales de apoyo, entrevistas interactivas y gestión de matrices de especificación.

## 🚀 Características Principales

### 📝 **Editor de Contenido Avanzado**
- Editor TipTap con funcionalidades completas de edición
- Guardado y carga de planificaciones y materiales
- Upload de imágenes integrado
- Generación de contenido con IA
- Interfaz moderna y responsive

### 🎯 **Gestión de Matrices de Especificación**
- Creación y edición de matrices
- Gestión de OAs (Objetivos de Aprendizaje)
- Indicadores y preguntas
- Interfaz intuitiva para docentes

### 🎤 **Entrevista Interactiva**
- Sistema de preguntas y respuestas
- Text-to-Speech integrado
- Interfaz conversacional
- Generación de resúmenes

### 📊 **Base de Datos Educativa**
- 13 asignaturas del currículum chileno
- 12 niveles educativos (1° Básico a 4° Medio)
- 12 metodologías de enseñanza
- 37 Objetivos de Aprendizaje (OAs)

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Next.js 15, React 19, TypeScript
- **Editor:** TipTap 2.23
- **Base de Datos:** SQLite con Prisma ORM
- **Estilos:** Tailwind CSS 4, SASS
- **UI Components:** Headless UI, Floating UI
- **Iconos:** Lucide React

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm, yarn, pnpm o bun

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Daniel-Visit/educacion.git
cd educacion
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar la base de datos (SIMPLIFICADO)**
```bash
# Crear archivo .env con la URL de la base de datos
echo DATABASE_URL="file:./dev.db" > .env

# Generar el cliente de Prisma (la base de datos ya está incluida)
npx prisma generate
```

4. **Ejecutar el servidor de desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 🗂️ Estructura del Proyecto

```
educacion-app/
├── src/
│   ├── app/                    # Páginas de Next.js App Router
│   │   ├── api/               # APIs REST
│   │   ├── editor/            # Editor de contenido
│   │   ├── entrevista/        # Entrevista interactiva
│   │   ├── matrices/          # Gestión de matrices
│   │   └── simple/            # Editor simple
│   ├── components/            # Componentes React
│   │   ├── editor/           # Componentes del editor
│   │   ├── entrevista/       # Componentes de entrevista
│   │   ├── tiptap-*          # Componentes TipTap
│   │   └── ui/               # Componentes UI básicos
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilidades y configuraciones
│   └── styles/               # Estilos SCSS
├── prisma/                   # Configuración de base de datos
├── scripts-restauracion/     # Scripts de restauración
└── public/                   # Archivos estáticos
```

## 🎮 Uso de la Aplicación

### Editor de Contenido
1. Navega a `/editor`
2. Selecciona entre "Planificación de Clase" o "Material de Apoyo"
3. Usa el editor TipTap para crear contenido
4. Guarda tu trabajo con el botón "Guardar"
5. Carga archivos existentes desde el FAB flotante

### Gestión de Matrices
1. Ve a `/matrices` para ver todas las matrices
2. Crea una nueva matriz con `/matrices/crear`
3. Edita matrices existentes desde la lista
4. Gestiona OAs e indicadores

### Entrevista Interactiva
1. Accede a `/entrevista`
2. Responde las preguntas interactivamente
3. Escucha las respuestas con TTS
4. Revisa el resumen generado

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Linting del código

# Base de datos
npx prisma studio    # Interfaz visual de la BD
npx prisma generate  # Regenerar cliente Prisma
npx prisma db push   # Aplicar cambios al esquema

# Base de datos (ya incluida)
# La base de datos completa con todos los datos ya está incluida en el repositorio
# No es necesario restaurar nada manualmente
```

## 📊 Base de Datos

### Tablas Principales
- **asignatura:** 13 asignaturas del currículum
- **nivel:** 12 niveles educativos
- **metodologia:** 12 metodologías de enseñanza
- **oa:** 37 Objetivos de Aprendizaje
- **archivo:** Contenido guardado del editor
- **imagen:** Imágenes subidas por usuarios
- **MatrizEspecificacion:** Matrices de especificación

### Base de Datos Completa
La base de datos SQLite (`prisma/dev.db`) ya incluye todos los datos:
- 13 asignaturas del currículum chileno
- 12 niveles educativos
- 12 metodologías de enseñanza
- 37 Objetivos de Aprendizaje (OAs)
- Archivos de ejemplo
- No es necesario restaurar nada manualmente

## 🔒 Seguridad y Respaldo

- **Respaldo automático:** La base de datos se respalda automáticamente
- **Scripts de restauración:** Sistema modular para restaurar datos específicos
- **Validación de datos:** Verificación de integridad en todas las operaciones

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para la comunidad educativa**
