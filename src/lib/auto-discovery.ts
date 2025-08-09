/**
 * Auto-discovery module for svelte-i18n
 *
 * This module provides automatic translation file discovery for namespaced i18n instances.
 * It follows convention-over-configuration principles to make it easy for packages and
 * applications to provide translations without modifying source code.
 */

import type { I18nConfig, TranslationFile, TranslationSchema } from './types.js';
import { getAppBasePath } from './base-path.js';

export interface AutoDiscoveryOptions {
	/**
	 * Base URL where translation files are located
	 * @default '/translations'
	 */
	baseUrl?: string;

	/**
	 * Enable auto-discovery of translation files
	 * @default true
	 */
	enabled?: boolean;

	/**
	 * File naming patterns to try for discovery
	 * Use {namespace} and {locale} as placeholders
	 * @default ['[namespace].[locale].json', '[namespace]/{locale}.json']
	 */
	patterns?: string[];

	/**
	 * Locales to attempt auto-loading for
	 * @default Common locales will be tried
	 */
	locales?: string[];

	/**
	 * Whether to log discovery attempts and results
	 * @default false in production, true in development
	 */
	debug?: boolean;

	/**
	 * Custom fetch function for loading translations
	 */
	fetcher?: (url: string) => Promise<Response>;
}

/**
 * Default locales to attempt auto-discovery for
 */
const DEFAULT_DISCOVERY_LOCALES = [
	'en',
	'zh',
	'es',
	'fr',
	'de',
	'ja',
	'ko',
	'pt',
	'ru',
	'ar',
	'hi',
	'it',
	'nl',
	'pl',
	'tr',
	'vi',
	'th',
	'id',
	'ms',
	'sv',
	'no',
	'da',
	'fi',
	'cs',
	'hu',
	'ro',
	'uk',
	'he',
	'el',
	'bg'
];

/**
 * Default file patterns for discovery
 */
const DEFAULT_PATTERNS = [
	'{namespace}.{locale}.json', // my-package.en.json
	'{namespace}/{locale}.json', // my-package/en.json
	'{namespace}-{locale}.json', // my-package-en.json
	'packages/{namespace}.{locale}.json', // packages/my-package.en.json
	'components/{namespace}.{locale}.json' // components/my-package.en.json
];

/**
 * Try to load a translation file from a URL
 */
async function tryLoadTranslation(
	url: string,
	fetcher: (url: string) => Promise<Response>,
	debug: boolean
): Promise<TranslationFile | null> {
	try {
		const response = await fetcher(url);
		if (response.ok) {
			const data = await response.json();
			if (debug) {
				console.info(`✅ Loaded translations from ${url}`);
			}
			return data as TranslationFile;
		}
	} catch {
		// Silently ignore errors in discovery
	}
	return null;
}

/**
 * Build URLs to try based on patterns
 */
function buildUrls(
	namespace: string,
	locale: string,
	baseUrl: string,
	patterns: string[]
): string[] {
	return patterns.map((pattern) => {
		const path = pattern.replace('{namespace}', namespace).replace('{locale}', locale);
		return `${baseUrl}/${path}`.replace(/\/+/g, '/');
	});
}

/**
 * Auto-discover and load translations for a namespaced i18n instance
 */
export async function autoDiscoverTranslations(
	namespace: string | undefined,
	locale: string,
	options: AutoDiscoveryOptions = {}
): Promise<TranslationFile | null> {
	// Skip if no namespace or in non-browser environment
	if (!namespace || typeof window === 'undefined') {
		return null;
	}

	// Get base path for the application
	const basePath = getAppBasePath();

	// Build the base URL for translations
	let defaultBaseUrl = '/translations';
	if (basePath) {
		defaultBaseUrl = `${basePath}/translations`;
	} else if (typeof window !== 'undefined') {
		// Additional check for GitHub Pages specifically
		const pathname = window.location.pathname;
		// If we're on GitHub Pages (*.github.io) and have a path like /svelte-i18n/...
		if (window.location.hostname.endsWith('.github.io') && pathname.startsWith('/svelte-i18n')) {
			defaultBaseUrl = '/svelte-i18n/translations';
		}
	}

	const {
		baseUrl = defaultBaseUrl,
		enabled = true,
		patterns = DEFAULT_PATTERNS,
		debug = import.meta.env?.DEV ?? false,
		fetcher = fetch
	} = options;

	if (!enabled) {
		return null;
	}

	const urls = buildUrls(namespace, locale, baseUrl, patterns);

	if (debug) {
		console.debug(`🔍 Auto-discovering translations for ${namespace}:${locale}`);
		console.debug('URLs to try:', urls);
	}

	// Try each URL in order
	for (const url of urls) {
		const translations = await tryLoadTranslation(url, fetcher, debug);
		if (translations) {
			return translations;
		}
	}

	if (debug) {
		console.debug(`No translations found for ${namespace}:${locale}`);
	}

	return null;
}

/**
 * Auto-discover translations for multiple locales
 */
export async function autoDiscoverAllTranslations(
	namespace: string | undefined,
	options: AutoDiscoveryOptions = {}
): Promise<Map<string, TranslationFile>> {
	if (!namespace) {
		return new Map();
	}

	const { locales = DEFAULT_DISCOVERY_LOCALES, ...otherOptions } = options;

	const discovered = new Map<string, TranslationFile>();

	// Try to discover translations for each locale
	const promises = locales.map(async (locale) => {
		const translations = await autoDiscoverTranslations(namespace, locale, otherOptions);
		if (translations) {
			discovered.set(locale, translations);
		}
	});

	await Promise.all(promises);

	if (options.debug && discovered.size > 0) {
		console.info(
			`📦 Auto-discovered ${discovered.size} translations for ${namespace}:`,
			Array.from(discovered.keys())
		);
	}

	return discovered;
}

/**
 * Create enhanced i18n config with auto-discovery
 */
export function withAutoDiscovery(
	config: I18nConfig,
	discoveryOptions?: AutoDiscoveryOptions
): I18nConfig {
	const originalLoadLocale = config.loadLocale;

	return {
		...config,
		loadLocale: async (locale: string) => {
			// First try original loader if provided
			if (originalLoadLocale) {
				try {
					const result = await originalLoadLocale(locale);
					if (result) return result;
				} catch {
					// Continue to auto-discovery
				}
			}

			// Try auto-discovery
			const discovered = await autoDiscoverTranslations(config.namespace, locale, discoveryOptions);

			if (discovered) {
				// Remove metadata before returning
				const translations = Object.fromEntries(
					Object.entries(discovered).filter(([key]) => key !== '_meta')
				);
				return translations as TranslationSchema;
			}

			// Fallback to original behavior
			if (originalLoadLocale) {
				return originalLoadLocale(locale);
			}

			throw new Error(`No translations found for locale: ${locale}`);
		}
	};
}

/**
 * Hook to automatically discover and load translations when locale changes
 */
interface I18nWithDiscovery {
	locale: string;
	locales: string[];
	getNamespace?: () => string | undefined;
	config?: { namespace?: string };
	loadLanguage?: (locale: string, translations: TranslationFile) => Promise<void>;
}

export function createAutoDiscoveryEffect(
	getI18n: () => I18nWithDiscovery,
	options?: AutoDiscoveryOptions
): () => void {
	let lastLocale: string | null = null;
	let isLoading = false;

	const checkAndLoad = async () => {
		const i18n = getI18n();
		if (!i18n || isLoading) return;

		const currentLocale = i18n.locale;
		const namespace = i18n.getNamespace?.() || i18n.config?.namespace;

		if (currentLocale !== lastLocale && namespace) {
			lastLocale = currentLocale;

			// Check if locale already loaded
			if (i18n.locales.includes(currentLocale)) {
				return;
			}

			isLoading = true;
			try {
				const translations = await autoDiscoverTranslations(namespace, currentLocale, options);

				if (translations && i18n.loadLanguage) {
					await i18n.loadLanguage(currentLocale, translations);
					if (options?.debug) {
						console.info(`🌍 Auto-loaded ${namespace}:${currentLocale} via discovery`);
					}
				}
			} finally {
				isLoading = false;
			}
		}
	};

	// Check periodically (simple polling for demo)
	const interval = setInterval(checkAndLoad, 100);
	checkAndLoad(); // Initial check

	// Return cleanup function
	return () => clearInterval(interval);
}
