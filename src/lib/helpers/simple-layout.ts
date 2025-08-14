/**
 * Simplified layout helpers for @shelchin/svelte-i18n
 * Provides one-liner solutions for SvelteKit layout files
 */

import type { Cookies } from '@sveltejs/kit';
import { onMount } from 'svelte';

/**
 * Server-side i18n data loader for +layout.server.ts
 * Returns i18n data that can be merged with your own data
 *
 * @example
 * ```typescript
 * // +layout.server.ts
 * import { loadI18nSSR } from '@shelchin/svelte-i18n';
 * import { i18n } from '$lib/translations/i18n.js';
 *
 * export const load = async ({ cookies }) => {
 *   const i18nData = await loadI18nSSR(i18n, cookies);
 *
 *   // Add your own data
 *   return {
 *     ...i18nData,
 *     myCustomData: 'value'
 *   };
 * };
 * ```
 */
export async function loadI18nSSR(
	i18n: any, // Accept any i18n instance type
	cookies: Cookies,
	options?: {
		cookieName?: string;
		defaultLocale?: string;
	}
) {
	const cookieName = options?.cookieName || 'i18n-locale';
	const defaultLocale = options?.defaultLocale || i18n.locale || 'zh';
	const namespace = (i18n as any).config?.namespace || 'app';

	// Get locale from cookie
	const cookieLocale = cookies.get(cookieName);
	const locale = cookieLocale || defaultLocale;

	console.log(`[handleSSR] Cookie locale: ${cookieLocale}, determined locale: ${locale}`);

	// Try to load and set the locale
	if (cookieLocale && !i18n.locales.includes(cookieLocale)) {
		// Try loading as auto-discovered locale
		if (typeof window === 'undefined') {
			try {
				const { loadServerTranslations, isAutoDiscoveredLocale } = await import(
					'$lib/infrastructure/loaders/server-loader.js'
				);

				if (isAutoDiscoveredLocale(cookieLocale, namespace)) {
					console.log(`[handleSSR] Loading auto-discovered locale: ${cookieLocale}`);
					const loaded = loadServerTranslations(i18n as any, cookieLocale, namespace);
					if (loaded) {
						console.log(`[handleSSR] Successfully loaded ${cookieLocale} for SSR`);
						await i18n.setLocale(cookieLocale);
					}
				}
			} catch (error) {
				console.error('[handleSSR] Error loading server utilities:', error);
			}
		}
	} else if (cookieLocale && i18n.locales.includes(cookieLocale)) {
		// Locale is already loaded, just set it
		await i18n.setLocale(cookieLocale);
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
			console.error('[handleSSR] Failed to read auto-discovery config:', error);
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
			console.error('[handleSSR] Error checking auto-discovered locale:', error);
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
 * Handles both SSR and CSR modes, returns data to merge
 *
 * @example
 * ```typescript
 * // +layout.ts
 * import { loadI18nUniversal } from '@shelchin/svelte-i18n';
 * import { i18n } from '$lib/translations/i18n.js';
 * import { browser } from '$app/environment';
 *
 * export const load = async ({ data }) => {
 *   const i18nData = await loadI18nUniversal(i18n, data, browser);
 *
 *   // Add your own data
 *   return {
 *     ...i18nData,
 *     myCustomData: 'value'
 *   };
 * };
 * ```
 */
export async function loadI18nUniversal(
	i18n: any, // Accept any i18n instance type
	data: any,
	browser: boolean,
	options?: {
		storageKey?: string;
		defaultLocale?: string;
	}
) {
	const storageKey = options?.storageKey || 'i18n-locale';
	const defaultLocale = options?.defaultLocale || 'zh';

	// Use locale from server if available (includes cookie value)
	let locale = data?.locale || i18n.locale || defaultLocale;
	let translationsLoaded = false;

	// In browser, check localStorage which takes precedence
	if (browser) {
		const savedLocale = localStorage.getItem(storageKey);
		if (savedLocale) {
			locale = savedLocale;
		} else if (!data?.locale) {
			// No saved locale and no cookie, use default
			locale = defaultLocale;
		}

		// In CSR mode, preload the target locale to prevent flash
		if (!data?.ssrTranslations && locale) {
			console.log('[handleUniversal] CSR mode - preloading locale:', locale);

			// Check if locale needs loading
			if (!i18n.locales.includes(locale)) {
				// Check if it's an auto-discovered locale
				if (data?.locales && data.locales.includes(locale)) {
					console.log('[handleUniversal] Loading auto-discovered locale:', locale);

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
							console.log('[handleUniversal] Successfully preloaded:', locale);
						}
					} catch (error) {
						console.error('[handleUniversal] Failed to preload locale:', locale, error);
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

	// Return initial data for the layout
	return {
		...data,
		locale: locale,
		locales: data?.locales || i18n.locales,
		translationsPreloaded: translationsLoaded
	};
}

/**
 * Client-side i18n initialization for +layout.svelte
 * Handles all complex initialization logic and calls onReady when complete
 *
 * @example
 * ```svelte
 * <!-- +layout.svelte -->
 * <script lang="ts">
 * import { initI18nClient } from '@shelchin/svelte-i18n';
 * import { i18n, initI18n } from '$lib/translations/i18n.js';
 *
 * let { data, children } = $props();
 * let ready = $state(false);
 *
 * initI18nClient(i18n, data, {
 *   initFunction: initI18n,
 *   onReady: () => ready = true
 * });
 * </script>
 *
 * {#if ready}
 *   {@render children()}
 * {:else}
 *   <div>Loading...</div>
 * {/if}
 * ```
 */
export function initI18nClient(
	i18n: any, // Accept any i18n instance type
	data: any,
	options?: {
		initFunction?: (i18n: any) => Promise<void>;
		storageKey?: string;
		defaultLocale?: string;
		onReady?: () => void;
	}
) {
	const storageKey = options?.storageKey || 'i18n-locale';
	const defaultLocale = options?.defaultLocale || 'zh';
	const initFunction = options?.initFunction;
	const onReady = options?.onReady;

	// Initialize with the locale from server (which includes cookie value)
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
		console.log(`[handleClient] Loading SSR translations for ${initialLocale}`);
		(i18n as any).loadLanguageSync(initialLocale, data.ssrTranslations);
		// Set locale immediately after loading translations
		(i18n as any).setLocaleSync(initialLocale);
		isReady = true;
		if (onReady) onReady();
	} else if (data?.translationsPreloaded) {
		// Translations were preloaded in +layout.ts
		console.log('[handleClient] Using preloaded translations');
		isReady = true;
		if (onReady) onReady();
	} else if (
		i18n.locale !== initialLocale &&
		i18n.locales.includes(initialLocale) &&
		(i18n as any).setLocaleSync
	) {
		// Set initial locale immediately to prevent flash for built-in languages
		(i18n as any).setLocaleSync(initialLocale);
		isReady = true;
		if (onReady) onReady();
	} else if (typeof window !== 'undefined' && !isSSR) {
		// CSR mode - translations should have been preloaded in +layout.ts
		console.log('[handleClient] CSR mode fallback - loading translations');

		// Check if current locale matches target
		if (i18n.locale === initialLocale && i18n.locales.includes(initialLocale)) {
			// Already loaded and set
			isReady = true;
			if (onReady) onReady();
		} else {
			// Load translations immediately in CSR mode
			(async () => {
				// Get saved locale from localStorage
				const savedLocale = localStorage.getItem(storageKey);
				const targetLocale = savedLocale || initialLocale;

				// Initialize i18n and load all translations
				if (initFunction) {
					await initFunction(i18n);
				}

				// Set the target locale
				if (i18n.locales.includes(targetLocale)) {
					await i18n.setLocale(targetLocale);
				}

				// Now ready to render
				isReady = true;
				if (onReady) onReady();
			})();
		}
	} else {
		// SSR or already loaded
		isReady = true;
		if (onReady) onReady();
	}

	// Setup onMount handler
	onMount(async () => {
		// If we already initialized in CSR mode, skip
		if (!isSSR && isReady) {
			console.log('[handleClient] Already initialized in CSR mode');
			return;
		}

		// Initialize app i18n instance (this loads auto-discovered translations)
		if (initFunction) {
			await initFunction(i18n);
		}

		// Get saved locale from localStorage (takes precedence over cookie)
		const savedLocale = localStorage.getItem(storageKey);

		// Determine final target locale
		let targetLocale = initialLocale; // Use initialLocale from SSR

		if (savedLocale && i18n.locales.includes(savedLocale)) {
			// localStorage takes precedence
			targetLocale = savedLocale;
		}

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
	});

	return isReady;
}

// Backward compatibility exports (will be deprecated)
export const handleSSR = (i18n: any, options?: any) => {
	return async ({ cookies }: { cookies: Cookies }) => {
		return loadI18nSSR(i18n, cookies, options);
	};
};

export const handleUniversal = (i18n: any, options?: any) => {
	return async ({ data }: { data: any }) => {
		const { browser } = await import('$app/environment');
		return loadI18nUniversal(i18n, data, browser, options);
	};
};

export const handleClient = initI18nClient;
