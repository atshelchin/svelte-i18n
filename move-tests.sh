#!/bin/bash

# Move tests to organized structure

echo "📦 Moving test files to organized structure..."

# Unit tests - core functionality
mv src/lib/domain/services/utils.test.ts src/lib/tests/unit/utils.test.ts 2>/dev/null || true
mv src/lib/application/stores/store.test.ts src/lib/tests/unit/store.test.ts 2>/dev/null || true
mv src/lib/application/stores/language-switching.test.ts src/lib/tests/unit/language-switching.test.ts 2>/dev/null || true
mv src/lib/application/stores/store.svelte.test.ts src/lib/tests/unit/store.svelte.test.ts 2>/dev/null || true

# Unit tests - utilities
mv src/lib/infrastructure/utils/language-search.test.ts src/lib/tests/unit/language-search.test.ts 2>/dev/null || true
mv src/lib/infrastructure/utils/pathname-locale.test.ts src/lib/tests/unit/pathname-locale.test.ts 2>/dev/null || true
mv src/lib/infrastructure/utils/url-locale.test.ts src/lib/tests/unit/url-locale.test.ts 2>/dev/null || true
mv src/lib/infrastructure/loaders/app-languages.test.ts src/lib/tests/unit/app-languages.test.ts 2>/dev/null || true

# Unit tests - kit
mv src/lib/kit/ssr-load.test.ts src/lib/tests/unit/ssr-load.test.ts 2>/dev/null || true

# Integration tests
mv src/lib/config-inheritance.test.ts src/lib/tests/integration/config-inheritance.test.ts 2>/dev/null || true
mv src/lib/config-inheritance-validation.test.ts src/lib/tests/integration/config-inheritance-validation.test.ts 2>/dev/null || true
mv src/lib/locale-sync.test.ts src/lib/tests/integration/locale-sync.test.ts 2>/dev/null || true
mv src/lib/locale-sync.svelte.test.ts src/lib/tests/integration/locale-sync.svelte.test.ts 2>/dev/null || true
mv src/lib/unified-integration.test.ts src/lib/tests/integration/unified-integration.test.ts 2>/dev/null || true
mv src/lib/translations/i18n.test.ts src/lib/tests/integration/i18n.test.ts 2>/dev/null || true

# Component tests
mv src/lib/presentation/components/ValidationPopup.svelte.test.ts src/lib/tests/components/ValidationPopup.svelte.test.ts 2>/dev/null || true
mv src/lib/presentation/components/LanguageSwitcher.svelte.test.ts src/lib/tests/components/LanguageSwitcher.svelte.test.ts 2>/dev/null || true

# Type safety test stays in tests folder
# src/lib/tests/type-safety.test.ts already in the right place

echo "✅ Test files moved successfully!"
echo ""
echo "📊 Test structure:"
echo "  - unit/       : Core functionality and utilities"
echo "  - integration/: Integration and configuration tests"
echo "  - components/ : Component tests"