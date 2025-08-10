/**
 * Built-in translations registry
 * All translations are imported and bundled with the application
 */

// App translations
import appEn from './app/en.json' with { type: 'json' };
import appZh from './app/zh.json' with { type: 'json' };
import appJa from './app/ja.json' with { type: 'json' };
import appFr from './app/fr.json' with { type: 'json' };
import appDe from './app/de.json' with { type: 'json' };
import appEs from './app/es.json' with { type: 'json' };
import appPt from './app/pt.json' with { type: 'json' };
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

/**
 * All built-in translations organized by namespace and locale
 */
export const builtInTranslations = {
	// Application translations (no namespace)
	app: {
		en: appEn,
		zh: appZh,
		ja: appJa,
		fr: appFr,
		de: appDe,
		es: appEs,
		pt: appPt,
		ru: appRu,
		ar: appAr,
		hi: appHi,
		ko: appKo,
		'zh-TW': appZhTW
	},
	// Package translations (namespaced)
	'@shelchin/svelte-i18n': {
		en: pkgEn,
		zh: pkgZh,
		ja: pkgJa,
		fr: pkgFr
	}
} as const;

/**
 * Get all available locales (union of all namespaces)
 */
export function getAvailableLocales(): string[] {
	const locales = new Set<string>();
	for (const namespace of Object.values(builtInTranslations)) {
		for (const locale of Object.keys(namespace)) {
			locales.add(locale);
		}
	}
	return Array.from(locales);
}

/**
 * Get translation for a specific namespace and locale
 */
export function getTranslation(namespace: string, locale: string) {
	return builtInTranslations[namespace as keyof typeof builtInTranslations]?.[
		locale as keyof (typeof builtInTranslations)[keyof typeof builtInTranslations]
	];
}

/**
 * Get all translations for a locale (merged from all namespaces)
 */
export function getMergedTranslations(locale: string): Record<string, any> {
	const merged: Record<string, any> = {};
	
	// First add app translations (no prefix)
	const appTranslation = builtInTranslations.app[locale as keyof typeof builtInTranslations.app];
	if (appTranslation) {
		Object.assign(merged, appTranslation);
	}
	
	// Then add namespaced translations
	for (const [namespace, translations] of Object.entries(builtInTranslations)) {
		if (namespace === 'app') continue;
		
		const translation = translations[locale as keyof typeof translations];
		if (translation) {
			// Add with namespace prefix
			for (const [key, value] of Object.entries(translation)) {
				merged[`${namespace}.${key}`] = value;
			}
		}
	}
	
	return merged;
}