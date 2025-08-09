# Core API Reference

## setupI18n

Initialize the i18n system with configuration.

```typescript
function setupI18n(config: I18nConfig): I18nInstance;
```

### Parameters

| Parameter | Type         | Description          |
| --------- | ------------ | -------------------- |
| `config`  | `I18nConfig` | Configuration object |

### I18nConfig

```typescript
interface I18nConfig {
	defaultLocale: string;
	fallbackLocale?: string;
	namespace?: string;
	loadLocale?: (locale: string) => Promise<TranslationSchema>;
	missingKeyHandler?: (key: string, locale: string) => string;
	interpolation?: {
		prefix?: string; // Default: '{'
		suffix?: string; // Default: '}'
	};
	pluralization?: {
		rules?: Record<string, (count: number) => number>;
	};
	formats?: {
		date?: Intl.DateTimeFormatOptions;
		time?: Intl.DateTimeFormatOptions;
		number?: Intl.NumberFormatOptions;
		currency?: Intl.NumberFormatOptions;
	};
}
```

### Example

```typescript
const i18n = setupI18n({
	defaultLocale: 'en',
	fallbackLocale: 'en',
	namespace: 'myapp',
	missingKeyHandler: (key, locale) => `Missing: ${key}`,
	interpolation: {
		prefix: '{{',
		suffix: '}}'
	}
});
```

## getI18n

Get the current i18n instance.

```typescript
function getI18n(): I18nInstance;
```

Throws an error if i18n is not initialized.

### Example

```typescript
import { getI18n } from '@shelchin/svelte-i18n';

const i18n = getI18n();
const message = i18n.t('welcome');
```

## I18nInstance

The main i18n store instance.

### Properties

| Property    | Type                           | Description                 |
| ----------- | ------------------------------ | --------------------------- |
| `locale`    | `string`                       | Current active locale       |
| `locales`   | `string[]`                     | List of loaded locales      |
| `isLoading` | `boolean`                      | Loading state               |
| `errors`    | `Record<string, string[]>`     | Validation errors by locale |
| `meta`      | `Record<string, LanguageMeta>` | Language metadata           |

### Methods

#### t (translate)

Get a translated string.

```typescript
t(key: string, params?: InterpolationParams): string
```

**Parameters:**

- `key` - Dot-notation translation key
- `params` - Optional interpolation parameters

**Example:**

```typescript
i18n.t('welcome'); // "Welcome!"
i18n.t('greeting', { name: 'Alice' }); // "Hello, Alice!"
i18n.t('user.profile.title'); // "User Profile"
```

#### setLocale

Change the current locale.

```typescript
setLocale(locale: string): void
```

**Example:**

```typescript
i18n.setLocale('fr'); // Switch to French
```

#### loadLanguage

Load translations for a locale.

```typescript
loadLanguage(
  locale: string,
  source?: string | TranslationSchema | TranslationFile
): Promise<void>
```

**Parameters:**

- `locale` - Locale code (e.g., 'en', 'fr')
- `source` - Translation source (URL, object, or file)

**Example:**

```typescript
// Load from URL
await i18n.loadLanguage('fr', '/translations/fr.json');

// Load from object
await i18n.loadLanguage('de', {
	welcome: 'Willkommen',
	goodbye: 'Auf Wiedersehen'
});
```

#### validateTranslations

Validate translations against a schema.

```typescript
validateTranslations(locale: string, schema?: TranslationSchema): boolean
```

**Example:**

```typescript
const isValid = i18n.validateTranslations('fr');
if (!isValid) {
	console.error('French translations have errors');
}
```

#### detectBrowserLanguage

Detect the user's browser language.

```typescript
detectBrowserLanguage(): string | null
```

**Example:**

```typescript
const browserLang = i18n.detectBrowserLanguage();
if (browserLang) {
	i18n.setLocale(browserLang);
}
```

## Translation Schema

### TranslationSchema

```typescript
interface TranslationSchema {
	[key: string]: string | TranslationSchema;
}
```

### TranslationFile

```typescript
interface TranslationFile {
	_meta?: LanguageMeta;
	[key: string]: string | TranslationSchema | LanguageMeta | undefined;
}
```

### LanguageMeta

```typescript
interface LanguageMeta {
	name: string; // Native name (e.g., "Français")
	englishName?: string; // English name (e.g., "French")
	direction?: 'ltr' | 'rtl'; // Text direction
	flag?: string; // Flag emoji (e.g., "🇫🇷")
}
```

## Interpolation

### Basic Interpolation

```typescript
// Translation: "Hello {name}!"
i18n.t('greeting', { name: 'World' }); // "Hello World!"
```

### Multiple Parameters

```typescript
// Translation: "{user} sent {count} messages"
i18n.t('notification', {
	user: 'Alice',
	count: 5
}); // "Alice sent 5 messages"
```

### Nested Objects

```typescript
// Translation: "Welcome {user.name} from {user.city}"
i18n.t('welcome', {
	user: {
		name: 'Bob',
		city: 'Paris'
	}
}); // "Welcome Bob from Paris"
```

## Pluralization

### Simple Pluralization

```typescript
// Translation: "{count} item|{count} items"
i18n.t('items.count', { count: 1 }); // "1 item"
i18n.t('items.count', { count: 5 }); // "5 items"
```

### Zero Case

```typescript
// Translation: "No items|{count} item|{count} items"
i18n.t('items.count', { count: 0 }); // "No items"
i18n.t('items.count', { count: 1 }); // "1 item"
i18n.t('items.count', { count: 3 }); // "3 items"
```

### Custom Rules

```typescript
const i18n = setupI18n({
	pluralization: {
		rules: {
			ru: (count) => {
				// Russian pluralization
				if (count % 10 === 1 && count % 100 !== 11) return 0;
				if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 1;
				return 2;
			}
		}
	}
});
```

## Error Handling

### Missing Keys

```typescript
// Default behavior
i18n.t('missing.key'); // "Missing translation: missing.key"

// Custom handler
const i18n = setupI18n({
	missingKeyHandler: (key, locale) => {
		console.error(`Missing: ${key} in ${locale}`);
		return `[${key}]`;
	}
});

i18n.t('missing.key'); // "[missing.key]"
```

### Validation Errors

```typescript
// Check for errors
if (Object.keys(i18n.errors).length > 0) {
	console.error('Translation errors:', i18n.errors);
}

// Get errors for specific locale
const frenchErrors = i18n.errors['fr'] || [];
frenchErrors.forEach((error) => {
	console.error(`French translation error: ${error}`);
});
```
