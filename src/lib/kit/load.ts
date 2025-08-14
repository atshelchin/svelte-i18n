/**
 * Unified SvelteKit load functions for i18n
 * Combines functionality from multiple helper files
 */

// SSR functions - use new unified implementation
export { loadI18nSSR, i18nServerLoad } from './ssr-load.js';

// Universal and client functions - still from original files
export { loadI18nUniversal, setupI18nClient, initI18nOnMount } from '$lib/helpers/layout-load.js';

export {
	i18nUniversalLoad,
	i18nClientInit,
	i18nIsReady,
	handleSSR,
	handleClient,
	handleUniversal
} from '$lib/helpers/layout-helpers.js';
