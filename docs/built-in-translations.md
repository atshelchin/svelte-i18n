# Built-in Translations

The `@shelchin/svelte-i18n` package includes built-in translations that are bundled with the npm package. This ensures users get a working i18n setup out of the box without any additional configuration.

## How It Works

### 1. Built-in Translations (Bundled with Package)

The package includes default translations in `src/lib/assets/translations/`:

- `en.json` - English translations
- `zh.json` - Chinese translations

These are automatically loaded when you use package components like `ValidationPopup`.

### 2. User Overrides (Optional)

Users can override or extend the built-in translations by placing files in their project's `static/translations/@shelchin/` directory:

- `static/translations/@shelchin/svelte-i18n.en.json`
- `static/translations/@shelchin/svelte-i18n.fr.json`
- etc.

## Using Built-in Translations in Your Code

### Direct Import

```typescript
import { builtInTranslations, getBuiltInTranslation } from '@shelchin/svelte-i18n';

// Get all built-in translations
console.log(builtInTranslations); // { en: {...}, zh: {...} }

// Get specific locale
const enTranslations = getBuiltInTranslation('en');
```

### Automatic Loading

Components like `ValidationPopup` automatically load built-in translations:

```typescript
// This happens internally in ValidationPopup
const i18n = setupI18n({
	namespace: '@shelchin/svelte-i18n'
	// ...
});

// Built-in translations are loaded automatically
for (const [locale, translations] of Object.entries(builtInTranslations)) {
	await i18n.loadLanguage(locale, translations);
}
```

## Adding Custom Translations

### For Package Users

To add or override translations, create files in your project:

```
your-app/
└── static/
    └── translations/
        └── @shelchin/
            ├── svelte-i18n.fr.json  # Add French
            ├── svelte-i18n.ja.json  # Add Japanese
            └── svelte-i18n.en.json  # Override English
```

### Translation File Structure

```json
{
	"_meta": {
		"name": "Français",
		"englishName": "French",
		"direction": "ltr",
		"flag": "🇫🇷",
		"code": "fr"
	},
	"validationPopup": {
		"header": {
			"title": "Rapport de validation"
			// ... more translations
		}
	}
}
```

## Priority Order

1. **User-provided translations** (in `static/translations/@shelchin/`)
2. **Built-in translations** (bundled with package)
3. **Fallback locale** (if configured)

## Benefits

1. **Zero Configuration**: Works immediately after installation
2. **No Manual Copying**: Built-in translations are part of the package
3. **Extensible**: Users can add more languages without modifying the package
4. **Override-able**: Users can customize existing translations
5. **Tree-shakeable**: Import only what you need

## Example Usage

```svelte
<script>
	import { ValidationPopup } from '@shelchin/svelte-i18n';

	// ValidationPopup automatically uses built-in translations
	// No configuration needed!
</script>

<ValidationPopup />
```

## For Package Developers

When adding new built-in translations:

1. Add the JSON file to `src/lib/assets/translations/`
2. Update `src/lib/assets/translations/index.ts` to export it
3. The translation will be bundled with the next package release

This approach ensures that:

- Translations are always available (bundled with package)
- Users can extend without modifying node_modules
- Package works out of the box with no setup
