import type { LayoutServerLoad } from './$types.js';
import { i18n } from '../translations/i18n.js';

export const load: LayoutServerLoad = async ({ cookies }) => {
	// Use the global i18n instance and update its locale for this request
	// serverLoad will update the instance's currentLocale
	const bestLocale = await i18n.serverLoad(cookies);

	console.log('Best locale:', bestLocale, 'Cookie:', cookies.get('i18n-locale'));
	console.log('i18n.locale after serverLoad:', i18n.locale);

	// Return the current locale to the client
	// i18n.locale should now be updated by serverLoad
	return {
		locale: i18n.locale,
		locales: i18n.locales
	};
};
