/**
 * Client-side initialization functions for i18n
 * Handles browser-specific initialization and hydration
 */

import type { I18nInstance } from '$lib/domain/models/types.js';
import { browser } from '$app/environment';

/**
 * Setup i18n on client with SSR data
 * Handles hydration of SSR translations
 *
 * @param i18n - The i18n instance
 * @param data - SSR data from server
 * @param options - Configuration options
 */
export function setupI18nClient<T = I18nInstance>(
	i18n: T & Pick<I18nInstance, 'locale' | 'locales' | 'setLocale' | 'loadLanguageSync'>,
	data: any,
	options?: {
		defaultLocale?: string;
		storageKey?: string;
	}
) {
	const defaultLocale = options?.defaultLocale || data?.locale || i18n.locale || 'en';
	const storageKey = options?.storageKey || 'i18n-locale';

	// Handle SSR translations for auto-discovered languages
	if (data?.ssrTranslations && data?.locale) {
		// Load SSR translations immediately to prevent flash
		const loadSync = (i18n as any).loadLanguageSync;
		if (loadSync && typeof loadSync === 'function') {
			loadSync.call(i18n, data.locale, data.ssrTranslations);
		}
	}

	// Set locale from server data
	if (data?.locale && i18n.locales.includes(data.locale)) {
		// Use synchronous method if available
		const setLocaleSync = (i18n as any).setLocaleSync;
		if (setLocaleSync && typeof setLocaleSync === 'function') {
			setLocaleSync.call(i18n, data.locale);
		} else {
			// Queue async operation
			i18n.setLocale(data.locale).catch(console.error);
		}
	}

	// Save locale preference to localStorage
	if (browser && data?.locale) {
		try {
			localStorage.setItem(storageKey, data.locale);
		} catch (e) {
			console.warn('[setupI18nClient] Failed to save locale:', e);
		}
	}

	return {
		locale: data?.locale || defaultLocale,
		locales: data?.locales || i18n.locales,
		i18nReady: true
	};
}

/**
 * Initialize i18n on mount (client-side only)
 * Use this in your +layout.svelte onMount
 *
 * @param i18n - The i18n instance
 * @param data - SSR data
 * @param options - Configuration options
 */
export async function initI18nOnMount<T = I18nInstance>(
	i18n: T & Pick<I18nInstance, 'locale' | 'locales' | 'setLocale'>,
	data: any,
	options?: {
		initFunction?: (i18n: any) => Promise<void>;
		storageKey?: string;
		defaultLocale?: string;
	}
) {
	if (!browser) return;

	const storageKey = options?.storageKey || 'i18n-locale';

	// Run custom initialization if provided
	if (options?.initFunction) {
		await options.initFunction(i18n);
	}

	// Try to restore locale from localStorage
	try {
		const storedLocale = localStorage.getItem(storageKey);
		if (storedLocale && storedLocale !== i18n.locale) {
			if (i18n.locales.includes(storedLocale)) {
				await i18n.setLocale(storedLocale);
			}
		}
	} catch (e) {
		console.warn('[initI18nOnMount] Failed to restore locale:', e);
	}

	// Subscribe to locale changes to save preference
	if ((i18n as any).subscribe) {
		(i18n as any).subscribe((state: any) => {
			if (browser && state?.locale) {
				try {
					localStorage.setItem(storageKey, state.locale);
				} catch (e) {
					console.warn('[initI18nOnMount] Failed to save locale:', e);
				}
			}
		});
	}

	return {
		locale: i18n.locale,
		locales: i18n.locales,
		i18nReady: true
	};
}

/**
 * Check if i18n is ready (translations loaded)
 *
 * @param i18n - The i18n instance
 * @param data - SSR data
 */
export function i18nIsReady<T = I18nInstance>(
	i18n: T & Pick<I18nInstance, 'locale' | 'locales'>,
	data: any
): boolean {
	const locale = data?.locale || i18n.locale;
	return i18n.locales.includes(locale);
}

/**
 * Backward compatible client init function
 * @deprecated Use setupI18nClient or initI18nOnMount instead
 */
export async function i18nClientInit<T = I18nInstance>(
	i18n: T & Pick<I18nInstance, 'locale' | 'locales' | 'setLocale'>,
	data: any,
	options?: {
		storageKey?: string;
		autoLoad?: boolean;
		initFunction?: (i18n: any) => Promise<void>;
	}
) {
	// Setup client first
	setupI18nClient(i18n, data, options);

	// Then run mount initialization if in browser
	if (browser) {
		await initI18nOnMount(i18n, data, options);
	}

	return {
		locale: i18n.locale,
		locales: data?.locales || i18n.locales,
		i18nReady: true
	};
}
