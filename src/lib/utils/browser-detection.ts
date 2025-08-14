/**
 * Browser detection utilities
 * Centralizes all browser language detection logic
 */

/**
 * Extended Navigator interface to support legacy browser properties
 */
interface ExtendedNavigator extends Navigator {
	userLanguage?: string;
	browserLanguage?: string;
	systemLanguage?: string;
}

/**
 * Detect the browser's preferred language
 * @returns The detected language code or null if not available
 */
export function detectBrowserLanguage(): string | null {
	if (typeof window === 'undefined' || !window.navigator) {
		return null;
	}

	const nav = window.navigator as ExtendedNavigator;

	// Check navigator.languages first (preferred)
	if (nav.languages && nav.languages.length > 0) {
		return nav.languages[0];
	}

	const browserLang = nav.language || nav.userLanguage || nav.browserLanguage || nav.systemLanguage;

	return browserLang || null;
}

/**
 * Get the browser's preferred language, matching against available locales
 * @param availableLocales - List of supported locales
 * @returns The matched locale or null if no match found
 */
export function getBrowserLocale(availableLocales?: string[]): string | null {
	const browserLang = detectBrowserLanguage();

	if (!browserLang) {
		return null;
	}

	// If no available locales specified, return the browser language as-is
	if (!availableLocales || availableLocales.length === 0) {
		return browserLang;
	}

	// Try exact match first
	if (availableLocales.includes(browserLang)) {
		return browserLang;
	}

	// Try language code without region (e.g., 'en' from 'en-US')
	const langCode = browserLang.split('-')[0];
	if (availableLocales.includes(langCode)) {
		return langCode;
	}

	// Try to find a locale that starts with the same language code
	const matchingLocale = availableLocales.find((locale) =>
		locale.toLowerCase().startsWith(langCode.toLowerCase())
	);

	if (matchingLocale) {
		return matchingLocale;
	}

	return null;
}

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof window.navigator !== 'undefined';
}
