#!/bin/bash

echo "🔧 Updating import paths in test files..."

# Update imports in unit tests
for file in src/lib/tests/unit/*.ts; do
  if [ -f "$file" ]; then
    echo "  Updating: $(basename $file)"
    # Update relative imports to use $lib
    sed -i '' "s|from '\.\./\.\./|from '\$lib/|g" "$file"
    sed -i '' "s|from '\.\./\.\./\.\./|from '\$lib/|g" "$file"
    sed -i '' "s|from '\.\./domain/|from '\$lib/domain/|g" "$file"
    sed -i '' "s|from '\.\./application/|from '\$lib/application/|g" "$file"
    sed -i '' "s|from '\.\./infrastructure/|from '\$lib/infrastructure/|g" "$file"
    sed -i '' "s|from '\.\./kit/|from '\$lib/kit/|g" "$file"
  fi
done

# Update imports in integration tests
for file in src/lib/tests/integration/*.ts; do
  if [ -f "$file" ]; then
    echo "  Updating: $(basename $file)"
    sed -i '' "s|from '\.\./|from '\$lib/|g" "$file"
    sed -i '' "s|from '\.\./\.\./|from '\$lib/|g" "$file"
    sed -i '' "s|from '\.\./translations/|from '\$lib/translations/|g" "$file"
  fi
done

# Update imports in component tests
for file in src/lib/tests/components/*.ts; do
  if [ -f "$file" ]; then
    echo "  Updating: $(basename $file)"
    sed -i '' "s|from '\.\./\.\./presentation/|from '\$lib/presentation/|g" "$file"
    sed -i '' "s|from '\.\./\.\./|from '\$lib/|g" "$file"
  fi
done

echo "✅ Import paths updated!"