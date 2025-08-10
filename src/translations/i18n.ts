/**
 * Application i18n configuration and translations
 * This file handles all translation imports and i18n setup
 */

import { setupI18n, registerBuiltInTranslations, loadBuiltInTranslations } from '$lib/index.js';

// ============================================
// Import all translation JSON files
// ============================================

// App translations
import appEn from './app/en.json' with { type: 'json' };
import appZh from './app/zh.json' with { type: 'json' };
import appJa from './app/ja.json' with { type: 'json' };
import appFr from './app/fr.json' with { type: 'json' };
import appDe from './app/de.json' with { type: 'json' };
import appEs from './app/es.json' with { type: 'json' };
import appRu from './app/ru.json' with { type: 'json' };
import appAr from './app/ar.json' with { type: 'json' };
import appHi from './app/hi.json' with { type: 'json' };
import appKo from './app/ko.json' with { type: 'json' };
import appZhTW from './app/zh-TW.json' with { type: 'json' };

// Package translations (@shelchin/svelte-i18n)
import pkgEn from './@shelchin/svelte-i18n/en.json' with { type: 'json' };
import pkgZh from './@shelchin/svelte-i18n/zh.json' with { type: 'json' };
import pkgJa from './@shelchin/svelte-i18n/ja.json' with { type: 'json' };
import pkgFr from './@shelchin/svelte-i18n/fr.json' with { type: 'json' };

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
		es: appEs,
		ru: appRu,
		ar: appAr,
		hi: appHi,
		ko: appKo,
		'zh-TW': appZhTW
	},
	// Package translations (with namespace prefix)
	'@shelchin/svelte-i18n': {
		en: pkgEn,
		zh: pkgZh,
		ja: pkgJa,
		fr: pkgFr
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

export const i18n = setupI18n({
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
});

// ============================================
// Auto-load translations on client side
// ============================================

if (typeof window !== 'undefined') {
	loadBuiltInTranslations(i18n).catch(console.error);
}

// ============================================
// Export for use in application
// ============================================

export { builtInTranslations };
export default i18n;
