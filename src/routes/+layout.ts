import type { LayoutLoad } from './$types.js';
import { loadI18nUniversal } from '$lib/index.js';
import { browser } from '$app/environment';
import { i18n } from '../translations/i18n.js';

// Enable SSR for pathname locale detection
export const prerender = false;
export const ssr = true;

/**
 * Universal load function with pathname locale detection
 *
 * The locale is determined by the following priority:
 * 1. URL pathname (e.g., /zh/about, /en-US/products)
 * 2. Browser: localStorage | Server: cookie (from data)
 * 3. Default locale
 */
export const load: LayoutLoad = async ({ data, url }) => {
	// Pass url to enable pathname locale detection
	const i18nData = await loadI18nUniversal(i18n, data, browser, url, {
		storageKey: 'i18n-locale',
		defaultLocale: i18n.locale
	});

	// Return i18n data (you can add your own data here)
	return {
		...i18nData
		// myCustomData: 'value'
	};
};
