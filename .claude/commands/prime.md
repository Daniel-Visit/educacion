# Prime

Understand the Educacion App codebase structure and key patterns.

## Run

```bash
git ls-files | head -100
```

## Read

- README.md
- CLAUDE.md
- prisma/schema.prisma (first 100 lines)

## Explore Key Areas

### Project Structure

```
src/
├── app/(app)/     # Protected pages (dashboard, evaluaciones, matrices, horarios)
├── app/api/       # REST API routes
├── app/auth/      # Auth pages (login, password reset)
├── components/    # React components by feature
├── hooks/         # Custom React hooks
├── lib/           # Utilities (prisma, redis, supabase, resend)
└── types/         # TypeScript definitions
```

### Key Patterns

1. **Database**: Prisma ORM with PostgreSQL (prod) / SQLite (dev)
2. **Auth**: NextAuth.js with JWT + Redis session tracking
3. **API**: Direct Prisma calls in route handlers, return arrays directly
4. **State**: React hooks with loading/error states

### Critical Files

- `auth.ts` + `auth.config.ts` - NextAuth configuration
- `src/middleware.ts` - Route protection + token validation
- `src/lib/prisma.ts` - Database client singleton
- `src/lib/auth-redis.ts` - Session management

## Summary Output

Provide:

1. Current branch and git status
2. Database connection status (check .env for DATABASE_URL)
3. Key features identified (evaluaciones, matrices, horarios, planificacion)
4. Any immediate issues detected
