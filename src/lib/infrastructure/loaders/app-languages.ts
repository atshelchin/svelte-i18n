/**
 * Helper functions to determine which languages the app supports
 * This combines built-in languages with auto-discovered app languages
 */

import type { I18nInstance } from '../../domain/models/types.js';
import { getAppBasePath } from './base-path.js';

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
		// Try to load index.json to find additional app languages
		const basePath = getAppBasePath();
		const indexUrl = `${basePath ? basePath : ''}${translationsPath}/index.json`;
		const absoluteIndexUrl =
			typeof window !== 'undefined' && !indexUrl.startsWith('http')
				? new URL(indexUrl, window.location.origin).href
				: indexUrl;

		const response = await fetch(absoluteIndexUrl);

		if (response.ok) {
			const config = await response.json();

			// Add auto-discovered app languages
			if (config.autoDiscovery?.app) {
				for (const locale of config.autoDiscovery.app) {
					supportedLanguages.add(locale);
				}
			}

			// Note: We intentionally do NOT add package languages
			// Packages should use whatever language the app is using
		}
	} catch (error) {
		// If index.json doesn't exist or fails to load, that's fine
		// We still have the built-in languages
		if (import.meta.env?.DEV && import.meta.env?.VITE_I18N_DEBUG === 'true') {
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
