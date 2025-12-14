#!/bin/bash

# Comandos bloqueados que pueden destruir datos
BLOCKED_COMMANDS=("migrate reset" "db push --force-reset" "migrate dev --create-only")

COMMAND="$*"

for blocked in "${BLOCKED_COMMANDS[@]}"; do
  if [[ "$COMMAND" == *"$blocked"* ]]; then
    echo "❌ BLOQUEADO: 'prisma $blocked' puede destruir datos"
    echo ""
    echo "Comandos seguros:"
    echo "  npm run db:generate   - Regenera cliente"
    echo "  npm run db:studio     - UI de base de datos"
    echo "  npx prisma db pull    - Lee schema de DB"
    echo ""
    echo "Si REALMENTE necesitas este comando, usa directamente:"
    echo "  npx prisma $COMMAND"
    exit 1
  fi
done

# Ejecutar comando seguro
npx prisma "$@"
