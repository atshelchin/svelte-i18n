# ValidationPopup Component with Namespace Isolation

## Overview

The `ValidationPopup` component now supports namespace isolation for translations, allowing it to maintain its own set of translations independent from the main application's i18n instance.

## Key Features

1. **Namespace Isolation**: Uses `svelte-i18n-validation` namespace to prevent conflicts with application translations
2. **Automatic Locale Sync**: Syncs with the main i18n locale when available
3. **Fallback Support**: Falls back to English if translation is not available
4. **Dynamic Loading**: Can load additional languages at runtime

## Usage

### Basic Usage

```svelte
<script>
	import { ValidationPopup } from 'svelte-i18n';
</script>

<!-- The component will automatically use its own namespaced translations -->
<ValidationPopup />
```

### Loading Additional Languages

```typescript
import { loadValidationPopupLanguage } from 'svelte-i18n/components/validation-popup-i18n';

// Load French translations for ValidationPopup
await loadValidationPopupLanguage('fr', {
	_meta: {
		name: 'Français',
		englishName: 'French',
		direction: 'ltr',
		flag: '🇫🇷',
		code: 'fr'
	},
	validationPopup: {
		header: {
			title: 'Rapport de validation des traductions',
			issues: '{count} problèmes',
			languages: '{count} langues',
			close: 'Fermer'
		}
		// ... rest of translations
	}
});
```

## Translation Structure

The component expects translations under the `validationPopup` key:

```json
{
	"validationPopup": {
		"header": {
			"title": "Translation Validation Report",
			"issues": "{count} issues",
			"languages": "{count} languages",
			"close": "Close"
		},
		"controls": {
			"languageLabel": "Language:",
			"languageOption": "{flag} {name} ({count} errors)",
			"export": "Export"
		},
		"exportMenu": {
			"downloadJSON": "Download JSON",
			"downloadText": "Download Text Report",
			"copyJSON": "Copy JSON to Clipboard",
			"copied": "Copied to clipboard!"
		},
		"pagination": {
			"page": "Page {current} / {total}",
			"previous": "Previous",
			"next": "Next"
		},
		"emptyState": {
			"selectLanguage": "Please select a language from the dropdown above",
			"noErrors": "No validation errors for this language"
		},
		"floatingIndicator": {
			"translationIssues": "Translation Issues"
		},
		"report": {
			"title": "Missing Translations Report",
			"language": "Language: {name} ({code})",
			"totalMissing": "Total missing keys: {count}",
			"details": "Details:",
			"generatedAt": "Generated at: {date}",
			"todoTranslate": "[TODO: Translate to {language}]"
		}
	}
}
```

## Namespace Benefits

1. **No Conflicts**: Component translations won't interfere with application translations
2. **Package Distribution**: Can be distributed as part of a library without worrying about translation key conflicts
3. **Independent Updates**: Component translations can be updated independently of application translations
4. **Multiple Instances**: Multiple packages can use this i18n library without conflicts

## Implementation Details

The component uses a separate i18n instance with the namespace `svelte-i18n-validation`. This ensures:

- Component translations are stored separately from application translations
- The component can be used in any application without requiring specific translation keys
- Libraries using this component can provide their own translations without affecting the host application
