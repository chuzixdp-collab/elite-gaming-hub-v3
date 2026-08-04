#!/usr/bin/env bash
# Swap Prisma provider based on DATABASE_PROVIDER env var.
# - Local sandbox (DATABASE_PROVIDER=sqlite or unset): keeps SQLite schema.
# - Netlify / production (DATABASE_PROVIDER=postgresql): swaps in the PostgreSQL schema.
# This lets the SAME repo build successfully in both environments.
set -e

SCHEMA_DIR="$(cd "$(dirname "$0")/.." && pwd)/prisma"
PROVIDER="${DATABASE_PROVIDER:-sqlite}"

if [ "$PROVIDER" = "postgresql" ]; then
  echo "[swap-prisma-provider] Switching schema to PostgreSQL (Neon)..."
  if [ -f "$SCHEMA_DIR/schema.prod.prisma" ]; then
    cp "$SCHEMA_DIR/schema.prod.prisma" "$SCHEMA_DIR/schema.prisma"
    echo "[swap-prisma-provider] Done. schema.prisma now uses postgresql."
  else
    echo "[swap-prisma-provider] WARNING: schema.prod.prisma not found. Keeping current schema."
  fi
else
  echo "[swap-prisma-provider] DATABASE_PROVIDER=$PROVIDER — keeping SQLite schema."
fi
