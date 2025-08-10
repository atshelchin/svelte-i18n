/**
 * Built-in translations loader
 * Loads translations that are bundled with the application
 */

import type { I18nInstance } from '../../domain/models/types.js';

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
	store: I18nInstance,
	options?: {
		onLoaded?: (locale: string) => void;
		onError?: (locale: string, error: Error) => void;
	}
): Promise<void> {
	const storeNamespace = store.getNamespace();
	const loadedLocales = new Set<string>();

	// Determine which translations to load based on namespace
	if (!storeNamespace || storeNamespace === 'app') {
		// App instance: load only app translations
		if (globalRegistry.app) {
			for (const locale of Object.keys(globalRegistry.app)) {
				loadedLocales.add(locale);
			}
		}
	} else {
		// Package instance: load only that package's translations
		if (globalRegistry[storeNamespace]) {
			for (const locale of Object.keys(globalRegistry[storeNamespace])) {
				loadedLocales.add(locale);
			}
		}
	}

	// Load translations for each locale
	for (const locale of loadedLocales) {
		try {
			let translations: Record<string, any> = {};

			if (!storeNamespace || storeNamespace === 'app') {
				// App instance: load app translations
				const appTranslation = globalRegistry.app?.[locale];
				if (appTranslation) {
					translations = appTranslation;
				}
			} else {
				// Package instance: load package-specific translations
				const packageTranslation = globalRegistry[storeNamespace]?.[locale];
				if (packageTranslation) {
					translations = packageTranslation;
				}
			}

			// Add to store if we have translations
			if (Object.keys(translations).length > 0) {
				await store.loadLanguage(locale, translations);
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
