/**
 * Simplified i18n helper functions for SvelteKit layout files
 * These functions handle i18n logic and return data that can be merged with your own
 */

import type { Cookies } from '@sveltejs/kit';

/**
 * Server-side i18n data loader for +layout.server.ts
 *
 * @example
 * ```typescript
 * // +layout.server.ts
 * import type { LayoutServerLoad } from '$lib/helpers/$types.js';
 * import { loadI18nSSR } from '$lib/index.js';
 * import { i18n } from '$lib/translations/i18n.js';
 *
 * export const load: LayoutServerLoad = async ({ cookies, url }) => {
 *   const i18nData = await loadI18nSSR(i18n, cookies, url);
 *
 *   return {
 *     ...i18nData,
 *     // Your custom data
 *     myData: 'value'
 *   };
 * };
 * ```
 */
export async function loadI18nSSR(
	i18n: any,
	cookies: Cookies,
	url?: URL | { pathname: string },
	options?: {
		cookieName?: string;
		defaultLocale?: string;
	}
) {
	// Import pathname locale utilities
	const { extractLocaleFromPathname } = await import(
		'$lib/infrastructure/utils/pathname-locale.js'
	);

	const cookieName = options?.cookieName || 'i18n-locale';
	const defaultLocale = options?.defaultLocale || i18n.locale || 'zh';
	const namespace = (i18n as any).config?.namespace || 'app';
	const pathname = url?.pathname || '/';

	// Get locale from cookie
	const cookieLocale = cookies.get(cookieName);

	// First, check if pathname contains a valid locale code that might be auto-discovered
	const pathnameLocale = extractLocaleFromPathname(pathname);
	let locale = defaultLocale;

	// Check if pathname locale is valid (even if not yet loaded)
	if (pathnameLocale) {
		// Check if it's already loaded
		if (i18n.locales.includes(pathnameLocale)) {
			locale = pathnameLocale;
		} else if (typeof window === 'undefined') {
			// On server, check if it's an auto-discovered locale
			try {
				const { isAutoDiscoveredLocale } = await import(
					'$lib/infrastructure/loaders/server-loader.js'
				);
				if (isAutoDiscoveredLocale(pathnameLocale, namespace)) {
					locale = pathnameLocale;
				}
			} catch (error) {
				console.error('[loadI18nSSR] Error checking auto-discovered locale:', error);
			}
		}
	}

	// If no valid pathname locale, fall back to cookie or default
	if (locale === defaultLocale && cookieLocale) {
		if (i18n.locales.includes(cookieLocale)) {
			locale = cookieLocale;
		} else if (typeof window === 'undefined') {
			// Check if cookie locale is auto-discovered
			try {
				const { isAutoDiscoveredLocale } = await import(
					'$lib/infrastructure/loaders/server-loader.js'
				);
				if (isAutoDiscoveredLocale(cookieLocale, namespace)) {
					locale = cookieLocale;
				}
			} catch (error) {
				console.error('[loadI18nSSR] Error checking cookie locale:', error);
			}
		}
	}

	console.log(
		`[loadI18nSSR] Pathname: ${pathname}, Cookie locale: ${cookieLocale}, determined locale: ${locale}`
	);

	// Try to load and set the locale
	if (locale && !i18n.locales.includes(locale)) {
		// Try loading as auto-discovered locale
		if (typeof window === 'undefined') {
			try {
				const { loadServerTranslations, isAutoDiscoveredLocale } = await import(
					'$lib/infrastructure/loaders/server-loader.js'
				);

				if (isAutoDiscoveredLocale(locale, namespace)) {
					console.log(`[loadI18nSSR] Loading auto-discovered locale: ${locale}`);
					const loaded = loadServerTranslations(i18n as any, locale, namespace);
					if (loaded) {
						console.log(`[loadI18nSSR] Successfully loaded ${locale} for SSR`);
						await i18n.setLocale(locale);
					}
				}
			} catch (error) {
				console.error('[loadI18nSSR] Error loading server utilities:', error);
			}
		}
	} else if (locale && i18n.locales.includes(locale)) {
		// Locale is already loaded, just set it
		await i18n.setLocale(locale);
	}

	// Get all available locales including auto-discovered ones
	const allLocales = [...i18n.locales];

	// Check for auto-discovered locales to include in the list
	if (typeof window === 'undefined') {
		try {
			const fs = await import('fs');
			const path = await import('path');
			const indexPath = path.join(process.cwd(), 'static', 'translations', 'index.json');

			if (fs.existsSync(indexPath)) {
				const indexContent = fs.readFileSync(indexPath, 'utf-8');
				const config = JSON.parse(indexContent);

				// Add auto-discovered locales to the list
				if (namespace === 'app' && config.autoDiscovery?.app) {
					for (const lang of config.autoDiscovery.app) {
						if (!allLocales.includes(lang)) {
							allLocales.push(lang);
						}
					}
				} else if (config.autoDiscovery?.packages?.[namespace]) {
					for (const lang of config.autoDiscovery.packages[namespace]) {
						if (!allLocales.includes(lang)) {
							allLocales.push(lang);
						}
					}
				}
			}
		} catch (error) {
			console.error('[loadI18nSSR] Failed to read auto-discovery config:', error);
		}
	}

	// Pass SSR translations for auto-discovered languages
	let ssrTranslations = undefined;
	let isAutoDiscovered = false;

	if (locale && typeof window === 'undefined') {
		try {
			const { isAutoDiscoveredLocale } = await import(
				'$lib/infrastructure/loaders/server-loader.js'
			);

			if (isAutoDiscoveredLocale(locale, namespace)) {
				isAutoDiscovered = true;
				// Pass the translations for hydration to prevent flash
				ssrTranslations = (i18n as any).translations?.[locale];
			}
		} catch (error) {
			console.error('[loadI18nSSR] Error checking auto-discovered locale:', error);
		}
	}

	return {
		locale,
		locales: allLocales,
		ssrTranslations,
		isAutoDiscovered,
		i18nReady: true
	};
}

/**
 * Universal i18n data loader for +layout.ts
 *
 * @example
 * ```typescript
 * // +layout.ts
 * import type { LayoutLoad } from '$lib/helpers/$types.js';
 * import { loadI18nUniversal } from '$lib/index.js';
 * import { i18n } from '$lib/translations/i18n.js';
 * import { browser } from '$app/environment';
 *
 * export const load: LayoutLoad = async ({ data, url }) => {
 *   const i18nData = await loadI18nUniversal(i18n, data, browser, url);
 *
 *   return {
 *     ...i18nData,
 *     // Your custom data
 *     myData: 'value'
 *   };
 * };
 * ```
 */
export async function loadI18nUniversal(
	i18n: any,
	data: any,
	browser: boolean,
	url?: URL | { pathname: string },
	options?: {
		storageKey?: string;
		defaultLocale?: string;
	}
) {
	// Import pathname locale utilities
	const { getBestLocale } = await import('$lib/infrastructure/utils/pathname-locale.js');

	const storageKey = options?.storageKey || 'i18n-locale';
	const defaultLocale = options?.defaultLocale || 'zh';
	const pathname = url?.pathname || (browser ? window.location.pathname : '/');

	// Use locale from server if available (includes cookie value and pathname locale)
	let locale = data?.locale || i18n.locale || defaultLocale;
	let translationsLoaded = false;

	// In browser, determine best locale based on priority
	if (browser) {
		const savedLocale = localStorage.getItem(storageKey);

		// Priority:
		// 1. Pathname locale (if valid and supported)
		// 2. localStorage
		// 3. Server locale (from data, which includes cookie)
		// 4. Default locale
		locale = getBestLocale(
			pathname,
			i18n,
			savedLocale || data?.locale,
			defaultLocale,
			data?.locales
		);

		// In CSR mode, preload the target locale to prevent flash
		if (!data?.ssrTranslations && locale) {
			console.log('[loadI18nUniversal] CSR mode - preloading locale:', locale);

			// Check if locale needs loading
			if (!i18n.locales.includes(locale)) {
				// Check if it's an auto-discovered locale
				if (data?.locales && data.locales.includes(locale)) {
					console.log('[loadI18nUniversal] Loading auto-discovered locale:', locale);

					try {
						// Load the auto-discovered language
						const basePath = window.location.origin;
						const namespace = (i18n as any).config?.namespace || 'app';
						const translationsPath = `/translations/${namespace}/${locale}.json`;
						const source = `${basePath}${translationsPath}`;

						const response = await fetch(source);
						if (response.ok) {
							const translations = await response.json();

							// Use sync method if available for better performance
							if ((i18n as any).loadLanguageSync) {
								(i18n as any).loadLanguageSync(locale, translations);
							} else {
								await i18n.loadLanguage(locale, translations);
							}
							translationsLoaded = true;
							console.log('[loadI18nUniversal] Successfully preloaded:', locale);
						}
					} catch (error) {
						console.error('[loadI18nUniversal] Failed to preload locale:', locale, error);
					}
				}
			} else {
				// Locale already loaded
				translationsLoaded = true;
			}

			// Set the locale if it's available
			if (i18n.locales.includes(locale)) {
				if ((i18n as any).setLocaleSync) {
					(i18n as any).setLocaleSync(locale);
				} else {
					await i18n.setLocale(locale);
				}
			}
		}
	}

	// Return data for the layout
	return {
		...data,
		locale: locale,
		locales: data?.locales || i18n.locales,
		translationsPreloaded: translationsLoaded
	};
}

/**
 * Setup i18n in +layout.svelte (synchronous part before rendering)
 * Call this in the script to prevent flash during hydration
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { setupI18nClient } from '$lib/index.js';
 * import { i18n } from '$lib/translations/i18n.js';
 *
 * let { data } = $props();
 *
 * // Setup i18n synchronously to prevent flash
 * const isReady = setupI18nClient(i18n, data);
 * </script>
 * ```
 */
export function setupI18nClient(
	i18n: any,
	data: any,
	options?: {
		defaultLocale?: string;
	}
): boolean {
	const defaultLocale = options?.defaultLocale || 'zh';
	const initialLocale = data?.locale || defaultLocale;

	// Check if we're in SSR or CSR mode
	const isSSR =
		data?.ssrTranslations !== undefined ||
		data?.translationsPreloaded ||
		i18n.locales.includes(initialLocale);

	let isReady = false;

	// Handle SSR with auto-discovered languages
	if (
		data?.isAutoDiscovered &&
		data?.ssrTranslations &&
		(i18n as any).loadLanguageSync &&
		(i18n as any).setLocaleSync
	) {
		// Load the SSR translations synchronously to prevent flash
		console.log(`[setupI18nClient] Loading SSR translations for ${initialLocale}`);
		(i18n as any).loadLanguageSync(initialLocale, data.ssrTranslations);
		// Set locale immediately after loading translations
		(i18n as any).setLocaleSync(initialLocale);
		isReady = true;
	} else if (data?.translationsPreloaded) {
		// Translations were preloaded in +layout.ts
		console.log('[setupI18nClient] Using preloaded translations');
		isReady = true;
	} else if (
		i18n.locale !== initialLocale &&
		i18n.locales.includes(initialLocale) &&
		(i18n as any).setLocaleSync
	) {
		// Set initial locale immediately to prevent flash for built-in languages
		(i18n as any).setLocaleSync(initialLocale);
		isReady = true;
	} else if (typeof window !== 'undefined' && !isSSR) {
		// CSR mode - should have been preloaded in +layout.ts
		if (i18n.locale === initialLocale && i18n.locales.includes(initialLocale)) {
			isReady = true;
		}
	} else {
		// SSR or already loaded
		isReady = true;
	}

	return isReady;
}

/**
 * Initialize i18n on client mount
 * Call this in onMount to load auto-discovered translations and set locale
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onMount } from 'svelte';
 * import { initI18nOnMount } from '$lib/index.js';
 * import { i18n, initI18n } from '$lib/translations/i18n.js';
 *
 * let { data } = $props();
 *
 * onMount(async () => {
 *   await initI18nOnMount(i18n, data, {
 *     initFunction: initI18n
 *   });
 * });
 * </script>
 * ```
 */
export async function initI18nOnMount(
	i18n: any,
	data: any,
	options?: {
		initFunction?: (i18n: any) => Promise<void>;
		storageKey?: string;
		defaultLocale?: string;
	}
) {
	// Import pathname locale utilities
	const { getBestLocale } = await import('$lib/infrastructure/utils/pathname-locale.js');

	const storageKey = options?.storageKey || 'i18n-locale';
	const defaultLocale = options?.defaultLocale || 'zh';
	const initFunction = options?.initFunction;
	const pathname = window.location.pathname;
	const initialLocale = data?.locale || defaultLocale;

	// Check if we're in SSR or CSR mode
	const isSSR =
		data?.ssrTranslations !== undefined ||
		data?.translationsPreloaded ||
		i18n.locales.includes(initialLocale);

	// If we're in CSR mode and not ready, initialize now
	if (typeof window !== 'undefined' && !isSSR) {
		// Get saved locale from localStorage
		const savedLocale = localStorage.getItem(storageKey);

		// Determine target locale with pathname priority
		const targetLocale = getBestLocale(
			pathname,
			i18n,
			savedLocale || initialLocale,
			defaultLocale,
			data?.locales
		);

		if (i18n.locale !== targetLocale || !i18n.locales.includes(targetLocale)) {
			// Initialize i18n and load all translations
			if (initFunction) {
				await initFunction(i18n);
			}

			// Set the target locale
			if (i18n.locales.includes(targetLocale)) {
				await i18n.setLocale(targetLocale);
			}
		}
		return;
	}

	// Initialize app i18n instance (this loads auto-discovered translations)
	if (initFunction) {
		await initFunction(i18n);
	}

	// Get saved locale from localStorage
	const savedLocale = localStorage.getItem(storageKey);

	// Determine final target locale based on priority:
	// 1. Pathname locale (if valid and supported)
	// 2. localStorage
	// 3. Initial locale from SSR (includes cookie)
	// 4. Default locale
	const targetLocale = getBestLocale(
		pathname,
		i18n,
		savedLocale || initialLocale,
		defaultLocale,
		i18n.locales
	);

	// Set the locale - this should work now that auto-discovered translations are loaded
	if (i18n.locale !== targetLocale && i18n.locales.includes(targetLocale)) {
		await i18n.setLocale(targetLocale);
	}

	// Log for debugging
	console.log('Locale initialization:', {
		dataLocale: data?.locale,
		savedLocale,
		configuredDefault: defaultLocale,
		currentLocale: i18n.locale,
		targetLocale,
		availableLocales: i18n.locales
	});
}
