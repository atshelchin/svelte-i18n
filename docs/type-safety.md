# Type Safety Guide

@shelchin/svelte-i18n provides complete type safety for your translations, catching errors at compile time.

## Generating Types

### Using the CLI

```bash
npx svelte-i18n generate-types ./translations/en.json ./src/i18n.d.ts
```

This generates:

- Type-safe translation keys
- Parameter types for interpolations
- Namespace definitions

### Generated Type Example

```typescript
// src/i18n.d.ts (auto-generated)
export interface TranslationTypesSchema {
	welcome: string;
	nav: {
		home: string;
		about: string;
		contact: string;
	};
	user: {
		profile: {
			title: string;
			name: string;
		};
	};
}

export type TranslationTypesKeys =
	| 'welcome'
	| 'nav'
	| 'nav.home'
	| 'nav.about'
	| 'nav.contact'
	| 'user'
	| 'user.profile'
	| 'user.profile.title'
	| 'user.profile.name';

export interface TranslationTypesParams {
	welcome: { name: string | number };
}
```

## Using Types in Your Code

### Basic Type Safety

```typescript
import { getI18n } from '@shelchin/svelte-i18n';
import type { TranslationTypesKeys } from './i18n';

const i18n = getI18n();

// ✅ Valid keys
i18n.t('welcome', { name: 'Alice' });
i18n.t('nav.home');
i18n.t('user.profile.title');

// ❌ TypeScript errors
i18n.t('welcom'); // Typo caught!
i18n.t('nav.hom'); // Typo caught!
i18n.t('nonexistent.key'); // Invalid key caught!
```

### Typed Translation Function

```typescript
// Create a fully typed wrapper
import type { TranslationTypesKeys, TranslationTypesParams } from './i18n';

type TypedT = {
	<K extends keyof TranslationTypesParams>(key: K, params: TranslationTypesParams[K]): string;
	(key: Exclude<TranslationTypesKeys, keyof TranslationTypesParams>): string;
};

// Use it
const t: TypedT = i18n.t;

t('welcome', { name: 'Alice' }); // ✅ Params required and typed
t('nav.home'); // ✅ No params needed
t('welcome'); // ❌ Error: Missing params
```

## Namespace Types

For libraries and micro-frontends:

### Define Library Types

```typescript
// my-library/src/i18n.d.ts
declare module '@shelchin/svelte-i18n' {
	interface NamespaceTypes {
		'my-library': {
			schema: MyLibrarySchema;
			keys: MyLibraryKeys;
			params: MyLibraryParams;
		};
	}
}
```

### Use with Namespace

```typescript
import { setupI18n } from '@shelchin/svelte-i18n';

const i18n = setupI18n({
	namespace: 'my-library',
	defaultLocale: 'en'
});

// Types are automatically inferred for this namespace
```

## IDE Integration

### VS Code Setup

1. Install TypeScript extension
2. Generate types: `npx svelte-i18n generate-types`
3. Restart TypeScript server: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

Now you get:

- Autocomplete for translation keys
- Red squiggles for invalid keys
- Parameter hints for interpolations
- Go-to-definition for keys

### WebStorm/IntelliJ Setup

1. Generate types as above
2. File → Invalidate Caches and Restart
3. Types are automatically recognized

## Advanced Patterns

### Typed Key Lists

```typescript
// Get all keys as an array
import type { TranslationTypesKeys } from './i18n';

const allKeys: TranslationTypesKeys[] = [
	'welcome',
	'nav.home',
	'nav.about'
	// TypeScript ensures these are valid
];
```

### Type-Safe Key Validation

```typescript
function isValidKey(key: string): key is TranslationTypesKeys {
	const validKeys: TranslationTypesKeys[] = [
		'welcome',
		'nav.home'
		// ... all valid keys
	];
	return validKeys.includes(key as TranslationTypesKeys);
}

// Use it
const userInput = 'nav.home';
if (isValidKey(userInput)) {
	i18n.t(userInput); // ✅ Type-safe!
}
```

### Component Props

```typescript
interface Props {
  titleKey: TranslationTypesKeys;
  descriptionKey?: TranslationTypesKeys;
}

export function MyComponent({ titleKey, descriptionKey }: Props) {
  const i18n = getI18n();

  return (
    <div>
      <h1>{i18n.t(titleKey)}</h1>
      {descriptionKey && <p>{i18n.t(descriptionKey)}</p>}
    </div>
  );
}
```

## Best Practices

1. **Generate types in CI** - Add to your build pipeline
2. **Commit generated types** - Keep them in version control
3. **Re-generate after changes** - Update types when translations change
4. **Use strict TypeScript** - Enable `strict: true` in tsconfig.json
5. **Type your components** - Accept translation keys as typed props

## Troubleshooting

### Types not working?

1. Ensure types are generated: `npx svelte-i18n generate-types`
2. Check import paths are correct
3. Restart TypeScript server
4. Verify tsconfig.json includes the types file

### Types out of sync?

Set up a pre-commit hook:

```json
// package.json
{
	"scripts": {
		"pretypes": "svelte-i18n generate-types ./translations/en.json ./src/i18n.d.ts"
	}
}
```

### Need help?

- [Open an issue](https://github.com/atshelchin/svelte-i18n/issues)
- [Join discussions](https://github.com/atshelchin/svelte-i18n/discussions)
