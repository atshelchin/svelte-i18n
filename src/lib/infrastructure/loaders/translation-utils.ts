/**
 * Utility functions for translation management
 * These functions help organize and access translations
 */

import type { TranslationRegistry } from './built-in.js';

/**
 * Get all available locales from a translation registry
 */
export function getAvailableLocales(registry: TranslationRegistry): string[] {
	const locales = new Set<string>();
	for (const namespace of Object.values(registry)) {
		for (const locale of Object.keys(namespace)) {
			locales.add(locale);
		}
	}
	return Array.from(locales);
}

/**
 * Get translation for a specific namespace and locale
 */
export function getTranslation(
	registry: TranslationRegistry,
	namespace: string,
	locale: string
): Record<string, any> | undefined {
	return registry[namespace]?.[locale];
}

/**
 * Merge all translations for a specific locale across namespaces
 */
export function getMergedTranslations(
	registry: TranslationRegistry,
	locale: string
): Record<string, any> {
	const merged: Record<string, any> = {};
	
	// First add app translations (no prefix)
	const appTranslation = registry.app?.[locale];
	if (appTranslation) {
		Object.assign(merged, appTranslation);
	}
	
	// Then add namespaced translations
	for (const [namespace, translations] of Object.entries(registry)) {
		if (namespace === 'app') continue;
		
		const translation = translations[locale];
		if (translation) {
			// Add with namespace prefix
			for (const [key, value] of Object.entries(translation)) {
				merged[`${namespace}.${key}`] = value;
			}
		}
	}
	
	return merged;
}

/**
 * Check if a locale is available in the registry
 */
export function isLocaleAvailable(
	registry: TranslationRegistry,
	locale: string
): boolean {
	for (const namespace of Object.values(registry)) {
		if (locale in namespace) {
			return true;
		}
	}
	return false;
}

/**
 * Get all namespaces in the registry
 */
export function getNamespaces(registry: TranslationRegistry): string[] {
	return Object.keys(registry);
}

/**
 * Get all locales for a specific namespace
 */
export function getNamespaceLocales(
	registry: TranslationRegistry,
	namespace: string
): string[] {
	return Object.keys(registry[namespace] || {});
}