/**
 * Extract locale from URL pathname and validate it
 */

import { isValidLanguageCode } from './language-search.js';

// Minimal interface for i18n instance - only need locales for pathname detection
interface I18nLocales {
	locales: string[];
}

/**
 * Extract language code from pathname if it exists and is valid
 * @param pathname - The URL pathname (e.g., '/zh/about' or '/en-US/products')
 * @returns The language code if found and valid, null otherwise
 *
 * @example
 * extractLocaleFromPathname('/zh/about') // 'zh'
 * extractLocaleFromPathname('/en-US/products') // 'en-US'
 * extractLocaleFromPathname('/notlang/about') // null
 * extractLocaleFromPathname('/about') // null
 */
export function extractLocaleFromPathname(pathname: string): string | null {
	// Split pathname into segments and filter out empty strings
	const segments = pathname.split('/').filter(Boolean);

	// If no segments, no locale
	if (segments.length === 0) {
		return null;
	}

	// Check if first segment is a valid language code
	const firstSegment = segments[0];
	if (isValidLanguageCode(firstSegment)) {
		return firstSegment;
	}

	return null;
}

/**
 * Extract locale from pathname and check if it's supported by the app
 * @param pathname - The URL pathname
 * @param i18n - The i18n instance to check supported locales
 * @returns The language code if found, valid, and supported, null otherwise
 *
 * @example
 * extractSupportedLocaleFromPathname('/zh/about', i18n) // 'zh' if supported
 * extractSupportedLocaleFromPathname('/eng/about', i18n) // null if not supported
 */
export function extractSupportedLocaleFromPathname(
	pathname: string,
	i18n: I18nLocales
): string | null {
	const locale = extractLocaleFromPathname(pathname);

	if (!locale) {
		return null;
	}

	// Check if the locale is supported by the app
	if (i18n.locales.includes(locale)) {
		return locale;
	}

	// Check for base language if locale has region (e.g., 'en-US' -> 'en')
	if (locale.includes('-')) {
		const baseLocale = locale.split('-')[0];
		if (i18n.locales.includes(baseLocale)) {
			return baseLocale;
		}
	}

	return null;
}

/**
 * Get the best locale based on priority:
 * 1. URL pathname locale (if valid and supported)
 * 2. Provided fallback locale (cookie/localStorage)
 * 3. Default locale
 *
 * @param pathname - The URL pathname
 * @param i18n - The i18n instance
 * @param fallbackLocale - The fallback locale from cookie/localStorage
 * @param defaultLocale - The default locale
 * @returns The best locale based on priority
 *
 * @example
 * getBestLocale('/zh/about', i18n, 'en', 'fr') // 'zh' if supported
 * getBestLocale('/xyz/about', i18n, 'en', 'fr') // 'en' (fallback)
 * getBestLocale('/about', i18n, null, 'fr') // 'fr' (default)
 */
export function getBestLocale(
	pathname: string,
	i18n: I18nLocales,
	fallbackLocale: string | null | undefined,
	defaultLocale: string
): string {
	// Priority 1: Check pathname for locale
	const pathnameLocale = extractSupportedLocaleFromPathname(pathname, i18n);
	if (pathnameLocale) {
		console.log(`[getBestLocale] Using locale from pathname: ${pathnameLocale}`);
		return pathnameLocale;
	}

	// Priority 2: Use fallback locale if available and supported
	if (fallbackLocale && i18n.locales.includes(fallbackLocale)) {
		console.log(`[getBestLocale] Using fallback locale: ${fallbackLocale}`);
		return fallbackLocale;
	}

	// Priority 3: Use default locale
	console.log(`[getBestLocale] Using default locale: ${defaultLocale}`);
	return defaultLocale;
}

/**
 * Check if a locale should be loaded based on pathname priority
 * Returns true if the pathname locale takes precedence over current locale
 *
 * @param pathname - The URL pathname
 * @param i18n - The i18n instance
 * @param currentLocale - The current locale
 * @returns True if pathname locale should override current locale
 */
export function shouldUsePathnameLocale(
	pathname: string,
	i18n: I18nLocales,
	currentLocale: string
): boolean {
	const pathnameLocale = extractSupportedLocaleFromPathname(pathname, i18n);
	return pathnameLocale !== null && pathnameLocale !== currentLocale;
}
