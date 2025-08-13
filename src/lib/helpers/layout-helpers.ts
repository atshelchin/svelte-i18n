/**
 * Helper functions for SvelteKit layout files
 * Simplifies i18n setup in +layout.server.ts, +layout.ts, and +layout.svelte
 */

import type { Cookies } from '@sveltejs/kit';
import type { TypedUnifiedI18nInstance } from '$lib/typed-unified.js';
import type { I18nInstance } from '../domain/models/types.js';

// ============================================
// Server-side helpers (+layout.server.ts)
// ============================================

/**
 * Server-side load function for i18n
 * Use this in your +layout.server.ts
 *
 * @example
 * ```typescript
 * // +layout.server.ts
 * import { i18nServerLoad } from '@shelchin/svelte-i18n';
 * import { i18n } from '../translations/i18n';
 *
 * export const load = ({ cookies }) => i18nServerLoad(i18n, cookies);
 * ```
 */
export async function i18nServerLoad(
	i18n: TypedUnifiedI18nInstance,
	cookies: Cookies,
	options?: {
		cookieName?: string;
		defaultLocale?: string;
		namespace?: string;
	}
) {
	// Import server-side utilities (only available on server)
	let loadServerTranslations: any;
	let isAutoDiscoveredLocale: any;

	if (typeof window === 'undefined') {
		const serverLoader = await import('../infrastructure/loaders/server-loader.js');
		loadServerTranslations = serverLoader.loadServerTranslations;
		isAutoDiscoveredLocale = serverLoader.isAutoDiscoveredLocale;
	}

	const cookieName = options?.cookieName || 'i18n-locale';
	const defaultLocale = options?.defaultLocale || i18n.locale || 'zh';
	const namespace = options?.namespace || (i18n as any).config?.namespace || 'app';

	// Get locale from cookie
	const cookieLocale = cookies.get(cookieName);
	const locale = cookieLocale || defaultLocale;

	console.log(`[i18nServerLoad] Cookie locale: ${cookieLocale}, determined locale: ${locale}`);

	// Handle auto-discovered locales
	if (cookieLocale && !i18n.locales.includes(cookieLocale)) {
		if (isAutoDiscoveredLocale && isAutoDiscoveredLocale(cookieLocale, namespace)) {
			console.log(`[i18nServerLoad] Loading auto-discovered locale: ${cookieLocale}`);
			if (loadServerTranslations) {
				const loaded = loadServerTranslations(i18n as any, cookieLocale, namespace);
				if (loaded) {
					console.log(`[i18nServerLoad] Successfully loaded ${cookieLocale} for SSR`);
					await i18n.setLocale(cookieLocale);
				} else {
					console.warn(`[i18nServerLoad] Failed to load auto-discovered locale: ${cookieLocale}`);
				}
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
			console.error('[i18nServerLoad] Failed to read auto-discovery config:', error);
		}
	}

	// Pass SSR translations for auto-discovered languages
	let ssrTranslations = undefined;
	let isAutoDiscovered = false;

	if (locale && isAutoDiscoveredLocale && isAutoDiscoveredLocale(locale, namespace)) {
		isAutoDiscovered = true;
		// Pass the translations for hydration to prevent flash
		ssrTranslations = (i18n as any).translations?.[locale];
	}

	return {
		locale,
		locales: allLocales,
		ssrTranslations,
		isAutoDiscovered,
		i18nReady: true
	};
}

// ============================================
// Universal load helpers (+layout.ts)
// ============================================

/**
 * Universal load function for i18n (works on both server and client)
 * Use this in your +layout.ts
 *
 * @example
 * ```typescript
 * // +layout.ts
 * import { i18nUniversalLoad } from '@shelchin/svelte-i18n';
 * import { i18n } from '../translations/i18n';
 * import { browser } from '$app/environment';
 *
 * export const load = ({ data }) => i18nUniversalLoad(i18n, data, browser);
 * ```
 */
export async function i18nUniversalLoad(
	i18n: I18nInstance,
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
			console.log('[i18nUniversalLoad] CSR mode - preloading locale:', locale);

			// Check if locale needs loading
			if (!i18n.locales.includes(locale)) {
				// Check if it's an auto-discovered locale
				if (data?.locales && data.locales.includes(locale)) {
					console.log('[i18nUniversalLoad] Loading auto-discovered locale:', locale);

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
							console.log('[i18nUniversalLoad] Successfully preloaded:', locale);
						}
					} catch (error) {
						console.error('[i18nUniversalLoad] Failed to preload locale:', locale, error);
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

// ============================================
// Client-side helpers (+layout.svelte)
// ============================================

/**
 * Client-side initialization for i18n
 * Use this in your +layout.svelte onMount
 *
 * @example
 * ```svelte
 * <!-- +layout.svelte -->
 * <script>
 * import { onMount } from 'svelte';
 * import { i18nClientInit } from '@shelchin/svelte-i18n';
 * import { i18n } from '../translations/i18n';
 *
 * let { data } = $props();
 *
 * onMount(() => i18nClientInit(i18n, data));
 * </script>
 * ```
 */
export async function i18nClientInit(
	i18n: I18nInstance,
	data: any,
	options?: {
		storageKey?: string;
		autoLoad?: boolean;
	}
) {
	const storageKey = options?.storageKey || 'i18n-locale';
	const autoLoad = options?.autoLoad !== false;

	// Load translations if configured
	if (autoLoad && i18n.clientLoad) {
		await i18n.clientLoad();
	}

	// Get saved locale from localStorage
	const savedLocale = localStorage.getItem(storageKey);
	const serverLocale = data?.locale;

	// Determine best locale (localStorage > server > default)
	const targetLocale = savedLocale || serverLocale || i18n.locale;

	// Set locale if available and different
	if (targetLocale !== i18n.locale && i18n.locales.includes(targetLocale)) {
		await i18n.setLocale(targetLocale);
	}

	return {
		locale: i18n.locale,
		locales: i18n.locales
	};
}

/**
 * Simple ready check for preventing flash during hydration
 *
 * @example
 * ```svelte
 * <script>
 * import { i18nIsReady } from '@shelchin/svelte-i18n';
 *
 * let isReady = $state(i18nIsReady(i18n, data));
 * </script>
 *
 * {#if isReady}
 *   <div>Content</div>
 * {:else}
 *   <div>Loading...</div>
 * {/if}
 * ```
 */
export function i18nIsReady(i18n: I18nInstance, data: any): boolean {
	// Check if translations are loaded for current locale
	const locale = data?.locale || i18n.locale;
	return i18n.locales.includes(locale);
}

// ============================================
// Minimal setup helpers (one-liner solutions)
// ============================================

/**
 * Minimal SSR setup - just one line in +layout.server.ts
 *
 * @example
 * ```typescript
 * // +layout.server.ts
 * import { handleSSR } from '@shelchin/svelte-i18n';
 * import { i18n } from '../translations/i18n';
 *
 * export const load = handleSSR(i18n);
 * ```
 */
export function handleSSR(i18n: I18nInstance) {
	return async ({ cookies }: { cookies: Cookies }) => {
		return i18nServerLoad(i18n, cookies);
	};
}

/**
 * Minimal client setup - just one line in +layout.svelte
 * Handles all complex logic including SSR/CSR detection, flash prevention, and proper initialization
 *
 * @example
 * ```svelte
 * <!-- +layout.svelte -->
 * <script>
 * import { handleClient } from '@shelchin/svelte-i18n';
 * import { i18n, initI18n } from '../translations/i18n';
 *
 * let { data, children } = $props();
 * const ready = handleClient(i18n, data, { initFunction: initI18n });
 * </script>
 *
 * {#if ready.value}
 *   {@render children()}
 * {:else}
 *   <div>Loading...</div>
 * {/if}
 * ```
 */
export function handleClient(
	i18n: I18nInstance,
	data: any,
	options?: {
		initFunction?: (i18n: I18nInstance) => Promise<void>;
		storageKey?: string;
		defaultLocale?: string;
	}
) {
	const storageKey = options?.storageKey || 'i18n-locale';
	const defaultLocale = options?.defaultLocale || 'zh';
	const initFunction = options?.initFunction;

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
		isReady = true; // SSR is ready
	} else if (data?.translationsPreloaded) {
		// Translations were preloaded in +layout.ts
		console.log('[handleClient] Using preloaded translations');
		isReady = true;
	} else if (
		i18n.locale !== initialLocale &&
		i18n.locales.includes(initialLocale) &&
		(i18n as any).setLocaleSync
	) {
		// Set initial locale immediately to prevent flash for built-in languages
		(i18n as any).setLocaleSync(initialLocale);
		isReady = true; // Built-in language is ready
	} else if (typeof window !== 'undefined' && !isSSR) {
		// CSR mode - translations should have been preloaded in +layout.ts
		// This is a fallback in case preloading didn't work
		console.log('[handleClient] CSR mode fallback - loading translations');

		// Check if current locale matches target
		if (i18n.locale === initialLocale && i18n.locales.includes(initialLocale)) {
			// Already loaded and set
			isReady = true;
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
			})();
		}
	} else {
		// SSR or already loaded
		isReady = true;
	}

	// Setup onMount handler
	if (typeof window !== 'undefined') {
		// Import onMount dynamically to avoid SSR issues
		import('svelte').then(({ onMount }) => {
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
		});
	}

	// Return reactive ready state that can be used in templates
	return {
		get value() {
			return isReady;
		},
		set value(val: boolean) {
			isReady = val;
		}
	};
}

/**
 * Minimal universal setup - for static sites
 *
 * @example
 * ```typescript
 * // +layout.ts
 * import { handleUniversal } from '@shelchin/svelte-i18n';
 * import { i18n } from '../translations/i18n';
 * import { browser } from '$app/environment';
 *
 * export const load = handleUniversal(i18n, browser);
 * ```
 */
export function handleUniversal(i18n: I18nInstance, browser: boolean) {
	return async ({ data }: { data: any }) => {
		return i18nUniversalLoad(i18n, data, browser);
	};
}
