# Auto-Discovery API

The svelte-i18n library provides a powerful auto-discovery feature that allows packages and applications to automatically load translation files from the static directory without modifying source code.

## Overview

Auto-discovery enables any namespaced i18n instance to automatically find and load translation files based on naming conventions. This is particularly useful for:

- **Library authors**: Ship components that automatically load translations
- **Application developers**: Add translations for third-party components without modifying their code
- **Team collaboration**: Translators can work independently by adding JSON files

## Quick Start

### For Package Authors

Enable auto-discovery when creating your i18n instance:

```typescript
import { setupI18n } from 'svelte-i18n';

const i18n = setupI18n({
	defaultLocale: 'en',
	namespace: 'my-awesome-package',
	autoDiscovery: true // Enable with defaults
});
```

Your package will automatically look for translations at:

- `/translations/my-awesome-package.{locale}.json`
- `/translations/my-awesome-package/{locale}.json`
- And other conventional patterns

### For Application Developers

To add translations for a third-party package:

1. Create a file in `static/translations/`
2. Name it `{package-namespace}.{locale}.json`
3. The package will automatically load it!

Example: Adding French translations for a calendar package:

```json
// static/translations/awesome-calendar.fr.json
{
	"_meta": {
		"name": "Français",
		"code": "fr"
	},
	"calendar": {
		"today": "Aujourd'hui",
		"month": "Mois",
		"week": "Semaine"
	}
}
```

## Configuration Options

### Basic Configuration

```typescript
const i18n = setupI18n({
	namespace: 'my-package',
	autoDiscovery: true // Enable with defaults
});
```

### Advanced Configuration

```typescript
const i18n = setupI18n({
	namespace: 'my-package',
	autoDiscovery: {
		baseUrl: '/translations', // Where to look for files
		patterns: [
			// File naming patterns to try
			'{namespace}.{locale}.json',
			'{namespace}/{locale}.json',
			'packages/{namespace}.{locale}.json'
		],
		locales: ['en', 'fr', 'de'], // Locales to pre-load
		debug: true // Log discovery attempts
	}
});
```

## File Naming Conventions

The auto-discovery system tries multiple naming patterns in order:

1. `{namespace}.{locale}.json` - Recommended
2. `{namespace}/{locale}.json` - Organized by package
3. `{namespace}-{locale}.json` - Alternative flat structure
4. `packages/{namespace}.{locale}.json` - Grouped packages
5. `components/{namespace}.{locale}.json` - Component packages

Where:

- `{namespace}` is the package's namespace
- `{locale}` is the language code (e.g., 'en', 'fr', 'ja')

## Real-World Example: ValidationPopup Component

The ValidationPopup component uses auto-discovery:

```typescript
// In the package
const i18n = setupI18n({
	namespace: 'svelte-i18n-validation',
	autoDiscovery: {
		patterns: [
			'validation-popup.{locale}.json', // Short alias
			'{namespace}.{locale}.json' // Full namespace
		]
	}
});
```

Users can add translations by creating:

- `/static/translations/validation-popup.fr.json`
- `/static/translations/svelte-i18n-validation.fr.json`

## API Reference

### setupI18n with Auto-Discovery

```typescript
import { setupI18n } from 'svelte-i18n';

const i18n = setupI18n({
  defaultLocale: string,
  namespace: string,
  autoDiscovery?: boolean | {
    baseUrl?: string,      // Default: '/translations'
    patterns?: string[],   // Default: Common patterns
    locales?: string[],    // Default: Common locales
    debug?: boolean        // Default: false (true in dev)
  }
});
```

### Manual Discovery Functions

```typescript
import { autoDiscoverTranslations } from 'svelte-i18n';

// Discover translations for a specific locale
const translations = await autoDiscoverTranslations('my-namespace', 'fr', {
	baseUrl: '/translations'
});

// Discover all available translations
const allTranslations = await autoDiscoverAllTranslations('my-namespace', { debug: true });
```

### Enhanced Config Helper

```typescript
import { withAutoDiscovery } from 'svelte-i18n';

// Add auto-discovery to existing config
const enhancedConfig = withAutoDiscovery(baseConfig, {
	baseUrl: '/custom/path'
});
```

## Benefits

1. **Zero Configuration**: Works out of the box with sensible defaults
2. **Convention over Configuration**: Follow naming patterns, everything just works
3. **No Source Modifications**: Add translations without touching package code
4. **Dynamic Loading**: Only loads translations when needed
5. **Fallback Support**: Gracefully handles missing translations
6. **Team Friendly**: Translators work independently with JSON files

## Best Practices

### For Package Authors

1. **Choose a unique namespace**: Avoid conflicts with other packages
2. **Document your namespace**: Tell users what files to create
3. **Provide fallback translations**: Include at least English
4. **Use semantic keys**: Make translation keys self-documenting

### For Application Developers

1. **Organize by package**: Keep translations grouped by namespace
2. **Version control translations**: Check them into your repository
3. **Validate JSON**: Ensure files are valid JSON before deployment
4. **Test loading**: Check browser console for loading confirmations

## Troubleshooting

### Translations Not Loading

1. Check the browser console for discovery logs (enable debug mode)
2. Verify file paths match expected patterns
3. Ensure JSON is valid
4. Check namespace matches exactly

### Debugging Discovery

```typescript
const i18n = setupI18n({
	namespace: 'my-package',
	autoDiscovery: {
		debug: true // Enable detailed logging
	}
});
```

### Testing Discovery

```javascript
// Browser console
fetch('/translations/my-package.fr.json')
	.then((r) => r.json())
	.then(console.log)
	.catch(console.error);
```

## Migration Guide

### From Custom Loaders

Before (custom loader):

```typescript
async function loadTranslations(locale) {
	const response = await fetch(`/path/to/${locale}.json`);
	return response.json();
}

const i18n = setupI18n({
	loadLocale: loadTranslations
});
```

After (auto-discovery):

```typescript
const i18n = setupI18n({
	namespace: 'my-package',
	autoDiscovery: true
});
// Automatically loads from /translations/my-package.{locale}.json
```

### From Manual Loading

Before (manual):

```typescript
await i18n.loadLanguage('fr', frenchTranslations);
await i18n.loadLanguage('de', germanTranslations);
```

After (auto-discovery):

```typescript
// Just set the locale, auto-discovery handles loading
await i18n.setLocale('fr'); // Automatically discovers and loads
await i18n.setLocale('de'); // Automatically discovers and loads
```

## Complete Example

Here's a complete example of a package using auto-discovery:

```typescript
// my-datepicker/i18n.ts
import { setupI18n } from 'svelte-i18n';

export const datepickerI18n = setupI18n({
  defaultLocale: 'en',
  fallbackLocale: 'en',
  namespace: 'my-datepicker',
  autoDiscovery: {
    patterns: [
      'datepicker.{locale}.json',      // Short alias
      '{namespace}.{locale}.json',     // Full namespace
      'components/{namespace}.{locale}.json'  // Grouped
    ],
    debug: import.meta.env.DEV
  }
});

// Load built-in English
await datepickerI18n.loadLanguage('en', {
  months: ['January', 'February', ...],
  weekdays: ['Sunday', 'Monday', ...],
  today: 'Today'
});
```

Users can add translations:

```json
// static/translations/datepicker.fr.json
{
  "months": ["Janvier", "Février", ...],
  "weekdays": ["Dimanche", "Lundi", ...],
  "today": "Aujourd'hui"
}
```

The component automatically loads and uses them!
