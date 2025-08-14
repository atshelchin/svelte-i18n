import { getBrowserLocale } from '$lib/utils/browser-detection.js';
import { 
	getLocaleFromStorage, 
	setLocaleStorage,
	saveLocaleUniversal
} from './universal-persistence.js';

const STORAGE_KEY = 'i18n-locale';

/**
 * Save the selected locale to localStorage
 */
export function saveLocale(locale: string): void {
	// Use universal save to save to both localStorage and cookie
	saveLocaleUniversal(locale, { storageKey: STORAGE_KEY });
}

/**
 * Load the saved locale from localStorage
 */
export function loadSavedLocale(): string | null {
	return getLocaleFromStorage(STORAGE_KEY);
}

/**
 * Clear the saved locale
 */
export function clearSavedLocale(): void {
	if (typeof window !== 'undefined' && window.localStorage) {
		try {
			localStorage.removeItem(STORAGE_KEY);
			// Also clear cookie for consistency
			if (typeof document !== 'undefined') {
				document.cookie = `${STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
			}
		} catch (error) {
			console.error('Failed to clear locale:', error);
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
	const browserLocale = getBrowserLocale(availableLocales);
	if (browserLocale) {
		return browserLocale;
	}

	// Fallback to default
	return defaultLocale;
}
