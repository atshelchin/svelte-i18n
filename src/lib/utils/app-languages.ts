/**
 * Helper functions to determine which languages the app supports
 * This combines built-in languages with auto-discovered app languages
 */

import { DEV } from '$lib/utils/env.js';
import type { I18nInstance } from '$lib/core/types.js';
import { loadAutoDiscoveryConfig } from '$lib/services/discovery.js';

/**
 * Get all languages that the app supports (for language switching)
 * This includes:
 * 1. Built-in app languages (from the main app instance)
 * 2. Auto-discovered app languages (from index.json)
 *
 * This explicitly excludes package languages as packages should follow
 * the app's language selection.
 */
export async function getAppSupportedLanguages(
	i18n: I18nInstance,
	translationsPath = '/translations'
): Promise<string[]> {
	// For library components, we need to get the main app's i18n instance
	// The library's i18n follows the app but doesn't define available languages
	const mainAppI18n = (globalThis as any).__i18n_instances?.get('app') || i18n;

	console.log('📚 getAppSupportedLanguages:');
	console.log('  Input i18n.locales:', i18n.locales);
	console.log(
		'  Input i18n namespace:',
		(i18n as any).getNamespace?.() || (i18n as any).namespace || 'unknown'
	);
	console.log('  globalThis.__i18n_instances:', (globalThis as any).__i18n_instances);
	console.log('  Main app i18n found?:', !!(globalThis as any).__i18n_instances?.get('app'));
	console.log('  Main app i18n.locales:', mainAppI18n.locales);

	// Start with the main app's loaded languages (built-in)
	const supportedLanguages = new Set<string>(mainAppI18n.locales);
	console.log('  Initial supported languages from main app:', Array.from(supportedLanguages));

	try {
		// Use the cached config loader to avoid duplicate fetches
		const config = await loadAutoDiscoveryConfig(translationsPath);

		if (config?.autoDiscovery?.app) {
			console.log('  Auto-discovered app languages:', config.autoDiscovery.app);
			// Add auto-discovered app languages
			for (const locale of config.autoDiscovery.app) {
				supportedLanguages.add(locale);
			}
		}

		// Note: We intentionally do NOT add package languages
		// Packages should use whatever language the app is using
	} catch (error) {
		// If index.json doesn't exist or fails to load, that's fine
		// We still have the built-in languages
		if (DEV) {
			console.debug('Could not load index.json for app languages:', error);
		}
	}

	const result = Array.from(supportedLanguages).sort();
	console.log('  Final supported languages:', result);
	return result;
}

/**
 * Check if a language is supported by the app
 */
export async function isAppLanguageSupported(
	i18n: I18nInstance,
	locale: string,
	translationsPath = '/translations'
): Promise<boolean> {
	const supportedLanguages = await getAppSupportedLanguages(i18n, translationsPath);
	return supportedLanguages.includes(locale);
}
