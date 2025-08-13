import type { LayoutLoad } from './$types.js';
import { browser } from '$app/environment';
import { i18n } from '../translations/i18n.js';

// Enable prerendering for static generation
export const prerender = true;
export const ssr = true;

export const load: LayoutLoad = async () => {
	// For static generation, we can't use cookies
	// The actual locale will be determined on the client side after loading all translations
	let locale = i18n.locale || 'zh'; // Ensure we have a fallback to 'zh'

	// Don't check locale validity here since auto-discovered languages aren't loaded yet
	// This will be handled in +layout.svelte after clientLoad()
	if (browser) {
		// Just get the saved locale without validation
		const savedLocale = localStorage.getItem('i18n-locale');
		if (savedLocale) {
			locale = savedLocale;
		} else {
			// No saved locale, use the configured default
			locale = 'zh';
		}
	}

	// Return initial data for the layout
	return {
		locale: locale,
		locales: i18n.locales // This will be updated after clientLoad()
	};
};
