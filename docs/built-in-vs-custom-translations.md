# Built-in vs Custom Translations

## Overview

The svelte-i18n library supports both **built-in translations** (bundled with packages) and **custom user translations** (loaded from static files). This document explains how they work together.

## Translation Loading Priority

### 1. Built-in Translations (Base Layer)

- **Location**: Bundled within the package/component (e.g., `src/lib/components/translations/*.json`)
- **Loading**: Imported directly via ES modules and loaded automatically
- **Purpose**: Provide default translations that work out-of-the-box

### 2. Custom User Translations (Override Layer)

- **Location**: `static/translations/` directory in your app
- **Loading**: Via auto-discovery (HTTP fetch at runtime)
- **Purpose**: Allow users to customize or extend translations

## How It Works

```javascript
// When a component initializes its i18n:
1. Load built-in translations first (always available)
2. Attempt auto-discovery for user overrides
3. If found, merge user translations (user overrides built-in)
```

## Example: ValidationPopup Component

The ValidationPopup component demonstrates this pattern:

### Built-in Translations

```javascript
// Bundled with the package
import validationPopupEn from './translations/validation-popup-en.json';
import validationPopupZh from './translations/validation-popup-zh.json';

// Always loaded as base
await i18n.loadLanguage('en', validationPopupEn);
await i18n.loadLanguage('zh', validationPopupZh);
```

### User Override Options

Users can override by placing files in:

- `static/translations/validation-popup.en.json`
- `static/translations/svelte-i18n-validation.en.json`
- `static/translations/components/validation-popup.en.json`

## Priority Rules

1. **Built-in translations are ALWAYS loaded first** - ensures the component works even without custom translations
2. **User translations are OPTIONAL** - if found, they override/extend built-in ones
3. **Partial overrides are supported** - users only need to override specific keys, not the entire file

## Example User Override

If the built-in English translation has:

```json
{
	"validationPopup": {
		"header": {
			"title": "Translation Validation Report",
			"close": "Close"
		}
	}
}
```

User can create `static/translations/validation-popup.en.json`:

```json
{
	"validationPopup": {
		"header": {
			"title": "My Custom Title"
		}
	}
}
```

Result after merge:

```json
{
	"validationPopup": {
		"header": {
			"title": "My Custom Title", // User override
			"close": "Close" // Built-in retained
		}
	}
}
```

## Benefits

1. **Zero Configuration**: Components work immediately with built-in translations
2. **Customizable**: Users can override any translation without modifying packages
3. **Maintainable**: Package updates don't overwrite user customizations
4. **Partial Overrides**: Users only override what they need
5. **Multiple Override Paths**: Flexibility in file organization

## Best Practices

### For Package Authors

1. Always provide comprehensive built-in translations
2. Use meaningful namespaces to avoid conflicts
3. Document available translation keys
4. Make built-in translations high quality - many users won't override

### For Application Developers

1. Only override translations you need to customize
2. Use consistent file naming patterns
3. Keep overrides in version control
4. Test that your overrides work correctly

## Debugging

In development mode, you'll see console messages:

```
ValidationPopup i18n initialized with built-in translations.
User can override by placing files in static/translations/validation-popup.{locale}.json
```

If auto-discovery finds user translations:

```
✅ Loaded translations from /translations/validation-popup.en.json
```

## Implementation Details

The merge strategy uses deep merging:

- Objects are merged recursively
- Arrays are replaced entirely
- Primitive values (strings, numbers) are overwritten
- `_meta` fields are preserved separately

This ensures that user translations can:

- Add new keys
- Override existing keys
- Extend nested structures
- Without breaking the component
