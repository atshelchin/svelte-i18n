import type { LayoutServerLoad } from './$types.js';
import { i18n } from '../translations/i18n.js';

export const load: LayoutServerLoad = async ({ cookies }) => {
	// Debug: Check what cookies we receive
	const cookieValue = cookies.get('i18n-locale');

	// Use the global i18n instance and update its locale for this request
	// serverLoad will update the instance's currentLocale
	await i18n.serverLoad(cookies);
	console.log('i18n.locale after serverLoad:', i18n.locale, 'cookie was:', cookieValue);

	// Return the current locale to the client
	// i18n.locale should now be updated by serverLoad
	return {
		locale: i18n.locale,
		locales: i18n.locales,
		debugCookie: cookieValue // Add debug info
	};
};
