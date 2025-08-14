/**
 * Unified SvelteKit load functions for i18n
 * All SvelteKit-specific i18n helpers in one place
 */

// ============================================
// SSR functions (+layout.server.ts)
// ============================================
export {
	loadI18nSSR,
	i18nServerLoad // @deprecated
} from './ssr-load.js';

// ============================================
// Universal functions (+layout.ts)
// ============================================
export {
	loadI18nUniversal,
	i18nUniversalLoad // @deprecated
} from './universal-load.js';

// ============================================
// Client functions (+layout.svelte)
// ============================================
export {
	setupI18nClient,
	initI18nOnMount,
	i18nIsReady,
	i18nClientInit // @deprecated
} from './client-init.js';

// ============================================
// Backward compatibility exports
// ============================================
export {
	handleSSR, // @deprecated
	handleClient, // @deprecated
	handleUniversal // @deprecated
} from './compat.js';

// ============================================
// Re-export types for convenience
// ============================================
export type { I18nInstance, TranslationSchema } from '$lib/core/types.js';
