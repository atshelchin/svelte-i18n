/**
 * Application i18n configuration and translations
 * This file handles all translation imports and i18n setup
 *
 * Using unified API with type safety for translation keys
 */

import { createTypedUnifiedI18n, type UnifiedI18nConfig } from '$lib/typed-unified.js';
import type { I18nPath } from '../types/app-i18n-generated.js';

// ============================================
// Auto-scan and import translations from locales directories
// ============================================

// App translations - auto-scan locales directory
const appTranslationModules = import.meta.glob('./locales/*.json', {
	eager: true,
	import: 'default'
});

const appTranslations: Record<string, any> = {};

// Extract language code from file path and build translations object
for (const [path, module] of Object.entries(appTranslationModules)) {
	// Extract language code from path like './locales/en.json'
	const match = path.match(/\/([^/]+)\.json$/);
	if (match && match[1]) {
		const langCode = match[1];
		appTranslations[langCode] = module;
	}
}

// ============================================
// Configure and initialize i18n using unified API
// ============================================

const config: UnifiedI18nConfig = {
	namespace: 'app', // Main application namespace
	isMain: true, // This is the main app instance
	defaultLocale: 'zh',
	fallbackLocale: 'zh',
	translations: appTranslations,
	interpolation: {
		prefix: '{',
		suffix: '}'
	},
	formats: {
		date: { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const },
		time: { hour: '2-digit' as const, minute: '2-digit' as const },
		number: { minimumFractionDigits: 0, maximumFractionDigits: 2 },
		currency: { style: 'currency' as const, currency: 'USD' }
	}
};

// Create main app i18n instance with type safety
// Now i18n.t() will only accept valid keys from I18nPath
export const i18n = createTypedUnifiedI18n<I18nPath>(config);

// ============================================
// Export for use in application
// ============================================

// Export getI18n function for typed access
export function getI18n() {
	return i18n;
}

export default i18n;
