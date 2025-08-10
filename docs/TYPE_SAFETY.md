# Type Safety Guide

## Overview

This i18n library provides comprehensive type safety with TypeScript, ensuring:

- Autocomplete for translation keys
- Type checking for interpolation parameters
- Compile-time validation of translation files
- Build-time error reporting

## Quick Start

### 1. Generate Types

First, generate TypeScript types from your default language JSON:

```bash
npm run i18n:types
```

This creates `src/lib/types/i18n-generated.ts` with all translation keys and parameter types.

### 2. Import from Typed Module

To get type safety, import from `$lib/typed` instead of `$lib`:

```typescript
// ✅ Type-safe import
import { getI18n } from '$lib/typed';

// ❌ Regular import (no type safety)
import { getI18n } from '$lib';
```

### 3. Use with Full Type Safety

```typescript
import { getI18n } from '$lib/typed';

const i18n = getI18n();

// ✅ Valid usage - TypeScript knows these keys exist
i18n.t('welcome', { name: 'John' }); // Autocomplete works!
i18n.t('greeting'); // No params needed
i18n.t('items.count', { count: 5 }); // Nested keys work

// ❌ Invalid usage - TypeScript will show errors
i18n.t('invalid.key'); // Error: Invalid key
i18n.t('welcome'); // Error: Missing required parameter
i18n.t('welcome', { wrong: 'param' }); // Error: Wrong parameter name
```

## Features

### 1. Autocomplete

When you type `i18n.t('`, your editor will show all available translation keys:

- Full path autocomplete (e.g., `user.profile.title`)
- Nested key support
- Instant feedback on typos

### 2. Parameter Type Checking

The library automatically detects parameters in your translations:

```json
{
	"welcome": "Welcome {name}!",
	"items": "You have {count} {count, plural, one {item} other {items}}"
}
```

TypeScript will enforce correct parameter types:

```typescript
// ✅ Correct
i18n.t('welcome', { name: 'John' });
i18n.t('items', { count: 5 });

// ❌ TypeScript errors
i18n.t('welcome'); // Missing params
i18n.t('welcome', { age: 30 }); // Wrong param name
```

### 3. Build-Time Validation

Run validation during build to catch errors:

```bash
npm run check      # Type checking
npm run build      # Build with validation
npm run lint       # Linting with type checks
```

### 4. Language File Validation

The type generator also validates all language files against the default language:

```bash
npm run i18n:validate
```

This will:

- Check for missing keys in other languages
- Verify parameter consistency
- Report structure mismatches
- Show detailed error messages

## Migration Guide

### From Regular Usage

If you're already using the library without type safety:

1. Generate types: `npm run i18n:types`
2. Change imports from `$lib` to `$lib/typed`
3. Fix any TypeScript errors that appear
4. Enjoy type safety!

### Gradual Migration

You can migrate gradually:

```typescript
// Old code (still works)
import { getI18n } from '$lib';

// New code (type-safe)
import { getI18n as getTypedI18n } from '$lib/typed';

// Use both during migration
const i18n = getI18n(); // Old instance
const typedI18n = getTypedI18n(); // New type-safe instance
```

## Configuration

### Type Generation Options

Create a custom script to configure type generation:

```typescript
import { generateTypes } from '$lib/cli/generate-types';

await generateTypes({
	translationsDir: 'src/translations',
	defaultLocale: 'en',
	outputPath: 'src/lib/types/i18n-generated.ts',
	validateOthers: true,
	watch: false
});
```

### Package.json Scripts

Add these scripts for convenience:

```json
{
	"scripts": {
		"i18n:types": "node --loader ts-node/esm src/lib/cli/generate-types.ts",
		"i18n:validate": "node --loader ts-node/esm src/lib/cli/generate-types.ts --validate",
		"i18n:watch": "node --loader ts-node/esm src/lib/cli/generate-types.ts --watch"
	}
}
```

## IDE Support

### VS Code

Type safety works automatically in VS Code with:

- IntelliSense autocomplete
- Red squiggly lines for errors
- Quick fixes for typos

### WebStorm/IntelliJ

Full support with:

- Code completion
- Parameter hints
- Refactoring support

## Troubleshooting

### Types Not Working?

1. Ensure types are generated: `npm run i18n:types`
2. Check import path: must be `$lib/typed`
3. Restart TypeScript service in your IDE
4. Run `npm run check` to verify

### Missing Autocomplete?

1. Check `i18n-generated.ts` exists
2. Verify it's imported in `typed.ts`
3. Ensure your IDE has TypeScript enabled

### Parameter Types Wrong?

1. Regenerate types after changing translations
2. Check JSON syntax for interpolations
3. Verify parameter names match exactly

## Best Practices

1. **Always generate types** after modifying translations
2. **Use CI/CD validation** to catch errors early
3. **Import from `$lib/typed`** for all new code
4. **Run type checks** before committing
5. **Keep translations synchronized** across all languages

## Example Component

```svelte
<script lang="ts">
	import { getI18n } from '$lib/typed';
	import { onMount } from 'svelte';

	const i18n = getI18n();

	let name = 'World';
	let count = 1;

	onMount(async () => {
		await i18n.clientLoad();
	});
</script>

<div>
	<!-- Type-safe translations with autocomplete -->
	<h1>{i18n.t('welcome', { name })}</h1>
	<p>{i18n.t('items.count', { count })}</p>

	<!-- Nested keys work perfectly -->
	<p>{i18n.t('user.profile.title')}</p>
</div>
```

## Advanced Usage

### Custom Type Guards

```typescript
import type { I18nPath } from '$lib/types/i18n-generated';

function isValidKey(key: string): key is I18nPath {
	// TypeScript knows all valid keys
	return true; // Implementation depends on your needs
}

if (isValidKey(userInput)) {
	i18n.t(userInput); // Type-safe!
}
```

### Dynamic Keys with Type Safety

```typescript
import type { I18nPath } from '$lib/types/i18n-generated';

function translate(key: I18nPath, params?: any) {
	return i18n.t(key, params);
}

// Only valid keys allowed
translate('welcome', { name: 'John' }); // ✅
translate('invalid.key'); // ❌ TypeScript error
```
