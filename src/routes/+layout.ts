import type { LayoutLoad } from './$types.js';
import { loadI18nUniversal } from '$lib/index.js';
import { browser } from '$app/environment';
import { i18n } from '../translations/i18n.js';

// Disable prerendering to allow dynamic SSR with cookies
export const prerender = false;
export const ssr = true;

// Simple i18n setup - all complex logic handled by loadI18nUniversal
export const load: LayoutLoad = async ({ data }) => {
	// Get i18n data with CSR/SSR handling
	const i18nData = await loadI18nUniversal(i18n, data, browser, {
		defaultLocale: i18n.locale
	});

	// Return i18n data (you can add your own data here)
	return {
		...i18nData
		// myCustomData: 'value'
	};
};
