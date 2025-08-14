# SvelteKit Integration Module

This directory contains all SvelteKit-specific functionality for the i18n library.

## Structure

### Core Load Functions
- **load.ts** - Main entry point for all SvelteKit load functions
- **ssr-load.ts** - Server-side rendering load function for +layout.server.ts
- **universal-load.ts** - Universal load function for +layout.ts
- **client-init.ts** - Client-side initialization for +layout.svelte

### Routing Utilities
- **pathname-locale.ts** - Extract and validate locale from URL pathname
- **url-locale.ts** - Remove locale codes from URLs

### Compatibility
- **compat.ts** - Backward compatibility layer for deprecated APIs

## Usage

### Server-Side (+layout.server.ts)
```typescript
import { loadI18nSSR } from '@shelchin/svelte-i18n';
import { i18n } from '../translations/i18n.js';

export const load = async ({ cookies, url }) => {
  return await loadI18nSSR(i18n, cookies, url);
};
```

### Universal (+layout.ts)
```typescript
import { loadI18nUniversal } from '@shelchin/svelte-i18n';
import { i18n } from '../translations/i18n.js';

export const load = async ({ data, url }) => {
  return await loadI18nUniversal(i18n, data, url);
};
```

### Client-Side (+layout.svelte)
```svelte
<script>
  import { setupI18nClient } from '@shelchin/svelte-i18n';
  import { i18n } from '../translations/i18n.js';
  
  setupI18nClient(i18n);
</script>
```

## Features

- **Pathname Locale Detection**: Automatically detect locale from URL pathname (e.g., /zh/about, /en-US/products)
- **Cookie Persistence**: Store user's language preference in cookies for SSR
- **localStorage Support**: Client-side language persistence
- **Auto-Discovery**: Dynamically load translation files at runtime
- **SSR/CSR Compatibility**: Seamless hydration between server and client