/**
 * Universal load function for i18n (+layout.ts)
 * Handles both server and client-side initialization
 */

import type { I18nInstance } from '$lib/domain/models/types.js';
import { browser } from '$app/environment';

/**
 * Universal load function for i18n
 * Use this in your +layout.ts file
 *
 * @param i18n - The i18n instance
 * @param data - Data from parent layout (server data)
 * @param url - Optional URL for pathname detection
 * @param options - Configuration options
 */
export async function loadI18nUniversal<T = I18nInstance>(
	i18n: T & Pick<I18nInstance, 'locale' | 'locales' | 'setLocale'>,
	data: any,
	url?: URL | { pathname: string },
	options?: {
		storageKey?: string;
		defaultLocale?: string;
		namespace?: string;
	}
) {
	const storageKey = options?.storageKey || 'i18n-locale';

	// On client, try to restore locale from localStorage
	if (browser && typeof window !== 'undefined') {
		try {
			const storedLocale = localStorage.getItem(storageKey);
			if (storedLocale && i18n.locales.includes(storedLocale)) {
				// Use stored locale if valid
				await i18n.setLocale(storedLocale);
			} else if (data?.locale && i18n.locales.includes(data.locale)) {
				// Use server-provided locale
				await i18n.setLocale(data.locale);
			}
		} catch (e) {
			console.warn('[loadI18nUniversal] Failed to restore locale:', e);
		}
	} else if (data?.locale) {
		// On server or during SSR, use data from server
		if (i18n.locales.includes(data.locale)) {
			await i18n.setLocale(data.locale);
		}
	}

	// Return combined data
	return {
		locale: i18n.locale,
		locales: data?.locales || i18n.locales,
		i18nReady: true,
		...(data || {})
	};
}

/**
 * Backward compatible universal load function
 * @deprecated Use loadI18nUniversal instead
 */
export async function i18nUniversalLoad<T = I18nInstance>(
	i18n: T & Pick<I18nInstance, 'locale' | 'locales' | 'setLocale'>,
	data: any,
	browser: boolean,
	options?: {
		storageKey?: string;
		defaultLocale?: string;
	}
) {
	// Delegate to new implementation
	return loadI18nUniversal(i18n, data, undefined, options);
}
