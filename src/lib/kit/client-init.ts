/**
 * Client-side initialization functions for i18n
 * Handles browser-specific initialization and hydration
 */

import type { I18nInstance } from '$lib/core/types.js';
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

	// For static builds, prioritize localStorage over SSR data
	// Check if we have a stored locale that should take precedence
	let actualLocale = data?.locale || defaultLocale;
	let shouldUseStoredLocale = false;

	if (browser) {
		try {
			const storedLocale = localStorage.getItem(storageKey);
			if (storedLocale && i18n.locales.includes(storedLocale)) {
				shouldUseStoredLocale = true;
				actualLocale = storedLocale;
				console.log(
					`[setupI18nClient] Found stored locale: ${storedLocale}, will use it instead of SSR data`
				);
				// Set the stored locale immediately
				const setLocaleSync = (i18n as any).setLocaleSync;
				if (setLocaleSync && typeof setLocaleSync === 'function') {
					setLocaleSync.call(i18n, storedLocale);
				}
			}
		} catch (e) {
			console.warn('[setupI18nClient] Failed to check stored locale:', e);
		}
	}

	// Only use SSR data if we don't have a stored locale
	if (
		!shouldUseStoredLocale &&
		data?.locale &&
		data.locale !== i18n.locale &&
		i18n.locales.includes(data.locale)
	) {
		console.log(`[setupI18nClient] Setting locale from SSR data: ${data.locale}`);
		// Use synchronous method if available
		const setLocaleSync = (i18n as any).setLocaleSync;
		if (setLocaleSync && typeof setLocaleSync === 'function') {
			setLocaleSync.call(i18n, data.locale);
		} else {
			// Queue async operation
			i18n.setLocale(data.locale).catch(console.error);
		}
	}

	// Only save to localStorage if we're not using a stored locale
	// This prevents overwriting the user's preference with SSR data
	if (browser && !shouldUseStoredLocale && actualLocale) {
		try {
			console.log(`[setupI18nClient] Saving initial locale to storage: ${actualLocale}`);
			localStorage.setItem(storageKey, actualLocale);
		} catch (e) {
			console.warn('[setupI18nClient] Failed to save locale:', e);
		}
	}

	return {
		locale: actualLocale,
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
	_data: any,
	options?: {
		initFunction?: (i18n: any, initOptions?: any) => Promise<void>;
		storageKey?: string;
		defaultLocale?: string;
	}
) {
	if (!browser) return;

	const storageKey = options?.storageKey || 'i18n-locale';

	// Run custom initialization if provided
	// Don't pass skipLocaleRestore here - let the init function handle locale restoration
	if (options?.initFunction) {
		await options.initFunction(i18n);
	}

	// Always try to restore locale from localStorage
	// This ensures persistence works across page refreshes
	try {
		const storedLocale = localStorage.getItem(storageKey);
		console.log(`[initI18nOnMount] Stored locale: ${storedLocale}, current locale: ${i18n.locale}`);
		if (storedLocale) {
			// Always try to set the stored locale, even if it matches current
			// This ensures the locale is properly set after page refresh
			const allLocales = [...i18n.locales];
			// Also check availableLocales if the instance has it
			if ((i18n as any).availableLocales) {
				allLocales.push(...(i18n as any).availableLocales);
			}
			// Remove duplicates
			const uniqueLocales = [...new Set(allLocales)];

			if (uniqueLocales.includes(storedLocale)) {
				console.log(`[initI18nOnMount] Setting/restoring locale to: ${storedLocale}`);
				await i18n.setLocale(storedLocale);
			} else {
				console.log(
					`[initI18nOnMount] Stored locale ${storedLocale} not in available locales:`,
					uniqueLocales
				);
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
