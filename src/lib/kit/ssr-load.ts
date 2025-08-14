/**
 * Unified SSR load function for i18n
 * Combines the best features from both implementations
 */

import type { Cookies } from '@sveltejs/kit';
import type { I18nInstance, TranslationSchema } from '$lib/domain/models/types.js';
import { extractLocaleFromPathname } from '$lib/utils/pathname-locale.js';

// Extended interface for i18n instances with additional methods
interface I18nInstanceExtended extends I18nInstance {
	config?: {
		namespace?: string;
	};
	translations?: Record<string, TranslationSchema>;
}

// Type for server loader functions
type LoadServerTranslations = (i18n: any, locale: string, namespace: string) => boolean;

type IsAutoDiscoveredLocale = (locale: string, namespace: string) => boolean;

/**
 * Server-side i18n loader with pathname detection support
 * This is the main implementation that handles all SSR scenarios
 *
 * Priority: pathname locale > cookie locale > default locale
 *
 * @param i18n - The i18n instance
 * @param cookies - SvelteKit cookies object
 * @param url - Optional URL for pathname locale detection
 * @param options - Configuration options
 * @returns SSR data including locale, translations, and metadata
 */
export async function loadI18nSSR<T = I18nInstance>(
	i18n: T & Pick<I18nInstance, 'locale' | 'locales' | 'setLocale'>,
	cookies: Cookies,
	url?: URL | { pathname: string },
	options?: {
		cookieName?: string;
		defaultLocale?: string;
		namespace?: string;
	}
) {
	const cookieName = options?.cookieName || 'i18n-locale';
	const defaultLocale = options?.defaultLocale || i18n.locale || 'zh';
	const namespace =
		options?.namespace || (i18n as unknown as I18nInstanceExtended).config?.namespace || 'app';
	const pathname = url?.pathname || '/';

	// Import server-side utilities (only available on server)
	let loadServerTranslations: LoadServerTranslations | undefined;
	let isAutoDiscoveredLocale: IsAutoDiscoveredLocale | undefined;

	if (typeof window === 'undefined') {
		const serverLoader = await import('$lib/services/server-loader.js');
		loadServerTranslations = serverLoader.loadServerTranslations;
		isAutoDiscoveredLocale = serverLoader.isAutoDiscoveredLocale;
	}

	// Get locale from cookie
	const cookieLocale = cookies.get(cookieName);

	// Extract locale from pathname if URL is provided
	const pathnameLocale = url ? extractLocaleFromPathname(pathname) : null;

	// Determine locale with priority: pathname > cookie > default
	let locale = defaultLocale;

	// Priority 1: Check pathname locale
	if (pathnameLocale) {
		// Check if it's already loaded
		if (i18n.locales.includes(pathnameLocale)) {
			locale = pathnameLocale;
		} else if (typeof window === 'undefined' && isAutoDiscoveredLocale) {
			// On server, check if it's an auto-discovered locale
			if (isAutoDiscoveredLocale(pathnameLocale, namespace)) {
				locale = pathnameLocale;
			}
		}
	}

	// Priority 2: If no pathname locale, check cookie
	if (locale === defaultLocale && cookieLocale) {
		if (i18n.locales.includes(cookieLocale)) {
			locale = cookieLocale;
		} else if (typeof window === 'undefined' && isAutoDiscoveredLocale) {
			// Check if cookie locale is auto-discovered
			if (isAutoDiscoveredLocale(cookieLocale, namespace)) {
				locale = cookieLocale;
			}
		}
	}

	console.log(
		`[loadI18nSSR] Pathname: ${pathname}, Cookie locale: ${cookieLocale}, determined locale: ${locale}`
	);

	// Try to load and set the locale
	if (locale && !i18n.locales.includes(locale)) {
		// Try loading as auto-discovered locale
		if (typeof window === 'undefined' && loadServerTranslations && isAutoDiscoveredLocale) {
			if (isAutoDiscoveredLocale(locale, namespace)) {
				console.log(`[loadI18nSSR] Loading auto-discovered locale: ${locale}`);
				const loaded = loadServerTranslations(i18n, locale, namespace);
				if (loaded) {
					console.log(`[loadI18nSSR] Successfully loaded ${locale} for SSR`);
					await i18n.setLocale(locale);
				}
			}
		}
	} else if (locale && i18n.locales.includes(locale)) {
		// Locale is already loaded, just set it
		await i18n.setLocale(locale);
	}

	// Get all available locales including auto-discovered ones
	const allLocales = [...i18n.locales];

	// Check for auto-discovered locales to include in the list
	if (typeof window === 'undefined') {
		try {
			const fs = await import('fs');
			const path = await import('path');
			const indexPath = path.join(process.cwd(), 'static', 'translations', 'index.json');

			if (fs.existsSync(indexPath)) {
				const indexContent = fs.readFileSync(indexPath, 'utf-8');
				const config = JSON.parse(indexContent);

				// Add auto-discovered locales to the list
				if (namespace === 'app' && config.autoDiscovery?.app) {
					for (const lang of config.autoDiscovery.app) {
						if (!allLocales.includes(lang)) {
							allLocales.push(lang);
						}
					}
				} else if (config.autoDiscovery?.packages?.[namespace]) {
					for (const lang of config.autoDiscovery.packages[namespace]) {
						if (!allLocales.includes(lang)) {
							allLocales.push(lang);
						}
					}
				}
			}
		} catch (error) {
			console.warn('[loadI18nSSR] Could not read auto-discovery config:', error);
		}
	}

	// Pass SSR translations for auto-discovered languages
	// This is CRITICAL for SSR - prevents flash of untranslated content
	let ssrTranslations = undefined;
	let isAutoDiscovered = false;

	if (locale && typeof window === 'undefined' && isAutoDiscoveredLocale) {
		if (isAutoDiscoveredLocale(locale, namespace)) {
			isAutoDiscovered = true;
			// Pass the translations for hydration to prevent flash
			ssrTranslations = (i18n as unknown as I18nInstanceExtended).translations?.[locale];
		}
	}

	return {
		locale,
		locales: allLocales,
		ssrTranslations,
		isAutoDiscovered,
		i18nReady: true,
		cookieName,
		namespace
	};
}

/**
 * Backward compatible server load function
 * Delegates to loadI18nSSR without URL parameter
 *
 * @deprecated Use loadI18nSSR instead for pathname support
 */
export async function i18nServerLoad<T = I18nInstance>(
	i18n: T & Pick<I18nInstance, 'locale' | 'locales' | 'setLocale'>,
	cookies: Cookies,
	options?: {
		cookieName?: string;
		defaultLocale?: string;
		namespace?: string;
	}
) {
	return loadI18nSSR(i18n, cookies, undefined, options);
}
