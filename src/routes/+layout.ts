import type { LayoutLoad } from './$types.js';
import { browser } from '$app/environment';
import { i18n } from '../translations/i18n.js';

// Disable prerendering to allow dynamic SSR with cookies
export const prerender = false;
export const ssr = true;

export const load: LayoutLoad = async ({ data }) => {
	// Use locale from server if available (includes cookie value)
	let locale = data?.locale || i18n.locale || 'zh';

	// In browser, check localStorage which takes precedence
	if (browser) {
		const savedLocale = localStorage.getItem('i18n-locale');
		if (savedLocale) {
			locale = savedLocale;
		} else if (!data?.locale) {
			// No saved locale and no cookie, use default
			locale = 'zh';
		}
	}

	// Return initial data for the layout
	return {
		locale: locale,
		locales: data?.locales || i18n.locales
	};
};
