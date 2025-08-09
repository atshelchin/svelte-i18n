# Adding Language Support to ValidationPopup

## Overview

The ValidationPopup component supports automatic language loading from your application's `static/translations` directory. This means you can add new language support without modifying any package code.

## Quick Start

To add a new language (e.g., German) to ValidationPopup:

1. Create a file in your app's `static/translations/` directory
2. Name it following the convention: `validation-popup.{locale}.json`
3. The component will automatically detect and load it

## File Naming Conventions

The component looks for translation files in this order:

1. `/translations/validation-popup.{locale}.json` (recommended)
2. `/translations/svelte-i18n-validation.{locale}.json`
3. `/translations/components/validation-popup.{locale}.json`

Where `{locale}` is the language code (e.g., `de`, `fr`, `ja`)

## Translation File Structure

Your translation file must follow this structure:

```json
{
	"_meta": {
		"name": "Deutsch",
		"englishName": "German",
		"direction": "ltr",
		"flag": "🇩🇪",
		"code": "de"
	},
	"validationPopup": {
		"header": {
			"title": "Übersetzungsvalidierungsbericht",
			"issues": "{count} Problem|{count} Probleme",
			"languages": "{count} Sprache|{count} Sprachen",
			"close": "Schließen"
		},
		"controls": {
			"languageLabel": "Sprache:",
			"languageOption": "{flag} {name} ({count} Fehler)",
			"export": "Exportieren"
		},
		"exportMenu": {
			"downloadJSON": "JSON herunterladen",
			"downloadText": "Textbericht herunterladen",
			"copyJSON": "JSON in Zwischenablage kopieren",
			"copied": "In Zwischenablage kopiert!"
		},
		"pagination": {
			"page": "Seite {current} von {total}",
			"previous": "Zurück",
			"next": "Weiter"
		},
		"emptyState": {
			"selectLanguage": "Bitte wählen Sie eine Sprache aus dem Dropdown-Menü oben",
			"noErrors": "Keine Validierungsfehler für diese Sprache"
		},
		"floatingIndicator": {
			"translationIssues": "Übersetzungsprobleme"
		},
		"report": {
			"title": "Bericht über fehlende Übersetzungen",
			"language": "Sprache: {name} ({code})",
			"totalMissing": "Gesamt fehlende Schlüssel: {count}",
			"details": "Details:",
			"generatedAt": "Generiert am: {date}",
			"todoTranslate": "[TODO: Übersetzen nach {language}]"
		}
	}
}
```

## Complete Example: Adding Japanese Support

1. Create `/static/translations/validation-popup.ja.json`:

```json
{
	"_meta": {
		"name": "日本語",
		"englishName": "Japanese",
		"direction": "ltr",
		"flag": "🇯🇵",
		"code": "ja"
	},
	"validationPopup": {
		"header": {
			"title": "翻訳検証レポート",
			"issues": "{count}件の問題",
			"languages": "{count}言語",
			"close": "閉じる"
		},
		"controls": {
			"languageLabel": "言語：",
			"languageOption": "{flag} {name} ({count}件のエラー)",
			"export": "エクスポート"
		},
		"exportMenu": {
			"downloadJSON": "JSONをダウンロード",
			"downloadText": "テキストレポートをダウンロード",
			"copyJSON": "JSONをクリップボードにコピー",
			"copied": "クリップボードにコピーしました！"
		},
		"pagination": {
			"page": "{total}ページ中{current}ページ",
			"previous": "前へ",
			"next": "次へ"
		},
		"emptyState": {
			"selectLanguage": "上のドロップダウンメニューから言語を選択してください",
			"noErrors": "この言語には検証エラーがありません"
		},
		"floatingIndicator": {
			"translationIssues": "翻訳の問題"
		},
		"report": {
			"title": "不足している翻訳のレポート",
			"language": "言語：{name} ({code})",
			"totalMissing": "不足しているキーの総数：{count}",
			"details": "詳細：",
			"generatedAt": "生成日時：{date}",
			"todoTranslate": "[TODO: {language}に翻訳]"
		}
	}
}
```

2. The component will automatically load it when the locale is set to `ja`

## Advanced: Programmatic Loading

If you need more control, you can also load translations programmatically:

```typescript
import { loadValidationPopupLanguage } from 'svelte-i18n/components/validation-popup-i18n';

// Load custom translations
await loadValidationPopupLanguage('de', {
	_meta: {
		/* ... */
	},
	validationPopup: {
		/* ... */
	}
});
```

## Benefits of This Approach

1. **Zero Configuration**: Just add files following the naming convention
2. **No Package Modifications**: Keep your package dependencies clean
3. **Version Independence**: Update translations without updating the package
4. **Team Collaboration**: Translators can work independently by adding JSON files
5. **Dynamic Loading**: Only loads translations when needed
6. **Fallback Support**: Falls back to English if translation is incomplete

## Troubleshooting

### Translations Not Loading

1. Check the browser console for loading messages
2. Verify file is accessible at `/translations/validation-popup.{locale}.json`
3. Ensure JSON is valid (use a JSON validator)
4. Check that the structure includes the `validationPopup` key

### Testing Your Translations

```javascript
// In your browser console
fetch('/translations/validation-popup.de.json')
	.then((r) => r.json())
	.then(console.log)
	.catch(console.error);
```

## Translation Key Reference

Here are all the keys that need translation:

- `validationPopup.header.title` - Main popup title
- `validationPopup.header.issues` - Issue count (supports pluralization)
- `validationPopup.header.languages` - Language count (supports pluralization)
- `validationPopup.header.close` - Close button text
- `validationPopup.controls.languageLabel` - Language selector label
- `validationPopup.controls.languageOption` - Language option format
- `validationPopup.controls.export` - Export button text
- `validationPopup.exportMenu.downloadJSON` - JSON download option
- `validationPopup.exportMenu.downloadText` - Text download option
- `validationPopup.exportMenu.copyJSON` - Copy to clipboard option
- `validationPopup.exportMenu.copied` - Success message after copying
- `validationPopup.pagination.page` - Page indicator
- `validationPopup.pagination.previous` - Previous button
- `validationPopup.pagination.next` - Next button
- `validationPopup.emptyState.selectLanguage` - Prompt to select language
- `validationPopup.emptyState.noErrors` - No errors message
- `validationPopup.floatingIndicator.translationIssues` - Floating button text
- `validationPopup.report.*` - Various report generation strings

## Contributing Translations

We welcome translation contributions! To contribute:

1. Fork the repository
2. Add your translation file to `static/translations/`
3. Test it works with the ValidationPopup component
4. Submit a pull request

Your translation will be automatically available to all users once merged.
