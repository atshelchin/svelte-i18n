/**
 * Library's own i18n configuration
 * Used by the library's own components
 * Type-safe version with compile-time key checking
 */

import { createTypedUnifiedI18n, initTypedI18n, type UnifiedI18nConfig } from '../typed-unified.js';
import { getI18nInstance } from '../unified.js';
import type { LibI18nPath } from '../types/lib-i18n-generated.js';
import type { I18nInstance } from '../domain/models/types.js';

// Auto-scan and import library's own translations from locales directory
const translationModules = import.meta.glob('./locales/*.json', {
	eager: true,
	import: 'default'
});

const translations: Record<string, any> = {};

// Extract language code from file path and build translations object
for (const [path, module] of Object.entries(translationModules)) {
	// Extract language code from path like './locales/en.json'
	const match = path.match(/\/([^/]+)\.json$/);
	if (match && match[1]) {
		const langCode = match[1];
		translations[langCode] = module;
	}
}

// Package name - hardcoded to avoid Vite serving issues
const packageName = '@shelchin/svelte-i18n';

// Create library's i18n instance with type safety
// Note: interpolation and formats will be inherited from the main app if available
const config: UnifiedI18nConfig = {
	namespace: packageName, // Library namespace from package.json
	translations, // Built-in translations
	defaultLocale: 'en',
	fallbackLocale: 'en',
	// These are fallback defaults if not inherited from main app
	interpolation: {
		prefix: '{',
		suffix: '}'
	},
	formats: {
		date: { year: 'numeric' as const, month: 'short' as const, day: 'numeric' as const },
		time: { hour: '2-digit' as const, minute: '2-digit' as const },
		number: { minimumFractionDigits: 0, maximumFractionDigits: 2 },
		currency: { style: 'currency' as const, currency: 'USD' }
	}
};

// Export type-safe version for internal components
export const libI18n = createTypedUnifiedI18n<LibI18nPath>(config);

// Auto-initialize the library i18n when in browser
if (typeof window !== 'undefined') {
	// Initialize asynchronously
	initTypedI18n(libI18n).catch((err) => {
		console.error('Failed to initialize library i18n:', err);
	});
}

// Helper to get the effective i18n instance
// Try to use app's package instance if available, otherwise use library's own
export function getEffectiveLibI18n(): I18nInstance {
	try {
		// Try to get the app's package instance
		return getI18nInstance(packageName);
	} catch {
		// Fallback to library's own instance
		return libI18n as I18nInstance;
	}
}

// For backward compatibility
export function getLibI18n() {
	return libI18n;
}
