import type { LayoutServerLoad } from './$types.js';
import { i18nServerLoad } from '@shelchin/svelte-i18n';
import { i18n } from '../translations/i18n.js';

// With custom options
export const load: LayoutServerLoad = async ({ cookies }) => {
	const data = await i18nServerLoad(i18n, cookies, {
		cookieName: 'my-app-locale',
		defaultLocale: 'zh'
	});

	// Add your own data
	return {
		...data,
		customData: 'your data here'
	};
};
