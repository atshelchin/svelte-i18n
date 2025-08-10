/**
 * Application i18n configuration and translations
 * This file handles all translation imports and i18n setup
 */

import { registerBuiltInTranslations } from '$lib/index.js';

import { createTypedI18n } from '$lib/typed-export.js';
import type { I18nPath } from '../types/app-i18n-generated.js';

// Create typed versions with app-specific types
export const { getI18n, setupI18n } = createTypedI18n<I18nPath>();
// ============================================
// Import all translation JSON files
// ============================================

// App translations
import appEn from './app/en.json' with { type: 'json' };
import appZh from './app/zh.json' with { type: 'json' };
import appJa from './app/ja.json' with { type: 'json' };
import appFr from './app/fr.json' with { type: 'json' };
import appDe from './app/de.json' with { type: 'json' };
import appAr from './app/ar.json' with { type: 'json' };
import appZhTW from './app/zh-TW.json' with { type: 'json' };

// Package translations (@shelchin/svelte-i18n)
import pkgEn from './@shelchin/svelte-i18n/en.json' with { type: 'json' };
import pkgZh from './@shelchin/svelte-i18n/zh.json' with { type: 'json' };
import pkgJa from './@shelchin/svelte-i18n/ja.json' with { type: 'json' };

// ============================================
// Organize translations by namespace
// ============================================

const builtInTranslations = {
	// Application translations (no namespace prefix)
	app: {
		en: appEn,
		zh: appZh,
		ja: appJa,
		fr: appFr,
		de: appDe,
		ar: appAr,
		'zh-TW': appZhTW
	},
	// Package translations (with namespace prefix)
	'@shelchin/svelte-i18n': {
		en: pkgEn,
		zh: pkgZh,
		ja: pkgJa
	}
};

// ============================================
// Register translations
// ============================================

// Register all built-in translations globally
registerBuiltInTranslations(builtInTranslations);

// ============================================
// Configure and initialize i18n
// ============================================

const i18nConfig = {
	defaultLocale: 'en',
	fallbackLocale: 'en',
	interpolation: {
		prefix: '{',
		suffix: '}'
	},
	formats: {
		date: { year: 'numeric', month: 'long', day: 'numeric' },
		time: { hour: '2-digit', minute: '2-digit' },
		number: { minimumFractionDigits: 0, maximumFractionDigits: 2 },
		currency: { style: 'currency', currency: 'USD' }
	}
};

// Create and initialize i18n instance
function createI18nInstance() {
	const instance = setupI18n(i18nConfig);
	
	// Load built-in translations synchronously
	for (const [locale, translations] of Object.entries(builtInTranslations.app)) {
		// @ts-ignore - loadLanguageSync is not in the interface but exists on the implementation
		instance.loadLanguageSync(locale, translations);
	}
	
	return instance;
}

// Export a getter function that returns the instance
// On client-side, this will return the same cached instance
// On server-side, we'll create a new instance per request in +layout.server.ts
export const i18n = createI18nInstance();

// ============================================
// Client-side auto-discovery
// ============================================

// Don't auto-load on client side - let +layout.svelte handle it
// This prevents conflict with server-provided locale

// ============================================
// Export for use in application
// ============================================

export { builtInTranslations, createI18nInstance };
export default i18n;
