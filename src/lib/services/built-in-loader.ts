/**
 * Built-in translations loader
 * Loads translations that are bundled with the application
 */

import type { I18nInstance, TranslationSchema } from '$lib/core/types.js';

// Type for translation registry
export interface TranslationRegistry {
	[namespace: string]: {
		[locale: string]: Record<string, unknown>;
	};
}

// Global registry for built-in translations
let globalRegistry: TranslationRegistry = {};

/**
 * Clear all registered translations (for testing)
 */
export function clearRegisteredTranslations() {
	globalRegistry = {};
}

/**
 * Register built-in translations
 * This should be called during app initialization
 */
export function registerBuiltInTranslations(translations: TranslationRegistry) {
	globalRegistry = { ...globalRegistry, ...translations };
}

/**
 * Load built-in translations into the store synchronously
 * Used during SSR to ensure translations are available immediately
 */
export function loadBuiltInTranslationsSync(store: I18nInstance): void {
	const storeNamespace = store.getNamespace();

	// Determine which translations to load based on namespace
	if (storeNamespace === 'app') {
		// App instance: load only app translations
		if (globalRegistry.app) {
			for (const [locale, translation] of Object.entries(globalRegistry.app)) {
				(store as any).loadLanguageSync(locale, translation as TranslationSchema);
			}
		}
	} else if (storeNamespace && globalRegistry[storeNamespace]) {
		// Package instance: load only that package's translations
		for (const [locale, translation] of Object.entries(globalRegistry[storeNamespace])) {
			(store as any).loadLanguageSync(locale, translation as TranslationSchema);
		}
	}
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
	// Handle 'app' namespace consistently
	if (storeNamespace === 'app') {
		// App instance: load only app translations
		if (globalRegistry.app) {
			for (const locale of Object.keys(globalRegistry.app)) {
				loadedLocales.add(locale);
			}
		}
	} else if (storeNamespace && globalRegistry[storeNamespace]) {
		// Package instance: load only that package's translations
		for (const locale of Object.keys(globalRegistry[storeNamespace])) {
			loadedLocales.add(locale);
		}
	}

	// Load translations for each locale
	for (const locale of loadedLocales) {
		try {
			let translations: Record<string, unknown> = {};

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
				await store.loadLanguage(locale, translations as TranslationSchema);
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
	translations: Record<string, Record<string, unknown>>
) {
	if (!globalRegistry[packageName]) {
		globalRegistry[packageName] = {};
	}

	for (const [locale, translation] of Object.entries(translations)) {
		globalRegistry[packageName][locale] = translation;
	}
}
