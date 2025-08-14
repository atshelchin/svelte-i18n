/**
 * Unified SvelteKit load functions for i18n
 * Combines functionality from multiple helper files
 */

import type { I18nInstance } from '$lib/domain/models/types.js';
import { getBestLocale } from '$lib/infrastructure/utils/pathname-locale.js';
import {
	saveLocaleUniversal,
	getInitialLocaleUniversal
} from '$lib/infrastructure/persistence/universal-persistence.js';

// Re-export from layout-load.ts for now (will refactor later)
export { 
	loadI18nSSR,
	loadI18nUniversal,
	setupI18nClient,
	initI18nOnMount
} from '$lib/helpers/layout-load.js';

// Re-export from layout-helpers.ts for now (will refactor later)
export {
	i18nServerLoad,
	i18nUniversalLoad,
	i18nClientInit,
	i18nIsReady,
	handleSSR,
	handleClient,
	handleUniversal
} from '$lib/helpers/layout-helpers.js';

// TODO: In next steps, we will:
// 1. Move the actual implementations here
// 2. Remove duplication between the functions
// 3. Delete the original files
// 4. Update all imports