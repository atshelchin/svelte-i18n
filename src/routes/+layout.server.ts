import type { LayoutServerLoad } from './$types.js';
import { i18n } from '../translations/i18n.js';
import {
	loadServerTranslations,
	isAutoDiscoveredLocale
} from '../lib/infrastructure/loaders/server-loader.js';

export const load: LayoutServerLoad = async ({ cookies }) => {
	// Read the language preference from cookie during SSR
	const cookieLocale = cookies.get('i18n-locale');
	console.log('[+layout.server.ts] Cookie locale:', cookieLocale);

	// Use cookie value if available, otherwise use default locale
	const locale = cookieLocale || i18n.locale || 'zh';
	console.log('[+layout.server.ts] Determined locale:', locale);

	// Check if the locale is an auto-discovered language that needs loading
	if (cookieLocale && !i18n.locales.includes(cookieLocale)) {
		// Check if it's an auto-discovered locale
		if (isAutoDiscoveredLocale(cookieLocale, 'app')) {
			console.log(`[+layout.server.ts] Loading auto-discovered locale: ${cookieLocale}`);
			const loaded = loadServerTranslations(i18n as any, cookieLocale, 'app');
			if (loaded) {
				console.log(`[+layout.server.ts] Successfully loaded ${cookieLocale} for SSR`);
				// Set the locale after loading
				await i18n.setLocale(cookieLocale);
			} else {
				console.warn(`[+layout.server.ts] Failed to load auto-discovered locale: ${cookieLocale}`);
			}
		}
	} else if (cookieLocale && i18n.locales.includes(cookieLocale)) {
		// Locale is already loaded, just set it
		await i18n.setLocale(cookieLocale);
	}

	// Return all available locales including auto-discovered ones
	// The client will load auto-discovered translations if needed
	const allLocales = [...i18n.locales];

	// Also check for other auto-discovered locales to include in the list
	if (typeof window === 'undefined') {
		try {
			const fs = await import('fs');
			const path = await import('path');
			const indexPath = path.join(process.cwd(), 'static', 'translations', 'index.json');

			if (fs.existsSync(indexPath)) {
				const indexContent = fs.readFileSync(indexPath, 'utf-8');
				const config = JSON.parse(indexContent);

				if (config.autoDiscovery?.app) {
					for (const lang of config.autoDiscovery.app) {
						if (!allLocales.includes(lang)) {
							allLocales.push(lang);
						}
					}
				}
			}
		} catch (error) {
			console.error('[+layout.server.ts] Failed to read auto-discovery config:', error);
		}
	}

	// Also pass the current translations if it's an auto-discovered language
	// This helps prevent flash during hydration
	let ssrTranslations = undefined;
	if (locale && isAutoDiscoveredLocale(locale, 'app')) {
		// Pass the translations for hydration
		ssrTranslations = (i18n as any).translations?.[locale];
	}

	return {
		locale,
		locales: allLocales,
		ssrTranslations,
		isAutoDiscovered: locale ? isAutoDiscoveredLocale(locale, 'app') : false
	};
};
