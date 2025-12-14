# Agentic Check

Review the Educacion App codebase for consistency, best practices, and potential issues.

## Checklist

### 1. Prisma Usage (CRITICAL)

- [ ] All routes use `import { prisma } from '@/lib/prisma'` (singleton)
- [ ] No `new PrismaClient()` in route files
- [ ] Transactions used for multi-step operations
- [ ] Foreign keys validated before operations

**Check command:**

```bash
grep -r "new PrismaClient" src/app/api/ --include="*.ts"
```

### 2. API Response Consistency

- [ ] GET endpoints return arrays directly (not `{ data: [...] }`)
- [ ] Error responses use `{ error: 'message' }` format
- [ ] HTTP status codes are appropriate (200, 201, 400, 401, 403, 500)
- [ ] No stack traces in production errors

### 3. Error Handling

- [ ] All routes have try-catch blocks
- [ ] Errors are logged with context
- [ ] Frontend handles error responses gracefully
- [ ] No silent catch blocks that swallow errors

### 4. Component Naming

- [ ] React components use PascalCase: `SaveModal.tsx`
- [ ] Hooks use camelCase with `use` prefix: `use-evaluacion-form.ts`
- [ ] Utility files describe purpose: `evaluacion-utils.ts`

### 5. Type Safety

- [ ] No `any` types in component props
- [ ] API response types defined in `src/types/`
- [ ] Prisma types used where applicable

### 6. Auth Patterns

- [ ] Protected routes check session in middleware
- [ ] Admin routes verify `role === 'admin'`
- [ ] No sensitive data in JWT payload

## Actions

1. **Scan for violations**: Run grep commands above
2. **Report findings**: List specific files and line numbers
3. **Categorize by severity**: CRITICAL / HIGH / MEDIUM / LOW
4. **Suggest fixes**: Provide specific code changes

## Output Format

```
## Agentic Check Report

### CRITICAL Issues
- [file:line] Description of issue

### HIGH Priority
- [file:line] Description of issue

### MEDIUM Priority
- [file:line] Description of issue

### Recommendations
1. Specific actionable recommendation
2. ...

### Status: NEEDS FIXES / ALL GOOD
```
