/**
 * Enhanced auto-discovery system based on index.json configuration
 * This is a supplementary mechanism - only works when index.json exists
 */

import { DEV } from '../../utils/env.js';
import type { I18nInstance, TranslationSchema } from '../../domain/models/types.js';
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

// Cache for index.json configuration to avoid multiple fetches
let indexConfigCache: { autoDiscovery?: AutoDiscoveryConfig } | null = null;
let indexConfigPromise: Promise<{ autoDiscovery?: AutoDiscoveryConfig } | null> | null = null;

// Cache for loaded translations to avoid duplicate fetches
const translationCache = new Map<string, Record<string, unknown>>();
const translationPromises = new Map<string, Promise<Record<string, unknown> | null>>();

/**
 * Get the cached auto-discovery configuration
 * This is useful for other modules that need to check what languages are configured
 */
export function getCachedAutoDiscoveryConfig(): { autoDiscovery?: AutoDiscoveryConfig } | null {
	return indexConfigCache;
}

/**
 * Load the auto-discovery configuration (with caching)
 */
export async function loadAutoDiscoveryConfig(
	translationsPath = '/translations',
	indexFile = 'index.json'
): Promise<{ autoDiscovery?: AutoDiscoveryConfig } | null> {
	// Return cached if available
	if (indexConfigCache) {
		return indexConfigCache;
	}

	// Wait for existing promise if in progress
	if (indexConfigPromise) {
		return await indexConfigPromise;
	}

	// Start loading
	const basePath = getAppBasePath();
	const indexUrl = `${basePath ? basePath : ''}${translationsPath}/${indexFile}`;
	const absoluteIndexUrl =
		typeof window !== 'undefined' && !indexUrl.startsWith('http')
			? new URL(indexUrl, window.location.origin).href
			: indexUrl;

	indexConfigPromise = (async () => {
		try {
			const response = await fetch(absoluteIndexUrl);
			if (!response.ok) {
				return null;
			}
			const config = await response.json();
			indexConfigCache = config;
			return config;
		} catch {
			return null;
		}
	})();

	return await indexConfigPromise;
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
		// Step 1: Load index.json (with caching)
		const config = await loadAutoDiscoveryConfig(translationsPath, indexFile);

		if (!config) {
			console.warn('Auto-discovery: No index.json found or failed to load');
			return;
		}

		if (!config.autoDiscovery) {
			console.warn('Auto-discovery: No configuration found in index.json');
			return;
		}

		console.log('[Auto-discovery] Config loaded:', config.autoDiscovery);
		console.log('[Auto-discovery] Looking for namespace:', namespace);

		// Step 3: Determine what to discover
		const discoveryTargets: Array<{ type: string; languages: string[] }> = [];

		// If this is for a specific package namespace
		if (namespace && config.autoDiscovery.packages?.[namespace]) {
			console.log(
				`Auto-discovery: Found package namespace "${namespace}" with languages:`,
				config.autoDiscovery.packages[namespace]
			);
			discoveryTargets.push({
				type: namespace,
				languages: config.autoDiscovery.packages[namespace]
			});
		}
		// If this is for the main app (no namespace)
		else if (!namespace && config.autoDiscovery.app) {
			console.log(
				'[Auto-discovery] Found app translations with languages:',
				config.autoDiscovery.app
			);
			discoveryTargets.push({
				type: 'app',
				languages: config.autoDiscovery.app
			});
		}
		// IMPORTANT: namespace 'app' should also match app translations
		else if (namespace === 'app' && config.autoDiscovery.app) {
			console.log(
				'[Auto-discovery] Found app translations for namespace "app" with languages:',
				config.autoDiscovery.app
			);
			discoveryTargets.push({
				type: 'app',
				languages: config.autoDiscovery.app
			});
		} else {
			console.log(
				'[Auto-discovery] No matching targets found. Namespace:',
				namespace,
				'Has app config:',
				!!config.autoDiscovery.app
			);
		}

		// Step 4: Load discovered translations
		for (const target of discoveryTargets) {
			for (const locale of target.languages) {
				// Note: We do NOT skip if locale is already loaded
				// Auto-discovered translations have higher priority than built-in
				// They will override any existing translations

				try {
					// Determine the file path based on target type
					let filePath: string;
					if (target.type === 'app') {
						// App translations also in subdirectory for consistency
						filePath = `${translationsPath}/app/${locale}.json`;
					} else {
						// Package translations in subdirectory
						filePath = `${translationsPath}/${target.type}/${locale}.json`;
					}

					const cacheKey = `${target.type}:${locale}`;

					// Check if already cached
					if (translationCache.has(cacheKey)) {
						const cachedTranslations = translationCache.get(cacheKey);
						const isOverride = i18n.locales.includes(locale);
						await i18n.loadLanguage(locale, cachedTranslations as TranslationSchema);
						onLoaded(target.type, locale);
						if (DEV) {
							if (isOverride) {
								console.debug(
									`Auto-discovery: Used cached ${locale} to override built-in for ${target.type}`
								);
							} else {
								console.debug(`Auto-discovery: Used cached ${locale} for ${target.type}`);
							}
						}
						continue;
					}

					// Check if already being fetched
					if (translationPromises.has(cacheKey)) {
						const existingPromise = translationPromises.get(cacheKey);
						const translations = await existingPromise;
						if (translations) {
							const isOverride = i18n.locales.includes(locale);
							await i18n.loadLanguage(locale, translations as TranslationSchema);
							onLoaded(target.type, locale);
							if (DEV) {
								if (isOverride) {
									console.debug(
										`Auto-discovery: Reused fetch to override ${locale} for ${target.type}`
									);
								} else {
									console.debug(`Auto-discovery: Reused fetch for ${locale} for ${target.type}`);
								}
							}
						}
						continue;
					}

					// Create a promise for this fetch
					const fetchPromise = (async () => {
						const absoluteUrl =
							typeof window !== 'undefined' && !filePath.startsWith('http')
								? new URL(filePath, window.location.href).href
								: filePath;

						console.log(`[Auto-discovery] Fetching ${locale} from: ${absoluteUrl}`);
						const response = await fetch(absoluteUrl);

						if (response.ok) {
							const translations = await response.json();
							console.log(`[Auto-discovery] Successfully fetched ${locale}, keys:`, Object.keys(translations));
							translationCache.set(cacheKey, translations);
							return translations;
						} else if (response.status === 404) {
							// Expected - language declared but file not yet added
							console.warn(
								`[Auto-discovery] ${locale} declared for ${target.type} but file not found at ${absoluteUrl} (404)`
							);
							if (DEV) {
								console.debug(
									`Auto-discovery: ${locale} declared for ${target.type} but file not found at ${filePath}`
								);
							}
							return null;
						} else {
							console.error(`[Auto-discovery] Failed to fetch ${locale}: HTTP ${response.status}`);
							throw new Error(`HTTP ${response.status}`);
						}
					})();

					translationPromises.set(cacheKey, fetchPromise);

					const translations = await fetchPromise;
					if (translations) {
						const isOverride = i18n.locales.includes(locale);
						console.log(`[Auto-discovery] Loading ${locale} for ${target.type}, override=${isOverride}`);
						await i18n.loadLanguage(locale, translations as TranslationSchema);
						console.log(`[Auto-discovery] Successfully loaded ${locale} into i18n store`);
						onLoaded(target.type, locale);

						if (DEV) {
							if (isOverride) {
								console.debug(
									`Auto-discovery: Overrode built-in ${locale} for ${target.type} with auto-discovered version`
								);
							} else {
								console.debug(`Auto-discovery: Loaded ${locale} for ${target.type}`);
							}
						}
					}
				} catch (error) {
					onError(target.type, locale, error as Error);
				} finally {
					// Clean up the promise cache after completion
					const cacheKey = `${target.type}:${locale}`;
					translationPromises.delete(cacheKey);
				}
			}
		}
	} catch (error) {
		// Configuration loading error
		if (DEV) {
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
