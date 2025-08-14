# @shelchin/svelte-i18n

<div align="center">

**🌍 The Last i18n Library You'll Ever Need for Svelte**

[![npm version](https://img.shields.io/npm/v/@shelchin/svelte-i18n.svg)](https://www.npmjs.com/package/@shelchin/svelte-i18n)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00.svg)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg)](https://www.typescriptlang.org/)

**Zero-config • Type-safe • AI-powered • Enterprise Features**

[Demo](https://svelte-i18n-demo.vercel.app) • [Documentation](#documentation) • [中文文档](./README-zh.md)

</div>

> [!WARNING]
> **⚠️ DEVELOPMENT STATUS: This library is currently in active development and is NOT ready for production use.**
>
> While we're excited about the features and actively working on stability, please be aware:
>
> - APIs may change without notice
> - Some features are experimental
> - Bugs and breaking changes are expected
>
> **For production applications, please wait for the stable v1.0.0 release.**
>
> Feel free to experiment, provide feedback, and contribute! Follow our progress in [Issues](https://github.com/shelchin/svelte-i18n/issues).

---

## 🚀 Why @shelchin/svelte-i18n?

> **Stop wrestling with i18n libraries.** We've built the one that just works.

### 🎯 9 Reasons This Changes Everything:

1. **🔗 Unified API for Packages & Apps** - The SAME API works for both npm packages and SvelteKit applications. Package authors and app developers use identical code. Packages automatically inherit app settings.

2. **🤖 AI-Powered Translation Editor** - Non-developers can create translations with OpenAI integration. No JSON editing, no technical knowledge required.

3. **⚡ True Zero-Config** - Auto-discovers languages, auto-loads translations from static files, auto-detects user preferences. It literally just works.

4. **🔒 100% Type-Safe** - Every translation key is typed with auto-completion. Get suggestions as you type `i18n.t('...')`. Typos are compile-time errors.

5. **🎨 Svelte 5 Native** - Built with runes from the ground up. Not a port, not a wrapper - pure Svelte 5.

6. **🌐 Global Formatting** - Format dates, numbers, currencies for 100+ locales using native Intl API. Zero dependencies.

7. **📦 Enterprise-Ready** - Namespace isolation for micro-frontends, static site generation support, post-build language addition via auto-discovery, comprehensive testing.

8. **💾 Translation Caching** - Save and resume translation work anytime. Browser-based IndexedDB storage keeps your progress safe.

9. **📂 Flexible Import Options** - Import from files, URLs, or resume incomplete translations. Supports multiple source languages for context.

---

## 💫 Quick Start

### 1. Installation

```bash
# Using pnpm (recommended)
pnpm add @shelchin/svelte-i18n

# Using npm
npm install @shelchin/svelte-i18n
```

### 2. Initialize

```bash
# Run the initialization command
pnpm run svelte-i18n init
```

This automatically:

- Detects your project type (app/package/both)
- Creates translation directories
- Generates TypeScript types
- Sets up i18n configuration

### 3. Setup Layout Files (Flexible & Simple!)

```typescript
// +layout.server.ts
import type { LayoutServerLoad } from './$types.js';
import { loadI18nSSR } from '@shelchin/svelte-i18n';
import { i18n } from '../translations/i18n.js';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const i18nData = await loadI18nSSR(i18n, cookies);

	return {
		...i18nData,
		// Add your custom data here
		myData: 'value'
	};
};
```

```typescript
// +layout.ts (optional, for CSR optimizations)
import type { LayoutLoad } from './$types.js';
import { loadI18nUniversal } from '@shelchin/svelte-i18n';
import { browser } from '$app/environment';
import { i18n } from '../translations/i18n.js';

export const load: LayoutLoad = async ({ data }) => {
	const i18nData = await loadI18nUniversal(i18n, data, browser);

	return {
		...i18nData
		// Add your custom data here
	};
};
```

```svelte
<!-- +layout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { setupI18nClient, initI18nOnMount } from '@shelchin/svelte-i18n';
	import { i18n, initI18n } from '../translations/i18n.js';

	let { data, children } = $props();

	// Setup i18n synchronously to prevent flash
	let isReady = $state(setupI18nClient(i18n, data));

	// Initialize on client mount
	onMount(async () => {
		await initI18nOnMount(i18n, data, {
			initFunction: initI18n
		});
		if (!isReady) isReady = true;
	});
</script>

{#if isReady}
	{@render children()}
{:else}
	<div>Loading...</div>
{/if}
```

### 4. Use in Your App

```typescript
// In Svelte applications (@ represents ./src)
import { i18n } from '@/translations/i18n.js';

// Basic usage
i18n.t('welcome', { name: 'World' }); // "Welcome, World!"

// Switch language
await i18n.setLocale('zh');

// Formatting
i18n.formatCurrency(99.99); // "$99.99" / "¥100"
i18n.formatRelativeTime(-2, 'day'); // "2 days ago"
```

### 5. Use in Package Development

```typescript
// In library/package components
import { i18n } from '$lib/translations/i18n.js';

// Use with namespace isolation
i18n.t('button.submit'); // Package translations are isolated
```

**That's it!** Your i18n is ready.

---

## 🔗 URL-Based Language Detection (NEW!)

**Automatic language detection from URL pathname** - Support for locale-prefixed URLs like `/zh/about` or `/en-US/products`.

### How It Works

The library now automatically detects and uses language codes from URL pathnames with the following priority:

1. **URL pathname** (e.g., `/zh/about`, `/en-US/products`)
2. **localStorage** (client-side) or **cookies** (server-side)
3. **Default locale**

### Setup with Pathname Detection

```typescript
// +layout.server.ts
import type { LayoutServerLoad } from './$types.js';
import { loadI18nSSR } from '@shelchin/svelte-i18n';
import { i18n } from '../translations/i18n.js';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	// Pass url to enable pathname locale detection
	const i18nData = await loadI18nSSR(i18n, cookies, url);
	return i18nData;
};
```

```typescript
// +layout.ts
import type { LayoutLoad } from './$types.js';
import { loadI18nUniversal } from '@shelchin/svelte-i18n';
import { browser } from '$app/environment';
import { i18n } from '../translations/i18n.js';

export const load: LayoutLoad = async ({ data, url }) => {
	// Pass url to enable pathname locale detection
	const i18nData = await loadI18nUniversal(i18n, data, browser, url);
	return i18nData;
};
```

### Supported Language Codes

The library recognizes **368+ language codes** including:

- **ISO 639-1**: 2-letter codes (e.g., `en`, `zh`, `fr`)
- **ISO 639-2/3**: 3-letter codes (e.g., `eng`, `chi`, `fra`)
- **BCP 47**: Regional variants (e.g., `en-US`, `zh-CN`, `zh-TW`)
- **All UN member states and recognized regions**

### URL Management Utilities

```typescript
import { deLocalizeUrl, extractLocaleFromPathname } from '@shelchin/svelte-i18n';

// Remove language code from URL
const url = new URL('https://example.com/zh/about');
const cleanUrl = deLocalizeUrl(url); // https://example.com/about

// Extract language code from pathname
const locale = extractLocaleFromPathname('/zh/about'); // 'zh'
```

### Benefits

- **SEO-friendly** URLs with language prefixes
- **Shareable links** that preserve language selection
- **Automatic language switching** based on URL
- **Backwards compatible** with existing cookie/localStorage approach

---

## 🔍 Auto-Discovery: Add Languages Without Touching Code

**Revolutionary for teams:** Translators can add new languages by simply dropping JSON files in `/static/translations/`. No code changes, no rebuilds, no deployments.

### Setup Auto-Discovery

1. Create `/static/translations/index.json`:

```json
{
	"autoDiscovery": {
		"app": ["es", "hi", "ko", "pt", "ru"],
		"packages": {
			"@shelchin/svelte-i18n": ["fr", "zh"]
		}
	}
}
```

2. Add translation files:

```
/static/translations/
├── index.json           # Auto-discovery configuration
├── app/                 # App translations
│   ├── es.json
│   ├── hi.json
│   ├── ko.json
│   ├── pt.json
│   └── ru.json
└── @shelchin/svelte-i18n/  # Package translations
    ├── fr.json
    └── zh.json
```

3. Enable in your app:

```typescript
// In +layout.svelte
onMount(async () => {
	await i18n.clientLoad(); // Auto-discovers and loads all translations
});
```

**Result:** New languages appear instantly in your app. Perfect for:

- Post-deployment language additions
- Community translations
- A/B testing different translations
- Regional variations

---

## 🛠️ CLI Commands

### Generate TypeScript Types

```bash
# Generate types with validation
pnpm run svelte-i18n generate-types

# Skip validation for faster generation
pnpm run svelte-i18n generate-types --no-validate

# Generate for library only
pnpm run svelte-i18n generate-types --lib
```

### Validate Translations

```bash
# Check for missing translations
pnpm run svelte-i18n validate src/translations/locales

# Use strict mode (fail on any issue)
pnpm run svelte-i18n validate src/translations/locales --strict

# Specify base locale
pnpm run svelte-i18n validate src/translations/locales --base zh
```

### Extract Translation Keys

```bash
# Extract all i18n keys from source code
pnpm run svelte-i18n extract ./src ./template.json

# Extract from specific file types
pnpm run svelte-i18n extract ./src ./template.json .svelte .ts
```

---

## 🚀 Deployment Options

### Static Site Generation (GitHub Pages, Vercel, Netlify)

This library fully supports static site generation with client-side language switching:

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html', // Enable client-side routing
			precompress: false,
			strict: true
		}),
		paths: {
			base: process.env.BASE_PATH || '' // For GitHub Pages subdirectory
		}
	}
};
```

```typescript
// +layout.ts (not +layout.server.ts for static sites)
export const prerender = true; // Enable prerendering
export const ssr = true;

export const load: LayoutLoad = async () => {
	// Language detection happens on client side
	return {
		locale: i18n.locale,
		locales: i18n.locales
	};
};
```

### Server-Side Rendering (Node.js, Express)

For SSR with cookie-based locale persistence:

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-node';
```

```typescript
// +layout.server.ts
import { loadI18nSSR } from '@shelchin/svelte-i18n';

export const load: LayoutServerLoad = async ({ cookies }) => {
	return await loadI18nSSR(i18n, cookies, {
		cookieName: 'my-locale', // optional, defaults to 'i18n-locale'
		defaultLocale: 'en' // optional, defaults to i18n.locale
	});
};
```

---

## 📘 Core Features

### Type-Safe Translations

```typescript
// Auto-generated types from your JSON
i18n.t('user.profile.name'); // ✅ Type-safe
i18n.t('user.profle.name'); // ❌ TypeScript error
```

### Interpolation & Pluralization

```typescript
i18n.t('items.count', { count: 0 }); // "No items"
i18n.t('items.count', { count: 1 }); // "1 item"
i18n.t('items.count', { count: 5 }); // "5 items"
```

### Formatting API

```typescript
// Dates
i18n.formatDate(new Date()); // "January 15, 2024"
i18n.formatDate(new Date(), 'short'); // "1/15/24"

// Numbers
i18n.formatNumber(1234567.89); // "1,234,567.89"
i18n.formatCurrency(99.99, 'EUR'); // "€99.99"
i18n.formatPercent(0.85); // "85%"

// Relative Time
i18n.formatRelativeTime(-1, 'hour'); // "1 hour ago"
i18n.formatRelativeTime(3, 'month'); // "in 3 months"

// Lists
i18n.formatList(['A', 'B', 'C']); // "A, B, and C"
```

### Runtime Validation

Get instant feedback during development:

```
❌ Translation validation failed for app in locale "ja":
  • Missing translation: demo.title
  • Missing translation: demo.description
  • Invalid translation type: user.age (expected string, got number)
```

### Namespace Isolation

Perfect for micro-frontends and component libraries:

```typescript
// Component library
const libI18n = setupI18n({
	namespace: '@my-lib/components',
	defaultLocale: 'en'
});

// Main application
const appI18n = setupI18n({
	defaultLocale: 'en'
});

// Translations are completely isolated
libI18n.t('button.label'); // From library translations
appI18n.t('page.title'); // From app translations
```

---

## 🔗 Unified i18n API for Packages & Applications

**The same API works for both npm packages and SvelteKit applications:**

### For Package Authors

```typescript
// In your npm package: @my-company/ui-lib
import { createI18n } from '@shelchin/svelte-i18n';
import en from './locales/en.json';
import zh from './locales/zh.json';

export const libI18n = createI18n({
  namespace: '@my-company/ui-lib',
  translations: { en, zh }
});

// Your component can use it
export function MyButton() {
  return <button>{libI18n.t('button.label')}</button>;
}
```

### For Application Developers

```typescript
// In your SvelteKit app
import { createI18n } from '@shelchin/svelte-i18n';
import en from './locales/en.json';
import zh from './locales/zh.json';

export const i18n = createI18n({
	namespace: 'app',
	isMain: true,
	defaultLocale: 'en',
	translations: { en, zh }
});
```

### Key Benefits

1. **Configuration Inheritance**: Packages automatically inherit locale settings from the main app
2. **Namespace Isolation**: No translation key conflicts between packages
3. **Shared Language Switcher**: One component controls all i18n instances
4. **Type Safety**: Full TypeScript support with auto-completion
5. **Zero Configuration**: Packages work out-of-the-box in any app

### Advanced: Package Following App Locale

```typescript
// Package translations automatically respect app's locale
// When app switches to 'zh', package UI follows automatically

// In app
await appI18n.setLocale('zh');

// Package components automatically use Chinese translations
// (This feature requires subscription mechanism - coming soon)
```

## 🎨 Translation Editor

Built-in visual editor for non-developers:

1. **Import** translations from files or URLs
2. **Edit** with live preview and validation
3. **Translate** with OpenAI integration
4. **Export** production-ready JSON files

```svelte
<script>
	import { TranslationEditor } from '@shelchin/svelte-i18n';
</script>

<TranslationEditor />
```

Features:

- 📁 Multi-source import (files, URLs, saved sessions)
- 🤖 AI-powered translation with OpenAI
- 💾 Automatic session saving with IndexedDB
- 🔍 Smart search and filtering
- ✅ Real-time validation
- 📊 Translation progress tracking
- 🎯 Side-by-side editing
- 📥 One-click export

---

## 🛠️ Installation & Setup

### Basic Setup

```bash
npm install @shelchin/svelte-i18n
```

```typescript
// src/lib/i18n.ts
import { setupI18n } from '@shelchin/svelte-i18n';

export const i18n = setupI18n({
	defaultLocale: 'en',
	fallbackLocale: 'en'
});
```

### With Built-in Translations

```typescript
// Import your translations
import en from './locales/en.json';
import es from './locales/es.json';

// Register them
import { registerBuiltInTranslations } from '@shelchin/svelte-i18n';

registerBuiltInTranslations({
	app: { en, es }
});
```

### With Auto-Discovery

Create `/static/translations/index.json`:

```json
{
	"autoDiscovery": {
		"app": ["fr", "de", "ja"]
	}
}
```

Then translations are auto-loaded from `/static/translations/app/{locale}.json`.

### SSR (Server-Side Rendering) Example

For a complete SSR example with SvelteKit, check out the [demo repository](https://github.com/atshelchin/i18n-demo).

---

## 📦 Package Structure

```
@shelchin/svelte-i18n
├── /components          # Pre-built UI components
│   ├── LanguageSwitcher # Dropdown/button language selector
│   ├── Trans           # Component with HTML support
│   └── ValidationPopup # Dev-mode validation display
├── /stores             # Reactive stores
├── /cli                # CLI tools for type generation
└── /editor            # Translation editor component
```

---

## 🔧 CLI Tools

### Generate TypeScript Definitions

```bash
npx @shelchin/svelte-i18n generate-types
```

Automatically generates type definitions from your translation files for 100% type safety.

---

## 🌍 Supported Languages

Built-in support for 100+ locales via the native Intl API. No locale data to ship!

Popular locales include:
`en`, `es`, `fr`, `de`, `it`, `pt`, `ru`, `zh`, `ja`, `ko`, `ar`, `hi`, `tr`, `pl`, `nl`, `sv`, `da`, `no`, `fi`, `cs`, `hu`, `ro`, `th`, `vi`, `id`, `ms`, `tl`, `he`, `el`, `uk`, `bg`, `hr`, `sr`, `sk`, `sl`, `lt`, `lv`, `et`, `is`, `ga`, `mt`, `sq`, `mk`, `ka`, `hy`, `az`, `kk`, `uz`, `ky`, `tg`, `tk`, `mn`, `bo`, `ne`, `si`, `my`, `km`, `lo`, `am`, `ti`, `or`, `as`, `ml`, `kn`, `ta`, `te`, `gu`, `mr`, `pa`, `bn`, `ur`, `ps`, `fa`, and many more!

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/svelte-i18n.git
cd svelte-i18n

# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## 📄 License

MIT © [shelchin](https://github.com/atshelchin)

---

## 🙏 Acknowledgments

Built with ❤️ using:

- [Svelte 5](https://svelte.dev) - The magical disappearing framework
- [SvelteKit](https://kit.svelte.dev) - The fastest way to build apps
- [TypeScript](https://www.typescriptlang.org) - JavaScript with superpowers
- [Vite](https://vitejs.dev) - Next generation frontend tooling

---

## 📬 Support

- 📧 Email: [your-email@example.com](mailto:your-email@example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/svelte-i18n/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/svelte-i18n/discussions)
- 📖 Docs: [Full Documentation](https://your-docs-site.com)

---

<div align="center">

**Ready to revolutionize your i18n?**

[Get Started](#quick-start) • [View Demo](https://svelte-i18n-demo.vercel.app) • [Star on GitHub](https://github.com/yourusername/svelte-i18n)

</div>
