import type { LayoutLoad } from './$types.js';
import { browser } from '$app/environment';
import { i18n } from '../translations/i18n.js';

// Disable prerendering to allow dynamic SSR with cookies
export const prerender = false;
export const ssr = true;

export const load: LayoutLoad = async ({ data }) => {
	// Use locale from server if available (includes cookie value)
	let locale = data?.locale || i18n.locale || 'zh';
	let translationsLoaded = false;

	// In browser, check localStorage which takes precedence
	if (browser) {
		const savedLocale = localStorage.getItem('i18n-locale');
		if (savedLocale) {
			locale = savedLocale;
		} else if (!data?.locale) {
			// No saved locale and no cookie, use default
			locale = 'zh';
		}

		// In CSR mode, preload the target locale to prevent flash
		if (!data?.ssrTranslations && locale) {
			console.log('[+layout.ts] CSR mode - preloading locale:', locale);

			// Check if locale needs loading
			if (!i18n.locales.includes(locale)) {
				// Check if it's an auto-discovered locale
				if (data?.locales && data.locales.includes(locale)) {
					console.log('[+layout.ts] Loading auto-discovered locale:', locale);

					try {
						// Load the auto-discovered language
						const basePath = window.location.origin;
						const translationsPath = `/translations/app/${locale}.json`;
						const source = `${basePath}${translationsPath}`;

						const response = await fetch(source);
						if (response.ok) {
							const translations = await response.json();
							if (i18n.loadLanguageSync) {
								i18n.loadLanguageSync(locale, translations);
							} else {
								await i18n.loadLanguage(locale, translations);
							}
							translationsLoaded = true;
							console.log('[+layout.ts] Successfully preloaded:', locale);
						}
					} catch (error) {
						console.error('[+layout.ts] Failed to preload locale:', locale, error);
					}
				}
			} else {
				// Locale already loaded
				translationsLoaded = true;
			}

			// Set the locale if it's available
			if (i18n.locales.includes(locale)) {
				if (i18n.setLocaleSync) {
					i18n.setLocaleSync(locale);
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
};
