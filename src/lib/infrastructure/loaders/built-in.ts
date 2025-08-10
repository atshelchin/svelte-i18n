/**
 * Built-in translations loader
 * Loads translations that are bundled with the application
 */

import type { I18nStore } from '../../application/stores/store.svelte.js';

// Type for translation registry
export interface TranslationRegistry {
	[namespace: string]: {
		[locale: string]: Record<string, any>;
	};
}

// Global registry for built-in translations
let globalRegistry: TranslationRegistry = {};

/**
 * Register built-in translations
 * This should be called during app initialization
 */
export function registerBuiltInTranslations(translations: TranslationRegistry) {
	globalRegistry = { ...globalRegistry, ...translations };
}

/**
 * Load built-in translations into the store
 */
export async function loadBuiltInTranslations(
	store: I18nStore,
	options?: {
		onLoaded?: (locale: string) => void;
		onError?: (locale: string, error: Error) => void;
	}
): Promise<void> {
	const loadedLocales = new Set<string>();
	
	// Collect all available locales
	for (const namespace of Object.values(globalRegistry)) {
		for (const locale of Object.keys(namespace)) {
			loadedLocales.add(locale);
		}
	}
	
	// Load translations for each locale
	for (const locale of loadedLocales) {
		try {
			const merged: Record<string, any> = {};
			
			// First add app translations (no prefix)
			const appTranslation = globalRegistry.app?.[locale];
			if (appTranslation) {
				Object.assign(merged, appTranslation);
			}
			
			// Then add namespaced translations
			for (const [namespace, translations] of Object.entries(globalRegistry)) {
				if (namespace === 'app') continue;
				
				const translation = translations[locale];
				if (translation) {
					// Add with namespace prefix
					for (const [key, value] of Object.entries(translation)) {
						merged[`${namespace}.${key}`] = value;
					}
				}
			}
			
			// Add to store if we have translations
			if (Object.keys(merged).length > 0) {
				await store.addTranslations(locale, merged);
				options?.onLoaded?.(locale);
			}
		} catch (error) {
			console.error(`Failed to load built-in translations for ${locale}:`, error);
			options?.onError?.(locale, error as Error);
		}
	}
}

/**
 * Auto-discover and register package translations
 * Packages can call this during their initialization
 */
export function registerPackageTranslations(
	packageName: string,
	translations: Record<string, Record<string, any>>
) {
	if (!globalRegistry[packageName]) {
		globalRegistry[packageName] = {};
	}
	
	for (const [locale, translation] of Object.entries(translations)) {
		globalRegistry[packageName][locale] = translation;
	}
}