# Educacion App

Plataforma integral de gestión educativa para el currículum chileno.

## Características

- **Editor de contenido** - TipTap con generación IA, upload de imágenes
- **Matrices de especificación** - Gestión de OAs, indicadores y preguntas
- **Planificación anual** - Calendario interactivo con asignación de OAs
- **Evaluaciones** - Creación, corrección y análisis de resultados
- **Horarios** - Gestión de horarios por profesor y nivel
- **Entrevista interactiva** - Sistema de preguntas con TTS
- **Administración de usuarios** - Roles, invitaciones, gestión de sesiones

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Editor:** TipTap 2.23
- **Base de datos:** SQLite (dev) / PostgreSQL (prod) con Prisma ORM
- **Auth:** NextAuth.js con sesiones en Redis
- **Storage:** Supabase
- **Email:** Resend

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env  # Editar con tus valores

# Generar cliente Prisma
npx prisma generate

# Ejecutar desarrollo
npm run dev
```

## Comandos

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run lint         # Linting
npx prisma studio    # GUI de base de datos
npx prisma generate  # Regenerar cliente Prisma
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── (app)/              # Páginas principales (dashboard, matrices, etc.)
│   ├── api/                # REST APIs
│   └── auth/               # Páginas de autenticación
├── components/
│   ├── admin/              # Gestión de usuarios
│   ├── correccion/         # Corrección de evaluaciones
│   ├── editor/             # Editor TipTap
│   ├── entrevista/         # Entrevista interactiva
│   ├── evaluacion/         # Formularios de evaluación
│   ├── event-calendar/     # Calendario de eventos
│   ├── horarios/           # Gestión de horarios
│   ├── matrices/           # Matrices de especificación
│   ├── planificacion-anual/# Planificación anual
│   ├── resultados/         # Visualización de resultados
│   └── ui/                 # Componentes UI base
├── hooks/                  # Custom hooks
├── lib/                    # Utilidades (prisma, redis, supabase)
└── types/                  # TypeScript types
prisma/
├── schema.prisma           # Schema SQLite (dev)
└── schema-postgresql.prisma # Schema PostgreSQL (prod)
scripts-organized/          # Scripts de migración y utilidades
docs/                       # Documentación detallada
```

## Base de Datos

Datos precargados:

- 13 asignaturas del currículum chileno
- 12 niveles educativos (1° Básico a 4° Medio)
- 12 metodologías de enseñanza
- 37+ Objetivos de Aprendizaje (OAs)

## API Endpoints

| Endpoint                       | Descripción                |
| ------------------------------ | -------------------------- |
| `/api/asignaturas`             | Asignaturas                |
| `/api/niveles`                 | Niveles educativos         |
| `/api/oas`                     | Objetivos de aprendizaje   |
| `/api/matrices`                | Matrices de especificación |
| `/api/evaluaciones`            | Evaluaciones               |
| `/api/resultados-evaluaciones` | Resultados                 |
| `/api/horarios`                | Horarios                   |
| `/api/planificaciones`         | Planificaciones anuales    |
| `/api/profesores`              | Profesores                 |
| `/api/archivos`                | Archivos guardados         |
| `/api/admin/users`             | Gestión de usuarios        |

## Documentación

Ver `/docs` para documentación detallada:

- [API](docs/API.md)
- [Base de datos](docs/DATABASE.md)
- [Arquitectura](docs/ARQUITECTURA.md)
- [Evaluaciones](docs/EVALUACIONES.md)
- [Testing](docs/TESTING_STRATEGY.md)
