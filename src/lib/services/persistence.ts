/**
 * Unified persistence module for i18n locale management
 * Handles both client-side (localStorage) and universal (cookie + localStorage) persistence
 */

import { getBrowserLocale } from '$lib/utils/browser-detection.js';

// Configuration interfaces
interface PersistenceConfig {
	cookieName?: string;
	storageKey?: string;
	enableBrowserDetection?: boolean;
}

// Default configuration
const DEFAULT_COOKIE_NAME = 'i18n-locale';
const DEFAULT_STORAGE_KEY = 'i18n-locale';

// ============================================
// Cookie utilities
// ============================================

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

// ============================================
// LocalStorage utilities
// ============================================

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

// ============================================
// Universal persistence (cookie + localStorage)
// ============================================

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
 * Priority: cookie > localStorage > browser > default
 */
export function getInitialLocaleUniversal(
	defaultLocale: string,
	cookieString?: string,
	config?: PersistenceConfig
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
	if (enableBrowserDetection) {
		const browserLang = getBrowserLocale();
		if (browserLang) {
			const langCode = browserLang.split('-')[0];
			return langCode;
		}
	}

	// Fallback to default
	return defaultLocale;
}

// ============================================
// Simple persistence API (backward compatibility)
// ============================================

/**
 * Save the selected locale to localStorage and cookie
 */
export function saveLocale(locale: string): void {
	saveLocaleUniversal(locale, { storageKey: DEFAULT_STORAGE_KEY });
}

/**
 * Load the saved locale from localStorage
 */
export function loadSavedLocale(): string | null {
	return getLocaleFromStorage(DEFAULT_STORAGE_KEY);
}

/**
 * Clear the saved locale from both localStorage and cookie
 */
export function clearSavedLocale(): void {
	if (typeof window !== 'undefined' && window.localStorage) {
		try {
			localStorage.removeItem(DEFAULT_STORAGE_KEY);
			// Also clear cookie for consistency
			if (typeof document !== 'undefined') {
				document.cookie = `${DEFAULT_STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
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
