# CLAUDE.md

## Commands

```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma studio    # Database GUI
```

## Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 4 + SASS
- Prisma ORM (SQLite dev / PostgreSQL prod)
- NextAuth.js + Redis sessions
- TipTap editor, Supabase storage, Resend email

## Structure

- `src/app/(app)/` - Main pages (dashboard, matrices, evaluaciones, horarios, planificacion-anual)
- `src/app/api/` - REST endpoints
- `src/components/` - React components by feature
- `src/hooks/` - Custom hooks
- `src/lib/` - Prisma, Redis, Supabase, utils
- `prisma/schema.prisma` - Database schema

## Key Patterns

### Database Access

- ALWAYS use `import { prisma } from '@/lib/prisma'` (singleton)
- NEVER use `new PrismaClient()` in route files
- Use transactions for multi-step operations:
  ```typescript
  await prisma.$transaction(async (tx) => {
    await tx.user.create({ ... });
    await tx.account.create({ ... });
  });
  ```

### API Responses

- GET endpoints return arrays directly, not `{ data: [] }`
- Validate arrays in frontend: `Array.isArray(data) ? data : []`
- Error format: `{ error: 'message' }` with appropriate status code
- Always wrap in try-catch with proper error logging

### File Naming

- Components: `kebab-case.tsx` (e.g., `save-modal.tsx`)
- Hooks: `use-{name}.ts` (e.g., `use-evaluacion-form.ts`)
- Utilities: `{purpose}-utils.ts` (e.g., `evaluacion-utils.ts`)

### Logging

- Development only: wrap in `if (process.env.NODE_ENV === 'development')`
- Use `console.error` for actual errors only
- No emoji logging in production code

## Critical Files

- `auth.ts` + `auth.config.ts` - NextAuth config
- `src/middleware.ts` - Route protection
- `src/lib/prisma.ts` - Database client singleton
- `src/lib/auth-redis.ts` - Session management

## Spanish/English

- UI text: Spanish
- Code (variables, functions, comments): English
