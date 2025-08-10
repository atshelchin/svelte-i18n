# Type Safety Guide for External Applications

This library provides a factory function that allows external applications to have complete TypeScript type safety for their i18n keys!

## For External Applications Using This Package

### 1. Install the package

```bash
npm install @shelchin/svelte-i18n
```

### 2. Generate types from your translation files

Create your translation files in your application:

```
src/translations/
  └── app/
      ├── en.json    # Default language (required)
      ├── zh.json
      ├── es.json
      └── ...
```

Run the type generator:

```bash
npx @shelchin/svelte-i18n generate-types
```

This will create `src/types/i18n-generated.ts` with all your translation paths as TypeScript types.

### 3. Create a typed i18n module in your application

Create `src/lib/i18n.ts` (or any location you prefer):

```typescript
import { createTypedI18n } from '@shelchin/svelte-i18n';
import type { I18nPath } from '../types/i18n-generated';

// Create typed versions using YOUR app's translation types
export const { getI18n, setupI18n } = createTypedI18n<I18nPath>();
```

### 4. Use the typed i18n in your components

```svelte
<script lang="ts">
	// Import from YOUR app's i18n module, not directly from the package
	import { getI18n } from '$lib/i18n';

	const i18n = getI18n();

	// ✅ Valid - TypeScript knows this key exists
	i18n.t('demo.quickStart');

	// ❌ Invalid - TypeScript will show an error
	i18n.t('demo.quickStart123');
	// Error: Argument of type '"demo.quickStart123"' is not assignable to parameter of type 'I18nPath'
</script>
```

## Key Points

1. **Types are generated in YOUR application** - The package doesn't include any hardcoded types
2. **You control the types** - Your `I18nPath` type is generated from YOUR translation files
3. **Full IntelliSense** - Get autocomplete for all your translation keys
4. **Compile-time safety** - Invalid keys are caught during build

## Example Project Structure

```
your-app/
├── src/
│   ├── lib/
│   │   └── i18n.ts          # Your typed i18n module
│   ├── translations/
│   │   └── app/
│   │       ├── en.json      # Your translations
│   │       └── zh.json
│   ├── types/
│   │   └── i18n-generated.ts # Generated types (created by CLI)
│   └── routes/
│       └── +page.svelte     # Use typed i18n here
└── package.json
```

## Benefits

- **No hardcoded types in the package** - The library is completely generic
- **Your types, your control** - Types are generated from YOUR translation files
- **Easy to update** - Just re-run `generate-types` when you add new translations
- **Works with any project structure** - You decide where to put your files

## For Library Development (This Repository)

The `src/lib/app-i18n.ts` file in this repository is just an EXAMPLE showing how external applications should use the library. It's not meant to be imported by external users.
