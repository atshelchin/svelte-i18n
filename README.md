# @shelchin/svelte-i18n

> The last Svelte i18n library you'll ever need. Type-safe, zero-config, with seamless SSR/CSR support.

[![npm version](https://img.shields.io/npm/v/@shelchin/svelte-i18n)](https://www.npmjs.com/package/@shelchin/svelte-i18n)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00.svg)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg)](https://www.typescriptlang.org/)

[中文文档](./README-zh.md) • [Live Demo](https://atshelchin.github.io/svelte-i18n/) • [Examples](./src/routes)

## ✨ Features

### 🎯 Core Features
- **🔒 Full Type Safety** - Auto-generated TypeScript types for all translation keys
- **🚀 Zero Configuration** - Works out of the box with sensible defaults
- **📦 Optimized Bundle Size** - ~35KB gzipped with tree-shaking support
- **🌐 SSR/CSR Support** - Seamless server-side and client-side rendering
- **🔄 Hot Module Replacement** - Instant translation updates during development
- **🎨 Rich Formatting** - Built-in number, date, currency, and list formatting via native Intl API
- **📱 Smart Locale Detection** - From URL pathname, browser, cookies, or localStorage

### 🛠️ Developer Experience
- **🤖 Powerful CLI** - Extract keys, validate translations, generate types
- **🔍 Runtime Validation** - Catch translation errors during development
- **📚 Namespace Support** - Isolate translations for packages and libraries
- **🎯 Smart Fallbacks** - Graceful degradation with fallback locales
- **💾 Persistence** - Remember user's language preference across sessions
- **🌍 150+ Languages** - Built-in metadata for all major languages

### 🏗️ Architecture
- **🧩 Svelte 5 Native** - Built with runes from the ground up
- **🔌 Unified API** - Same API for both applications and npm packages
- **📊 Lazy Loading** - Load translations on-demand for better performance
- **🎛️ Configuration Inheritance** - Libraries automatically inherit app configuration

## 📦 Installation

```bash
# Install the package
pnpm add @shelchin/svelte-i18n
# or
npm install @shelchin/svelte-i18n
# or
yarn add @shelchin/svelte-i18n
```

## 🚀 Quick Start

### 1. Initialize i18n in your project

Run the initialization command to auto-generate configuration:

```bash
# Run init command (auto-detects project type and generates config)
pnpm exec svelte-i18n init
# or
npx svelte-i18n init
```

This will:
- Create `src/translations/` directory structure
- Generate sample translation files (`locales/en.json`, `locales/zh.json`)
- Create `i18n.ts` configuration file with type-safe setup
- Generate TypeScript type definitions

The generated `i18n.ts` will look like:

```typescript
// src/translations/i18n.ts (auto-generated)
import { createI18n } from '@shelchin/svelte-i18n';
import type { I18nPath } from './types/i18n-generated.js';

// Auto-scan and import translations from locales directory
const translationModules = import.meta.glob('./locales/*.json', {
  eager: true,
  import: 'default'
});

const translations: Record<string, unknown> = {};

// Extract language code from file path and build translations object
for (const [path, module] of Object.entries(translationModules)) {
  const match = path.match(/\/([^/]+)\.json$/);
  if (match && match[1]) {
    const langCode = match[1];
    translations[langCode] = module;
  }
}

// Create i18n instance with type safety
export const i18n = createI18n<I18nPath>({
  namespace: 'app',
  isMain: true,
  translations,
  defaultLocale: 'en',
  fallbackLocale: 'en'
});

export default i18n;
```

### 2. Setup in SvelteKit

#### Configure `+layout.server.ts` for SSR:

```typescript
// src/routes/+layout.server.ts
import { loadI18nSSR } from '@shelchin/svelte-i18n';
import { i18n } from '$src/translations/i18n.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request }) => {
  const locale = await loadI18nSSR(i18n, request);
  return {
    locale
  };
};
```

#### Configure `+layout.ts` for Universal Loading:

```typescript
// src/routes/+layout.ts
import { loadI18nUniversal } from '@shelchin/svelte-i18n';
import { i18n } from '$src/translations/i18n.js';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
  await loadI18nUniversal(i18n, data?.locale);
  return {
    locale: data?.locale
  };
};
```

#### Configure `+layout.svelte` for Client:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { setupI18nClient } from '@shelchin/svelte-i18n';
  import { i18n } from '$src/translations/i18n.js';
  
  onMount(async () => {
    await setupI18nClient(i18n);
  });
</script>

<slot />
```

### 3. Use in Components

```svelte
<script lang="ts">
  import { i18n } from '$src/translations/i18n.js';
  import { LanguageSwitcher } from '@shelchin/svelte-i18n';
  
  let name = $state('World');
  
  // Type-safe translations with autocomplete
  const welcome = i18n.t('welcome');
  const hello = i18n.t('hello', { name });
</script>

<h1>{welcome}</h1>
<p>{hello}</p>

<!-- Direct usage -->
<nav>
  <a href="/">{i18n.t('navigation.home')}</a>
  <a href="/about">{i18n.t('navigation.about')}</a>
  <a href="/contact">{i18n.t('navigation.contact')}</a>
</nav>

<!-- Language Switcher Component -->
<LanguageSwitcher {i18n} />
```

### 4. Use in Libraries/Packages

For library packages, use namespace to avoid conflicts:

```typescript
// In a library: src/lib/translations/i18n.ts
import { createI18n } from '@shelchin/svelte-i18n';
import type { LibI18nPath } from './types/i18n-generated.js';

// Auto-import translations
const translationModules = import.meta.glob('./locales/*.json', {
  eager: true,
  import: 'default'
});

const translations: Record<string, unknown> = {};
for (const [path, module] of Object.entries(translationModules)) {
  const match = path.match(/\/([^/]+)\.json$/);
  if (match && match[1]) {
    translations[match[1]] = module;
  }
}

export const libI18n = createI18n<LibI18nPath>({
  namespace: 'my-ui-lib', // Use your package name
  translations
});

// Usage in library component
libI18n.t('button.save');
```

## 🛠️ CLI Commands

### Generate TypeScript Types

```bash
# Generate types from translation files
pnpm exec svelte-i18n generate-types
# or with custom paths
pnpm exec svelte-i18n generate-types --dir ./src/translations/locales --out ./src/lib/types/i18n-generated.ts
```

### Validate Translations

```bash
# Check for missing translations
pnpm exec svelte-i18n validate src/translations/locales
```

### Extract Translation Keys

```bash
# Extract keys from source code
pnpm exec svelte-i18n extract ./src ./template.json
```

## 🎯 Type Safety

The `init` command automatically generates TypeScript types. To regenerate after changes:

```bash
pnpm exec svelte-i18n generate-types
```

This creates type definitions that provide autocomplete for all translation keys:

```typescript
// Auto-generated types in src/translations/types/i18n-generated.d.ts
export type I18nPath = 
  | "welcome"
  | "hello"
  | "navigation.home" 
  | "navigation.about"
  | "navigation.contact";

// Already configured in your i18n.ts with type safety
import type { I18nPath } from './types/i18n-generated.js';

export const i18n = createI18n<I18nPath>({
  // ... config
});

// Now TypeScript ensures only valid keys are used
i18n.t('welcome'); // ✅ Valid
i18n.t('hello', { name: 'John' }); // ✅ Valid with params
i18n.t('invalid.key'); // ❌ TypeScript error
```

## 🌍 Formatting

Built-in formatters using native Intl API (zero dependencies):

```typescript
const i18n = getI18n();

// Numbers
i18n.formatNumber(1234567.89); // "1,234,567.89" (en) / "1.234.567,89" (de)
i18n.formatNumber(0.15, 'percent'); // "15%"
i18n.formatNumber(123456789, 'compact'); // "123M"

// Currency (auto-detects based on locale)
i18n.formatCurrency(99.99); // "$99.99" (en-US) / "99,99 €" (de-DE)
i18n.formatCurrency(99.99, 'EUR'); // "€99.99"

// Dates
i18n.formatDate(new Date()); // "1/15/2024" (en-US) / "15.1.2024" (de)
i18n.formatDate(new Date(), 'full'); // "Monday, January 15, 2024"

// Time
i18n.formatTime(new Date()); // "3:30 PM" / "15:30"

// Relative Time
i18n.formatRelativeTime(-2, 'day'); // "2 days ago"
i18n.formatRelativeTime(3, 'hour'); // "in 3 hours"

// Lists
i18n.formatList(['Apple', 'Banana', 'Orange']); // "Apple, Banana, and Orange"
```

## 🎨 Components

### Language Switcher

Pre-built, accessible language switcher component:

```svelte
<script>
  import { LanguageSwitcher } from '@shelchin/svelte-i18n';
  import { i18n } from '../app/i18n';
</script>

<!-- Default switcher -->
<LanguageSwitcher {i18n} />

<!-- With custom styling and position -->
<LanguageSwitcher 
  {i18n}
  class="my-custom-class"
  position="top-left"
  showFlags={true}
  showLabels={true}
/>
```

### Validation Popup (Dev Only)

Shows translation errors during development:

```svelte
<script>
  import { ValidationPopup } from '@shelchin/svelte-i18n';
  import { i18n } from '../app/i18n';
</script>

{#if import.meta.env.DEV}
  <ValidationPopup {i18n} />
{/if}
```

## 📚 Advanced Features

### URL-based Locale Detection

Automatically detect locale from URL pathname:

```typescript
// Supports patterns like:
// /zh/about -> Chinese
// /en-US/products -> American English
// /de-DE/contact -> German

export const load: LayoutLoad = async ({ data, url }) => {
  // The url parameter enables pathname locale detection
  return await loadI18nUniversal(i18n, data, url);
};
```

### Dynamic Translation Loading

Load translations dynamically for code splitting:

```typescript
// Option 1: Dynamic imports
async function loadTranslations(locale: string) {
  const translations = await import(`../translations/${locale}.json`);
  await i18n.loadLanguage(locale, translations.default);
}

// Option 2: Fetch from API
async function fetchTranslations(locale: string) {
  const response = await fetch(`/api/translations/${locale}`);
  const translations = await response.json();
  await i18n.loadLanguage(locale, translations);
}
```

### Namespace Support for Libraries

Libraries can have isolated translations that don't conflict with the app:

```typescript
// In your library (my-ui-lib)
export const libI18n = createI18n({
  namespace: 'my-ui-lib',
  translations: {
    en: { button: { save: 'Save', cancel: 'Cancel' } },
    zh: { button: { save: '保存', cancel: '取消' } }
  }
});

// Library translations are automatically namespaced
libI18n.t('button.save'); // Uses "my-ui-lib.button.save" internally

// Libraries automatically inherit app's locale
// When app switches to 'zh', library also switches to 'zh'
```

### SSR with Cookie Persistence

Server-side rendering with locale persistence:

```typescript
// +layout.server.ts
import type { LayoutServerLoad } from './$types';
import { loadI18nSSR } from '@shelchin/svelte-i18n';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const locale = cookies.get('i18n-locale') || 'en';
  return loadI18nSSR(locale, ['en', 'zh', 'ja']);
};
```

### Pluralization

Handle plural forms correctly for all languages:

```typescript
// English: 0 = plural, 1 = singular, 2+ = plural
"items.count": "No items | One item | {count} items"

// Polish: Complex plural rules
"items.count": "Brak elementów | Jeden element | {count} elementy | {count} elementów"

// Usage
i18n.t('items.count', { count: 0 });  // "No items"
i18n.t('items.count', { count: 1 });  // "One item"
i18n.t('items.count', { count: 5 });  // "5 items"
```

### Interpolation

Dynamic values in translations:

```typescript
// Basic interpolation
"welcome": "Welcome {name}!"
i18n.t('welcome', { name: 'John' }); // "Welcome John!"

// Nested values
"user.greeting": "Hello {user.firstName} {user.lastName}"
i18n.t('user.greeting', { 
  user: { firstName: 'John', lastName: 'Doe' } 
}); // "Hello John Doe"

// Custom interpolation markers
const i18n = createI18n({
  interpolation: {
    prefix: '{{',
    suffix: '}}'
  }
});
// Now use: "welcome": "Welcome {{name}}!"
```

### Runtime Validation

Catch translation issues during development:

```typescript
const i18n = createI18n({
  translations,
  validateInDev: true, // Enable validation
  validateOptions: {
    checkInterpolation: true, // Verify {variables} match
    checkPluralization: true, // Verify plural forms
    checkHTML: false,          // Allow HTML in translations
    checkMissing: true,        // Report missing keys
    checkExtra: true           // Report extra keys
  }
});

// Shows validation popup in development with errors
```

## 🛠️ CLI Tools

### Initialize Project

Set up i18n in your project interactively:

```bash
npx svelte-i18n init
```

This will:
- Create translation directories
- Generate initial config files
- Set up type definitions
- Create example translations

### Extract Translation Keys

Scan your code and extract all translation keys:

```bash
# Extract from source code
npx svelte-i18n extract ./src ./translations/template.json

# Specify file extensions
npx svelte-i18n extract ./src ./translations/template.json js ts svelte
```

### Validate Translations

Check for missing or extra keys across all locales:

```bash
# Basic validation
npx svelte-i18n validate ./translations

# Strict validation (exit with error code)
npx svelte-i18n validate ./translations --strict

# Use specific base locale
npx svelte-i18n validate ./translations --base zh
```

### Generate TypeScript Types

Generate type definitions for translation keys:

```bash
# Generate for app translations (default)
npx svelte-i18n generate-types

# Custom paths
npx svelte-i18n generate-types \
  --dir ./translations \
  --out ./src/types/i18n.ts \
  --locale en

# Skip validation of other locales
npx svelte-i18n generate-types --no-validate
```

## 📖 API Reference

### Core Functions

#### `createI18n<TPath>(config)`
Creates a typed i18n instance.

```typescript
const i18n = createI18n<TranslationPaths>({
  translations,          // Translation data
  defaultLocale: 'en',   // Default locale
  fallbackLocale: 'en',  // Fallback for missing translations
  namespace: 'app',      // Namespace (for libraries)
  isMain: true,          // Is main app instance?
  validateInDev: true,   // Enable dev validation
  interpolation: {       // Interpolation options
    prefix: '{',
    suffix: '}'
  }
});
```

#### `i18n.t(key, params?)`
Get translated text with optional interpolation.

```typescript
i18n.t('welcome', { name: 'John' }); // "Welcome John!"
i18n.t('items.count', { count: 5 }); // "5 items"
```

#### `i18n.setLocale(locale)`
Change the current locale (async).

```typescript
await i18n.setLocale('zh'); // Switch to Chinese
```

#### `i18n.setLocaleSync(locale)`
Change locale synchronously (for SSR).

```typescript
i18n.setLocaleSync('zh'); // Immediate switch
```

#### `i18n.loadLanguage(locale, translations)`
Dynamically load translations.

```typescript
await i18n.loadLanguage('ja', japaneseTranslations);
```

### Properties

```typescript
i18n.locale;        // Current locale ('en')
i18n.locales;       // Available locales (['en', 'zh', 'ja'])
i18n.isLoading;     // Loading state (true/false)
i18n.errors;        // Validation errors (dev only)
i18n.meta;          // Language metadata (direction, native name, etc.)
```

### SvelteKit Integration

#### `loadI18nUniversal(i18n, data, url?, options?)`
Universal load function for +layout.ts.

```typescript
await loadI18nUniversal(i18n, data, url, {
  storageKey: 'i18n-locale',     // localStorage key
  cookieName: 'i18n-locale',     // Cookie name  
  defaultLocale: 'en',            // Default locale
  detectFromPath: true            // Detect from URL path
});
```

#### `loadI18nSSR(locale, locales, options?)`
Server-side load function for +layout.server.ts.

```typescript
loadI18nSSR('en', ['en', 'zh'], {
  cookieName: 'i18n-locale'
});
```

#### `setupI18nClient(i18n, data, options?)`
Synchronous client setup for +layout.svelte.

```typescript
const result = setupI18nClient(i18n, data, {
  defaultLocale: 'en',
  restoreFromStorage: true
});
```

#### `initI18nOnMount(i18n, data, options?)`
Async initialization in onMount.

```typescript
await initI18nOnMount(i18n, data, {
  initFunction: async (i18n) => {
    // Custom initialization
  }
});
```

### Formatting Functions

All formatters are locale-aware and reactive:

```typescript
formatNumber(value, style?, options?)
formatCurrency(value, currency?, options?)
formatDate(date, style?, options?)
formatTime(date, style?, options?)
formatRelativeTime(value, unit, options?)
formatList(items, style?, options?)
```

### Utility Functions

```typescript
// Detect browser language
detectBrowserLanguage(); // 'en-US'

// Validate translation schema
validateSchema(translations, options);

// Merge translation objects
mergeTranslations(target, source);

// Get available locales from registry
getAvailableLocales(registry);

// Check if locale is available
isLocaleAvailable(registry, 'zh');
```

## 🔧 Configuration

### Full Configuration Options

```typescript
interface I18nConfig {
  // Basic
  defaultLocale?: string;        // Default: 'en'
  fallbackLocale?: string;       // Default: same as defaultLocale
  supportedLocales?: string[];   // Auto-detected if not set
  
  // Features
  validateInDev?: boolean;       // Default: true
  loadingDelay?: number;         // Default: 200ms
  namespace?: string;            // Default: 'app'
  isMain?: boolean;              // Default: true for 'app'
  
  // Formatting
  interpolation?: {
    prefix?: string;            // Default: '{'
    suffix?: string;            // Default: '}'
    escapeValue?: boolean;      // Default: false
  };
  
  pluralization?: {
    separator?: string;         // Default: '|'
  };
  
  // Validation
  validateOptions?: {
    checkInterpolation?: boolean;
    checkPluralization?: boolean;
    checkHTML?: boolean;
    checkMissing?: boolean;
    checkExtra?: boolean;
  };
}
```

### Environment Variables

```bash
# .env
VITE_I18N_DEFAULT_LOCALE=en
VITE_I18N_FALLBACK_LOCALE=en
VITE_I18N_SUPPORTED_LOCALES=en,zh,ja,de,fr
VITE_I18N_DEBUG=true
```

## 🎯 Best Practices

### 1. Structure Your Translations

```
src/
  translations/
    en.json          # English (base)
    zh.json          # Chinese
    ja.json          # Japanese
    locales/         # Alternative structure
      en/
        common.json
        errors.json
        forms.json
```

### 2. Use Type Safety

Always generate and use types:

```typescript
// Generate types after translation changes
npm run i18n:types

// Import and use
import type { I18nPath } from '$lib/types/i18n-generated';
export const i18n = createI18n<I18nPath>({ ... });
```

### 3. Handle Loading States

```svelte
{#if i18n.isLoading}
  <LoadingSpinner />
{:else}
  <Content />
{/if}
```

### 4. Optimize Bundle Size

```typescript
// ❌ Don't import all translations statically
import * as allTranslations from './translations';

// ✅ Import only needed or use dynamic imports
import en from './translations/en.json';
const zh = await import('./translations/zh.json');
```

### 5. Test Your Translations

```typescript
// Run validation in CI/CD
npm run i18n:validate

// Test with different locales
npm run dev -- --locale=zh
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/atshelchin/svelte-i18n.git

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build library
pnpm build
```

## 📄 License

MIT © [Shelchin](https://github.com/atshelchin)

## 🙏 Acknowledgments

Built with ❤️ using:
- [Svelte 5](https://svelte.dev) - The magical disappearing framework
- [SvelteKit](https://kit.svelte.dev) - The fastest way to build Svelte apps
- [TypeScript](https://www.typescriptlang.org) - JavaScript with syntax for types
- [Vite](https://vitejs.dev) - Next generation frontend tooling

Special thanks to all [contributors](https://github.com/atshelchin/svelte-i18n/graphs/contributors) who helped make this project better!

---

<div align="center">

**[Documentation](https://github.com/atshelchin/svelte-i18n#readme)** • 
**[Live Demo](https://atshelchin.github.io/svelte-i18n/)** • 
**[Examples](https://github.com/atshelchin/svelte-i18n/tree/main/src/routes)** • 
**[Report Bug](https://github.com/atshelchin/svelte-i18n/issues)**

Made with ❤️ by [Shelchin](https://github.com/atshelchin)

</div>