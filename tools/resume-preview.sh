#!/usr/bin/env bash
# ==============================================================
#  resume-preview.sh
#
#  Memulihkan preview lokal setelah sandbox di-reset:
#    1. node_modules dibuang saat snapshot -> npm install ulang
#    2. branch lokal tertinggal di commit lama -> diselaraskan
#       ke origin/<branch> (working tree TIDAK ditimpa)
#    3. server vite dijalankan di 0.0.0.0:3000
#
#  Pakai:  bash tools/resume-preview.sh
# ==============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

BRANCH="${BRANCH:-arena/fcdc25b6-knife}"
PORT="${PORT:-3000}"

# 1. dependensi
if [ ! -x node_modules/.bin/vite ]; then
  echo "==> node_modules hilang, menjalankan npm install ..."
  npm install --no-audit --no-fund
else
  echo "==> node_modules sudah ada"
fi

# 2. selaraskan pointer branch lokal dengan remote (file kerja tetap utuh)
if git rev-parse --verify "origin/$BRANCH" >/dev/null 2>&1; then
  git fetch origin "$BRANCH" >/dev/null 2>&1 || true
  git reset --mixed "origin/$BRANCH" >/dev/null 2>&1 || true
  echo "==> branch diselaraskan ke origin/$BRANCH ($(git log --oneline -1))"
fi

# 3. jalankan dev server
echo "==> menjalankan vite dev di 0.0.0.0:${PORT} ..."
exec npm run dev -- --port "$PORT"
