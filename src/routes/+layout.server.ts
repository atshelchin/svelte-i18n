import type { LayoutServerLoad } from './$types.js';
import { i18n } from '../translations/i18n.js';

export const load: LayoutServerLoad = async ({ cookies }) => {
	// Read the language preference from cookie during SSR
	const cookieLocale = cookies.get('i18n-locale');
	console.log('[+layout.server.ts] Cookie locale:', cookieLocale);

	// Use cookie value if available, otherwise use default locale
	const locale = cookieLocale || i18n.locale || 'zh';
	console.log('[+layout.server.ts] Determined locale:', locale);

	// Set the locale in the i18n instance for SSR
	if (cookieLocale && i18n.locales.includes(cookieLocale)) {
		await i18n.setLocale(cookieLocale);
	}

	return {
		locale,
		locales: i18n.locales
	};
};
