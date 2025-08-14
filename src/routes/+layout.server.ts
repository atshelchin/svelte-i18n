import type { LayoutServerLoad } from './$types.js';
import { loadI18nSSR } from '$lib/index.js';
import { i18n } from '../translations/i18n.js';

/**
 * Server-side load function with pathname locale detection
 *
 * The locale is determined by the following priority:
 * 1. URL pathname (e.g., /zh/about, /en-US/products)
 * 2. Cookie value
 * 3. Default locale
 */
export const load: LayoutServerLoad = async ({ cookies, url }) => {
	// Pass url to enable pathname locale detection
	const i18nData = await loadI18nSSR(i18n, cookies, url, {
		cookieName: 'i18n-locale',
		defaultLocale: i18n.locale
	});

	return {
		...i18nData
		// Add your custom data here
	};
};
