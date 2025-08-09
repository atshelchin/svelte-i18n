# Quick Start Guide

Welcome to @shelchin/svelte-i18n! This guide will get you up and running in minutes.

## Installation

```bash
npm install @shelchin/svelte-i18n
```

## Basic Setup

### 1. Create your i18n configuration

```typescript
// src/lib/i18n.ts
import { setupI18n, autoLoadLanguages } from '@shelchin/svelte-i18n';

// Initialize i18n
export const i18n = setupI18n({
	defaultLocale: 'en',
	fallbackLocale: 'en'
});

// Auto-load all available languages
if (typeof window !== 'undefined') {
	autoLoadLanguages(i18n);
}
```

#### 🎆 NEW: Auto-Discovery for Packages

If you're building a reusable package or component library, enable auto-discovery:

```typescript
// Enable auto-discovery for your package
export const i18n = setupI18n({
	defaultLocale: 'en',
	namespace: 'my-awesome-package',
	autoDiscovery: true // ✨ Automatically finds translations!
});
```

Now users can add translations without modifying your code:

```json
// Users create: /static/translations/my-awesome-package.fr.json
{
	"title": "Mon Package Génial",
	"description": "Description en français"
}
// Your package automatically loads it when locale is 'fr'!
```

### 2. Add translation files

Create JSON files in `/static/translations/`:

```json
// static/translations/en.json
{
	"_meta": {
		"name": "English",
		"flag": "🇬🇧",
		"direction": "ltr"
	},
	"welcome": "Welcome {name}!",
	"nav": {
		"home": "Home",
		"about": "About",
		"contact": "Contact"
	}
}
```

```json
// static/translations/zh.json
{
	"_meta": {
		"name": "中文",
		"flag": "🇨🇳",
		"direction": "ltr"
	},
	"welcome": "欢迎 {name}！",
	"nav": {
		"home": "首页",
		"about": "关于",
		"contact": "联系"
	}
}
```

### 3. Use in your components

```svelte
<script lang="ts">
	import { getI18n } from '@shelchin/svelte-i18n';

	const i18n = getI18n();
	const { t, locale } = i18n;

	let name = $state('World');
</script>

<h1>{t('welcome', { name })}</h1>

<nav>
	<a href="/">{t('nav.home')}</a>
	<a href="/about">{t('nav.about')}</a>
	<a href="/contact">{t('nav.contact')}</a>
</nav>

<!-- Language switcher -->
<button onclick={() => i18n.setLocale('zh')}> 切换到中文 </button>
```

## Type Safety

Generate TypeScript definitions for your translations:

```bash
npx svelte-i18n generate-types ./static/translations/en.json ./src/lib/i18n.d.ts
```

Now TypeScript will autocomplete and validate all your translation keys!

## Formatting

Use the built-in formatters for numbers, dates, and more:

```typescript
// Numbers
i18n.formatNumber(1234567.89); // "1,234,567.89"
i18n.formatNumber(0.42, 'percent'); // "42%"

// Currency
i18n.formatCurrency(99.99); // "$99.99"

// Dates
i18n.formatDate(new Date()); // "1/9/2025"
i18n.formatDate(new Date(), 'long'); // "January 9, 2025"

// Relative time
i18n.formatRelativeTime(-2, 'day'); // "2 days ago"
i18n.formatRelativeTime(3, 'hour'); // "in 3 hours"

// Lists
i18n.formatList(['A', 'B', 'C']); // "A, B, and C"
```

## Components

### Language Switcher

```svelte
<script>
	import { LanguageSwitcher } from '@shelchin/svelte-i18n';
</script>

<LanguageSwitcher showFlags={true} showLabel={true} />
```

### Trans Component

```svelte
<script>
	import { Trans } from '@shelchin/svelte-i18n';
</script>

<Trans key="welcome" values={{ name: 'Alice' }} />
```

### Validation Popup

```svelte
<script>
	import { ValidationPopup } from '@shelchin/svelte-i18n';
</script>

<!-- Shows translation validation errors in development -->
<ValidationPopup />
```

#### Adding Languages to ValidationPopup

The ValidationPopup component uses auto-discovery. To add a new language:

1. Create a file: `/static/translations/validation-popup.{locale}.json`
2. The component automatically loads it!

Example for Japanese:

```json
// static/translations/validation-popup.ja.json
{
	"_meta": {
		"name": "日本語",
		"flag": "🇯🇵"
	},
	"validationPopup": {
		"header": {
			"title": "翻訳検証レポート",
			"close": "閉じる"
		}
		// ... more translations
	}
}
```

```svelte
<script>
	import { ValidationPopup } from '@shelchin/svelte-i18n';
</script>

<!-- Shows missing translations in development -->
<ValidationPopup />
```

## Next Steps

- [Configure advanced options](./configuration.md)
- [Learn about type safety](./type-safety.md)
- [Set up the AI Translation Editor](./editor.md)
- [Use with SvelteKit SSR](./ssr.md)
