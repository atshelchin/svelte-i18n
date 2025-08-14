import type { LayoutLoad } from './$types.js';
import { loadI18nUniversal } from '$lib/index.js';
import { browser } from '$app/environment';
import { i18n } from '../translations/i18n.js';

// Build mode configuration:
//
// Development (npm run dev):
//   - Always uses SSR for better pathname locale detection
//
// Production builds:
//   - npm run build:static  -> Static prerendering for GitHub Pages
//   - npm run build:ssr     -> SSR mode for server deployment
//   - npm run build         -> Default to static for GitHub Pages
//
// You can also set VITE_BUILD_MODE environment variable:
//   - 'static': Forces static prerendering (prerender=true, ssr=false)
//   - 'ssr': Forces SSR mode (prerender=false, ssr=true)
//   - undefined/other: Defaults to static mode for safety
const buildMode = import.meta.env.VITE_BUILD_MODE;
const isDevelopment = import.meta.env.DEV;

// Development always uses SSR, production depends on build mode
const isSSRMode = isDevelopment || buildMode === 'ssr';
const isStaticMode = !isDevelopment && buildMode !== 'ssr';

// Configure based on mode
export const prerender = isStaticMode;
export const ssr = isSSRMode;

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
