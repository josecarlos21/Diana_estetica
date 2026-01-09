#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/commit-and-push.sh "mensaje del commit" [rama]
# Hace commit de todos los cambios (respeta .gitignore) y hace push al remoto.

commit_msg="${1:-}"
branch="${2:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)}"

if [[ -z "$commit_msg" ]]; then
  echo "❌ Falta el mensaje de commit."
  echo "Uso: ./scripts/commit-and-push.sh \"mensaje\" [rama]"
  exit 1
fi

# Confirma que estamos dentro de un repo git
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ No es un repositorio git."
  exit 1
fi

# Asegura que haya remoto configurado
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "❌ No hay remoto 'origin'. Configúralo con:"
  echo "   git remote add origin <URL-del-repo>"
  exit 1
fi

echo "➕ Staging de cambios..."
git add -A

echo "📝 Creando commit..."
git commit -m "$commit_msg"

echo "📤 Haciendo push a origin/$branch..."
git push origin "$branch"

echo "✅ Listo. Revisa GitHub para ver el workflow de deploy."
