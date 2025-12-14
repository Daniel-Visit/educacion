# Install

Install and configure the Educacion App development environment.

## Prerequisites Check

```bash
# Verify Node.js 18+
node --version

# Verify npm
npm --version
```

## Install Dependencies

```bash
# Install all packages
npm install
```

## Environment Setup

```bash
# Check for .env file
ls -la .env .env.local 2>/dev/null || echo "No .env file found"

# Required environment variables:
# DATABASE_URL        - PostgreSQL connection string (or file:./prisma/dev.db for SQLite)
# DIRECT_URL          - Direct PostgreSQL connection (for migrations)
# AUTH_SECRET         - NextAuth secret key
# AUTH_GOOGLE_CLIENT_ID     - Google OAuth client ID
# AUTH_GOOGLE_CLIENT_SECRET - Google OAuth secret
# UPSTASH_REDIS_REST_URL    - Redis for sessions
# UPSTASH_REDIS_REST_TOKEN  - Redis token
# RESEND_API_KEY      - Email service
# NEXT_PUBLIC_SUPABASE_URL  - Supabase storage
# NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase key
```

## Database Setup

```bash
# Generate Prisma client
npx prisma generate

# For development with SQLite (database included)
# No additional setup needed

# For PostgreSQL
# npx prisma db push
```

## Verify Installation

```bash
# Check TypeScript compilation
npm run build 2>&1 | head -20

# Check lint
npm run lint 2>&1 | head -20

# Start dev server (will fail if env vars missing)
# npm run dev
```

## Report

Output status for:

1. Node/npm versions
2. Dependencies installed (node_modules exists)
3. Prisma client generated
4. Environment variables status
5. Build/lint status
6. Ready to run: yes/no with reason
