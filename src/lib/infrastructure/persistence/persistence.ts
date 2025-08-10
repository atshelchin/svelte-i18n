const STORAGE_KEY = 'i18n-locale';

/**
 * Save the selected locale to localStorage
 */
export function saveLocale(locale: string): void {
	if (typeof window !== 'undefined' && window.localStorage) {
		try {
			localStorage.setItem(STORAGE_KEY, locale);
		} catch (error) {
			console.error('Failed to save locale to localStorage:', error);
		}
	}
}

/**
 * Load the saved locale from localStorage
 */
export function loadSavedLocale(): string | null {
	if (typeof window !== 'undefined' && window.localStorage) {
		try {
			return localStorage.getItem(STORAGE_KEY);
		} catch (error) {
			console.error('Failed to load locale from localStorage:', error);
		}
	}
	return null;
}

/**
 * Clear the saved locale
 */
export function clearSavedLocale(): void {
	if (typeof window !== 'undefined' && window.localStorage) {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (error) {
			console.error('Failed to clear locale from localStorage:', error);
		}
	}
}

/**
 * Get initial locale based on priority:
 * 1. Saved locale from localStorage
 * 2. Browser language
 * 3. Default locale
 */
export function getInitialLocale(defaultLocale: string, availableLocales?: string[]): string {
	// First priority: saved locale
	const savedLocale = loadSavedLocale();
	if (savedLocale && (!availableLocales || availableLocales.includes(savedLocale))) {
		return savedLocale;
	}

	// Second priority: browser language
	if (typeof window !== 'undefined') {
		const nav = window.navigator as Navigator & {
			userLanguage?: string;
			browserLanguage?: string;
			systemLanguage?: string;
		};
		const browserLang =
			nav.language || nav.userLanguage || nav.browserLanguage || nav.systemLanguage;

		if (browserLang) {
			// Try exact match first
			if (!availableLocales || availableLocales.includes(browserLang)) {
				return browserLang;
			}

			// Try language code without region (e.g., 'en' from 'en-US')
			const langCode = browserLang.split('-')[0];
			if (!availableLocales || availableLocales.includes(langCode)) {
				return langCode;
			}
		}
	}

	// Fallback to default
	return defaultLocale;
}
