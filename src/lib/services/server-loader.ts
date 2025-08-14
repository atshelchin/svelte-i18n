/**
 * Server-side loader for auto-discovered translations
 * This allows SSR to use auto-discovered languages from static files
 */

import fs from 'fs';
import path from 'path';
import type { I18nInstance } from '$lib/domain/models/types.js';

/**
 * Load translations from the file system during SSR
 * This is synchronous and only works on the server
 */
export function loadServerTranslations(
	i18n: I18nInstance,
	locale: string,
	namespace: string = 'app'
): boolean {
	// Only works on server
	if (typeof window !== 'undefined') {
		return false;
	}

	try {
		// Determine the file path based on namespace
		const translationsDir = path.join(process.cwd(), 'static', 'translations');
		const filePath = path.join(translationsDir, namespace, `${locale}.json`);

		// Check if file exists
		if (!fs.existsSync(filePath)) {
			console.log(`[Server Loader] File not found: ${filePath}`);
			return false;
		}

		// Read and parse the translation file
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		const translations = JSON.parse(fileContent);

		// Extract metadata if present
		if (translations._meta) {
			// Store metadata
			(i18n as any).languageMeta = (i18n as any).languageMeta || {};
			(i18n as any).languageMeta[locale] = translations._meta;
		}

		// Use the i18n store's loadLanguageSync method to properly load translations
		// This ensures validation and proper integration with the store
		if (i18n.loadLanguageSync) {
			i18n.loadLanguageSync(locale, translations);
		} else {
			// Fallback for instances without sync method
			console.warn('[Server Loader] Instance does not support loadLanguageSync');
			return false;
		}

		console.log(`[Server Loader] Successfully loaded ${locale} from ${filePath}`);
		return true;
	} catch (error) {
		console.error(`[Server Loader] Failed to load ${locale}:`, error);
		return false;
	}
}

/**
 * Check if a locale is available in auto-discovered translations
 */
export function isAutoDiscoveredLocale(locale: string, namespace: string = 'app'): boolean {
	// Only works on server
	if (typeof window !== 'undefined') {
		return false;
	}

	try {
		// Check index.json for the locale
		const indexPath = path.join(process.cwd(), 'static', 'translations', 'index.json');
		if (!fs.existsSync(indexPath)) {
			return false;
		}

		const indexContent = fs.readFileSync(indexPath, 'utf-8');
		const config = JSON.parse(indexContent);

		if (!config.autoDiscovery) {
			return false;
		}

		// Check if locale is in the auto-discovery config
		if (namespace === 'app' && config.autoDiscovery.app) {
			return config.autoDiscovery.app.includes(locale);
		}

		if (config.autoDiscovery.packages?.[namespace]) {
			return config.autoDiscovery.packages[namespace].includes(locale);
		}

		return false;
	} catch (error) {
		console.error(`[Server Loader] Failed to check auto-discovered locale:`, error);
		return false;
	}
}

/**
 * Load all auto-discovered locales on the server
 * This ensures SSR has access to all languages
 */
export async function loadAllServerTranslations(i18n: I18nInstance): Promise<void> {
	// Only works on server
	if (typeof window !== 'undefined') {
		return;
	}

	try {
		const indexPath = path.join(process.cwd(), 'static', 'translations', 'index.json');
		if (!fs.existsSync(indexPath)) {
			return;
		}

		const indexContent = fs.readFileSync(indexPath, 'utf-8');
		const config = JSON.parse(indexContent);

		if (!config.autoDiscovery) {
			return;
		}

		const namespace = (i18n as any).config?.namespace || 'app';

		// Load app translations
		if (namespace === 'app' && config.autoDiscovery.app) {
			for (const locale of config.autoDiscovery.app) {
				loadServerTranslations(i18n, locale, 'app');
			}
		}

		// Load package translations
		if (namespace && config.autoDiscovery.packages?.[namespace]) {
			for (const locale of config.autoDiscovery.packages[namespace]) {
				loadServerTranslations(i18n, locale, namespace);
			}
		}
	} catch (error) {
		console.error('[Server Loader] Failed to load all translations:', error);
	}
}
