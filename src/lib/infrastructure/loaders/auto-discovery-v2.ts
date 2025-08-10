/**
 * Enhanced auto-discovery system based on index.json configuration
 * This is a supplementary mechanism - only works when index.json exists
 */

import type { I18nInstance } from '../../domain/models/types.js';
import { getAppBasePath } from './base-path.js';

export interface AutoDiscoveryConfig {
	app?: string[];
	packages?: {
		[packageName: string]: string[];
	};
}

export interface AutoDiscoveryOptions {
	translationsPath?: string;
	indexFile?: string;
	namespace?: string; // For package-specific discovery
	onError?: (target: string, locale: string, error: Error) => void;
	onLoaded?: (target: string, locale: string) => void;
}

/**
 * Load translations based on auto-discovery configuration
 * @param i18n The i18n instance to load translations into
 * @param options Configuration options
 */
export async function autoDiscoverTranslations(
	i18n: I18nInstance,
	options: AutoDiscoveryOptions = {}
): Promise<void> {
	const basePath = getAppBasePath();
	const {
		translationsPath = basePath ? `${basePath}/translations` : '/translations',
		indexFile = 'index.json',
		namespace,
		onError = () => {}, // Silent by default
		onLoaded = () => {} // Silent by default
	} = options;

	try {
		// Step 1: Try to load index.json
		const indexUrl = `${translationsPath}/${indexFile}`;
		const absoluteIndexUrl =
			typeof window !== 'undefined' && !indexUrl.startsWith('http')
				? new URL(indexUrl, window.location.origin).href
				: indexUrl;

		const indexResponse = await fetch(absoluteIndexUrl);

		if (!indexResponse.ok) {
			// No index.json = no auto-discovery (this is normal)
			if (import.meta.env?.DEV && import.meta.env?.VITE_I18N_DEBUG === 'true') {
				console.debug('Auto-discovery: No index.json found - skipping');
			}
			return;
		}

		// Step 2: Parse configuration
		const config: { autoDiscovery?: AutoDiscoveryConfig } = await indexResponse.json();

		if (!config.autoDiscovery) {
			if (import.meta.env?.DEV && import.meta.env?.VITE_I18N_DEBUG === 'true') {
				console.debug('Auto-discovery: No configuration found');
			}
			return;
		}

		// Step 3: Determine what to discover
		const discoveryTargets: Array<{ type: string; languages: string[] }> = [];

		// If this is for a specific package namespace
		if (namespace && config.autoDiscovery.packages?.[namespace]) {
			discoveryTargets.push({
				type: namespace,
				languages: config.autoDiscovery.packages[namespace]
			});
		}
		// If this is for the main app (no namespace)
		else if (!namespace && config.autoDiscovery.app) {
			discoveryTargets.push({
				type: 'app',
				languages: config.autoDiscovery.app
			});
		}

		// Step 4: Load discovered translations
		for (const target of discoveryTargets) {
			for (const locale of target.languages) {
				// Skip if already loaded
				if (i18n.locales.includes(locale)) {
					if (import.meta.env?.DEV && import.meta.env?.VITE_I18N_DEBUG === 'true') {
						console.debug(`Auto-discovery: ${locale} already loaded for ${target.type}`);
					}
					continue;
				}

				try {
					// Determine the file path based on target type
					let filePath: string;
					if (target.type === 'app') {
						filePath = `${translationsPath}/${locale}.json`;
					} else {
						// Package translations in subdirectory
						filePath = `${translationsPath}/${target.type}/${locale}.json`;
					}

					const absoluteUrl =
						typeof window !== 'undefined' && !filePath.startsWith('http')
							? new URL(filePath, window.location.origin).href
							: filePath;

					const response = await fetch(absoluteUrl);

					if (response.ok) {
						const translations = await response.json();
						await i18n.loadLanguage(locale, translations);
						onLoaded(target.type, locale);

						if (import.meta.env?.DEV && import.meta.env?.VITE_I18N_DEBUG === 'true') {
							console.debug(`Auto-discovery: Loaded ${locale} for ${target.type}`);
						}
					} else if (response.status === 404) {
						// Expected - language declared but file not yet added
						if (import.meta.env?.DEV && import.meta.env?.VITE_I18N_DEBUG === 'true') {
							console.debug(
								`Auto-discovery: ${locale} declared for ${target.type} but file not found`
							);
						}
					} else {
						throw new Error(`HTTP ${response.status}`);
					}
				} catch (error) {
					onError(target.type, locale, error as Error);
				}
			}
		}
	} catch (error) {
		// Configuration loading error
		if (import.meta.env?.DEV) {
			console.error('Auto-discovery configuration error:', error);
		}
	}
}

/**
 * Helper function to check if auto-discovery is available
 */
export async function isAutoDiscoveryAvailable(
	translationsPath = '/translations'
): Promise<boolean> {
	try {
		const basePath = getAppBasePath();
		const indexUrl = `${basePath ? basePath : ''}${translationsPath}/index.json`;
		const absoluteIndexUrl =
			typeof window !== 'undefined' && !indexUrl.startsWith('http')
				? new URL(indexUrl, window.location.origin).href
				: indexUrl;

		const response = await fetch(absoluteIndexUrl, { method: 'HEAD' });
		return response.ok;
	} catch {
		return false;
	}
}
