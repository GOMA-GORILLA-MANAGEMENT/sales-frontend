#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Security scan: EShop-Frontend ==="

echo "[1/4] Scanning config files for malware patterns..."
PATTERNS='global\.i=|_0x[0-9a-f]{4,}|createRequire\(import\.meta|child_process|drpc\.org|blockscout|eval\(|new Function'
if rg -n "$PATTERNS" --glob '*.js' --glob '*.cjs' --glob '*.mjs' --glob '*.jsx' --glob '*.ts' --glob '*.json' --glob '!node_modules' --glob '!dist' .; then
  echo "FAIL: suspicious patterns found"
  exit 1
fi
echo "OK: no suspicious patterns in source/config files"

echo "[2/4] Checking config file sizes (infected tailwind was ~31KB)..."
for file in tailwind.config.js vite.config.js postcss.config.js eslint.config.js; do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file")
    echo "  $file: ${size} bytes"
    if [ "$file" = "tailwind.config.js" ] && [ "$size" -gt 2000 ]; then
      echo "FAIL: tailwind.config.js unexpectedly large"
      exit 1
    fi
  fi
done
echo "OK: config file sizes look normal"

echo "[3/4] npm audit (high/critical)..."
npm audit --audit-level=high || {
  echo "WARN: npm audit reported high/critical issues (review before deploy)"
}

echo "[4/4] Production build..."
VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://api.sales.rw}" \
VITE_ENCRYPTION_KEY="${VITE_ENCRYPTION_KEY:-test-encryption-key-32-characters-long}" \
npm run build

echo "=== Security scan passed ==="
