/**
 * Complete helper for +layout.svelte
 * Handles all the complex logic for client-side i18n initialization
 */

import type { I18nInstance } from '$lib/domain/models/types.js';

export interface LayoutSvelteOptions {
	storageKey?: string;
	defaultLocale?: string;
	initFunction?: (i18n: I18nInstance) => Promise<void>;
}

export interface LayoutSvelteResult {
	isReady: boolean;
	setupHandlers: {
		onMount: () => Promise<void>;
		checkReady: () => boolean;
	};
}

/**
 * Complete setup for +layout.svelte with all logic included
 *
 * @example
 * ```svelte
 * <script>
 * import { setupLayoutSvelte } from '@shelchin/svelte-i18n';
 * import { i18n, initI18n } from '$lib/app/i18n';
 *
 * let { data, children } = $props();
 *
 * const { isReady, setupHandlers } = setupLayoutSvelte(i18n, data, {
 *   initFunction: initI18n
 * });
 *
 * let ready = $state(isReady);
 *
 * onMount(async () => {
 *   await setupHandlers.onMount();
 *   ready = true;
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
export function setupLayoutSvelte(
	i18n: I18nInstance,
	data: any,
	options?: LayoutSvelteOptions
): LayoutSvelteResult {
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
		console.log(`[setupLayoutSvelte] Loading SSR translations for ${initialLocale}`);
		(i18n as any).loadLanguageSync(initialLocale, data.ssrTranslations);
		// Set locale immediately after loading translations
		(i18n as any).setLocaleSync(initialLocale);
		isReady = true; // SSR is ready
	} else if (data?.translationsPreloaded) {
		// Translations were preloaded in +layout.ts
		console.log('[setupLayoutSvelte] Using preloaded translations');
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
		console.log('[setupLayoutSvelte] CSR mode fallback - loading translations');

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
	const onMount = async () => {
		// If we already initialized in CSR mode, skip
		if (!isSSR && isReady) {
			console.log('[setupLayoutSvelte] Already initialized in CSR mode');
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
	};

	return {
		isReady,
		setupHandlers: {
			onMount,
			checkReady: () => isReady
		}
	};
}
