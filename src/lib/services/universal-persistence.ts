/**
 * Universal persistence module that works both on server and client
 * Uses cookies for SSR and localStorage for client-side persistence
 */

interface PersistenceConfig {
	cookieName?: string;
	storageKey?: string;
}

const DEFAULT_COOKIE_NAME = 'i18n-locale';
const DEFAULT_STORAGE_KEY = 'i18n-locale';

/**
 * Parse cookies from a cookie string
 */
function parseCookies(cookieString: string): Record<string, string> {
	const cookies: Record<string, string> = {};
	if (!cookieString) return cookies;

	cookieString.split(';').forEach((cookie) => {
		const [name, value] = cookie.trim().split('=');
		if (name && value) {
			cookies[name] = decodeURIComponent(value);
		}
	});

	return cookies;
}

/**
 * Get locale from cookies (works on both server and client)
 */
export function getLocaleFromCookie(
	cookieString: string,
	cookieName = DEFAULT_COOKIE_NAME
): string | null {
	const cookies = parseCookies(cookieString);
	return cookies[cookieName] || null;
}

/**
 * Set locale in cookie (client-side only)
 */
export function setLocaleCookie(locale: string, cookieName = DEFAULT_COOKIE_NAME): void {
	if (typeof document !== 'undefined') {
		// Set cookie with 1 year expiry
		const expires = new Date();
		expires.setFullYear(expires.getFullYear() + 1);

		document.cookie = `${cookieName}=${encodeURIComponent(locale)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
	}
}

/**
 * Get locale from localStorage (client-side only)
 */
export function getLocaleFromStorage(storageKey = DEFAULT_STORAGE_KEY): string | null {
	if (typeof window !== 'undefined' && window.localStorage) {
		try {
			return localStorage.getItem(storageKey);
		} catch {
			// Silent fail
		}
	}
	return null;
}

/**
 * Set locale in localStorage (client-side only)
 */
export function setLocaleStorage(locale: string, storageKey = DEFAULT_STORAGE_KEY): void {
	if (typeof window !== 'undefined' && window.localStorage) {
		try {
			localStorage.setItem(storageKey, locale);
		} catch {
			// Silent fail
		}
	}
}

/**
 * Save locale to both cookie and localStorage
 */
export function saveLocaleUniversal(locale: string, config?: PersistenceConfig): void {
	const { cookieName = DEFAULT_COOKIE_NAME, storageKey = DEFAULT_STORAGE_KEY } = config || {};

	// Save to cookie (for SSR)
	setLocaleCookie(locale, cookieName);

	// Save to localStorage (for client-side persistence)
	setLocaleStorage(locale, storageKey);
}

/**
 * Get initial locale from cookie or localStorage
 * Priority: cookie > localStorage > default
 */
export function getInitialLocaleUniversal(
	defaultLocale: string,
	cookieString?: string,
	config?: PersistenceConfig & { enableBrowserDetection?: boolean }
): string {
	const {
		cookieName = DEFAULT_COOKIE_NAME,
		storageKey = DEFAULT_STORAGE_KEY,
		enableBrowserDetection = false // Default to false, respect configured default
	} = config || {};

	// First priority: cookie (works on server and client)
	if (cookieString) {
		const cookieLocale = getLocaleFromCookie(cookieString, cookieName);
		if (cookieLocale) {
			return cookieLocale;
		}
	}

	// Second priority: localStorage (client-side only)
	const storageLocale = getLocaleFromStorage(storageKey);
	if (storageLocale) {
		return storageLocale;
	}

	// Third priority: browser language detection (only if explicitly enabled)
	if (enableBrowserDetection && typeof window !== 'undefined') {
		const nav = window.navigator as Navigator & {
			userLanguage?: string;
			browserLanguage?: string;
			systemLanguage?: string;
		};
		const browserLang =
			nav.language || nav.userLanguage || nav.browserLanguage || nav.systemLanguage;

		if (browserLang) {
			const langCode = browserLang.split('-')[0];
			return langCode;
		}
	}

	// Fallback to default
	return defaultLocale;
}
