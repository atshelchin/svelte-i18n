import type { LayoutLoad } from './$types.js';
import { browser } from '$app/environment';
import { i18n } from '../translations/i18n.js';

// Enable prerendering for static generation
export const prerender = true;
export const ssr = true;

export const load: LayoutLoad = async () => {
	// For static generation, we can't use cookies
	// The actual locale will be determined on the client side
	let locale = i18n.locale;

	// On client side, get locale from localStorage or browser preference
	if (browser) {
		// Check localStorage first
		const savedLocale = localStorage.getItem('i18n-locale');
		if (savedLocale && i18n.locales.includes(savedLocale)) {
			locale = savedLocale;
		} else {
			// Try to detect browser language
			const browserLang = i18n.detectBrowserLanguage();
			if (browserLang && i18n.locales.includes(browserLang)) {
				locale = browserLang;
			}
		}
	}

	// Return initial data for the layout
	return {
		locale: locale,
		locales: i18n.locales
	};
};
