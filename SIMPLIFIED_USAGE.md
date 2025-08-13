# Simplified Layout Setup

The @shelchin/svelte-i18n package provides helper functions that dramatically simplify i18n setup in your SvelteKit application. Instead of writing complex logic in your layout files, you can now use one-line solutions.

## 🚀 Minimal Setup (One-Liner)

### For SSR Applications

```typescript
// +layout.server.ts
import { handleSSR } from '@shelchin/svelte-i18n';
import { i18n } from '../translations/i18n.js';

export const load = handleSSR(i18n); // That's it!
```

```svelte
<!-- +layout.svelte -->
<script>
	import { handleClient } from '@shelchin/svelte-i18n';
	import { i18n } from '../translations/i18n.js';

	let { data, children } = $props();
	handleClient(i18n, data); // That's it!
</script>

{@render children()}
```

### For Static Sites (No SSR)

```typescript
// +layout.ts
import { handleUniversal } from '@shelchin/svelte-i18n';
import { i18n } from '../translations/i18n.js';
import { browser } from '$app/environment';

export const load = handleUniversal(i18n, browser); // That's it!
```

## 📋 Comparison: Before vs After

### Before (Complex Logic)

```typescript
// +layout.server.ts - 78 lines of complex logic
export const load: LayoutServerLoad = async ({ cookies }) => {
	const cookieLocale = cookies.get('i18n-locale');
	const locale = cookieLocale || i18n.locale || 'zh';

	if (cookieLocale && !i18n.locales.includes(cookieLocale)) {
		if (isAutoDiscoveredLocale(cookieLocale, 'app')) {
			const loaded = loadServerTranslations(i18n, cookieLocale, 'app');
			if (loaded) {
				await i18n.setLocale(cookieLocale);
			}
		}
	} else if (cookieLocale && i18n.locales.includes(cookieLocale)) {
		await i18n.setLocale(cookieLocale);
	}

	// ... 50+ more lines of logic
};
```

### After (Simple)

```typescript
// +layout.server.ts - 1 line!
export const load = handleSSR(i18n);
```

## 🎯 Custom Options

If you need more control, use the helper functions directly:

### Server-Side (+layout.server.ts)

```typescript
import { i18nServerLoad } from '@shelchin/svelte-i18n';

export const load = async ({ cookies }) => {
	return await i18nServerLoad(i18n, cookies, {
		cookieName: 'my-locale', // Custom cookie name
		defaultLocale: 'zh' // Custom default
	});
};
```

### Client-Side (+layout.svelte)

```svelte
<script>
	import { onMount } from 'svelte';
	import { i18nClientInit, i18nIsReady } from '@shelchin/svelte-i18n';

	let { data, children } = $props();
	let isReady = $state(i18nIsReady(i18n, data));

	onMount(async () => {
		await i18nClientInit(i18n, data, {
			storageKey: 'my-locale', // Custom localStorage key
			autoLoad: true // Auto-load translations
		});
		isReady = true;
	});
</script>

{#if isReady}
	{@render children()}
{:else}
	<div>Loading...</div>
{/if}
```

## 📦 What These Helpers Do

### `handleSSR(i18n)`

- Reads locale from cookies
- Sets the locale in i18n instance
- Returns locale data for hydration
- Handles auto-discovered languages

### `handleClient(i18n, data)`

- Loads translations automatically
- Reads saved locale from localStorage
- Syncs with server locale
- Prevents hydration flash

### `handleUniversal(i18n, browser)`

- Works for both SSR and static sites
- Handles browser detection
- Manages locale persistence
- Provides universal data structure

## 🔧 Migration Guide

### Step 1: Install Latest Version

```bash
pnpm add @shelchin/svelte-i18n@latest
```

### Step 2: Replace Your Layout Files

Replace your complex layout files with the simple versions:

1. **+layout.server.ts**: Replace with `handleSSR(i18n)`
2. **+layout.svelte**: Replace with `handleClient(i18n, data)`
3. **+layout.ts**: Replace with `handleUniversal(i18n, browser)` (if using)

### Step 3: Test

Your i18n should work exactly as before, but with much cleaner code!

## 💡 Benefits

- **90% Less Code**: From ~200 lines to ~5 lines total
- **Zero Logic**: No complex conditions or state management
- **Type-Safe**: Full TypeScript support
- **Battle-Tested**: All edge cases handled internally
- **Maintainable**: Updates happen in the package, not your code

## 🎉 Result

Your entire i18n setup is now just 3 lines of code:

```
+layout.server.ts: 1 line
+layout.svelte: 2 lines
Total: 3 lines! 🚀
```

Compare this to the 200+ lines typically needed for proper i18n setup with SSR, auto-discovery, persistence, and hydration handling!
