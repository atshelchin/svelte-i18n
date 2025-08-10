/**
 * Helper functions to determine which languages the app supports
 * This combines built-in languages with auto-discovered app languages
 */

import { DEV } from '../../utils/env.js';
import type { I18nInstance } from '../../domain/models/types.js';
import { loadAutoDiscoveryConfig } from './auto-discovery-v2.js';

/**
 * Get all languages that the app supports (for language switching)
 * This includes:
 * 1. Built-in app languages (already loaded)
 * 2. Auto-discovered app languages (from index.json)
 *
 * This explicitly excludes package languages as packages should follow
 * the app's language selection.
 */
export async function getAppSupportedLanguages(
	i18n: I18nInstance,
	translationsPath = '/translations'
): Promise<string[]> {
	// Start with already loaded languages (built-in)
	const supportedLanguages = new Set<string>(i18n.locales);

	try {
		// Use the cached config loader to avoid duplicate fetches
		const config = await loadAutoDiscoveryConfig(translationsPath);

		if (config?.autoDiscovery?.app) {
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

	return Array.from(supportedLanguages).sort();
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
