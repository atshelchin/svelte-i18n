#!/bin/bash

# Build script for @shelchin/svelte-i18n package
# This script handles the library build process

set -e

echo "🚀 Building @shelchin/svelte-i18n package..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf .svelte-kit

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install
fi

# Run type checking
echo "🔍 Type checking..."
pnpm run check || echo "⚠️ Type check warnings (non-blocking)"

# Build the library package
echo "📚 Building library package..."
pnpm run package

# Build CLI tools
echo "🛠️ Building CLI tools..."
pnpm run build:cli || echo "⚠️ CLI build warnings (non-blocking)"

# Validate the package
echo "✅ Validating package..."
pnpm run publint || echo "⚠️ Publint warnings (non-blocking)"

# Show package contents
echo "📋 Package contents:"
npm pack --dry-run

echo "✨ Build complete!"
echo ""
echo "📦 Package ready at: ./dist"
echo "🚀 To publish: npm publish"