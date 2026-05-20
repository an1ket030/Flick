#!/usr/bin/env bash
set -e

echo "=== Flick API Build Script ==="
echo "Working directory: $(pwd)"

# Install pnpm if not present
if ! command -v pnpm &> /dev/null; then
  echo "Installing pnpm..."
  npm install -g pnpm@9.15.4
fi

echo "pnpm version: $(pnpm --version)"

# Install all workspace deps from repo root
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# Build the API
echo "Building API..."
cd services/api
pnpm run build

echo "=== Build complete ==="
ls -la dist/
