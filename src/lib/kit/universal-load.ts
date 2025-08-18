/**
 * Universal load function for i18n (+layout.ts)
 * Handles both server and client-side initialization
 */

import type { I18nInstance } from '$lib/core/types.js';
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

	// On client, first ensure auto-discovery is completed
	if (browser && typeof window !== 'undefined') {
		// FIRST: Ensure auto-discovered languages are registered
		// This must happen BEFORE attempting to set any locale
		if ('clientLoad' in i18n && typeof (i18n as any).clientLoad === 'function') {
			console.log('[loadI18nUniversal] Running clientLoad to register auto-discovered languages');
			try {
				// Call clientLoad with skipLocaleRestore=true to only load translations
				// We'll handle locale restoration ourselves after
				await (i18n as any).clientLoad({ skipLocaleRestore: true });
			} catch (error) {
				console.warn('[loadI18nUniversal] clientLoad failed:', error);
			}
		}

		// THEN: Try to restore locale from localStorage
		try {
			const storedLocale = localStorage.getItem(storageKey);
			console.log(
				`[loadI18nUniversal] localStorage locale: ${storedLocale}, server data locale: ${data?.locale}`
			);
			console.log(`[loadI18nUniversal] Available locales after clientLoad:`, i18n.locales);

			// Priority: localStorage > server data > current locale
			if (storedLocale) {
				// Wait a tiny bit to ensure all async operations in clientLoad are complete
				// This is a workaround for potential race conditions
				await new Promise((resolve) => setTimeout(resolve, 10));

				// Try to set the stored locale - setLocale will handle loading if needed
				console.log(
					`[loadI18nUniversal] Attempting to restore locale from localStorage: ${storedLocale}`
				);
				console.log(`[loadI18nUniversal] Available locales before setLocale:`, i18n.locales);
				await i18n.setLocale(storedLocale);
				// Mark locale as restored to prevent duplicate restoration
				if ('localeRestored' in i18n) {
					(i18n as any).localeRestored = true;
				}
			} else if (data?.locale && data.locale !== i18n.locale) {
				// Use server-provided locale only if different from current
				console.log(`[loadI18nUniversal] Using server locale: ${data.locale}`);
				await i18n.setLocale(data.locale);
				// Mark locale as restored to prevent duplicate restoration
				if ('localeRestored' in i18n) {
					(i18n as any).localeRestored = true;
				}
			} else {
				console.log(`[loadI18nUniversal] Keeping current locale: ${i18n.locale}`);
				// Mark locale as restored even if we kept the current locale
				if ('localeRestored' in i18n) {
					(i18n as any).localeRestored = true;
				}
			}
		} catch (e) {
			console.warn('[loadI18nUniversal] Failed to restore locale:', e);
			// Fall back to server locale if available
			if (data?.locale) {
				try {
					await i18n.setLocale(data.locale);
				} catch {
					// Ignore fallback error
				}
			}
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
