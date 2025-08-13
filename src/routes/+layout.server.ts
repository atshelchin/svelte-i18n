import type { LayoutServerLoad } from './$types.js';
import { loadI18nSSR } from '$lib/index.js';
import { i18n } from '../translations/i18n.js';

// Simple i18n setup - all complex logic handled by loadI18nSSR
export const load: LayoutServerLoad = async ({ cookies }) => {
	// Get i18n data
	const i18nData = await loadI18nSSR(i18n, cookies, {
		defaultLocale: i18n.locale
	});

	// Return i18n data (you can add your own data here)
	return {
		...i18nData
		// myCustomData: 'value'
	};
};
