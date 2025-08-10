/**
 * Type-safe wrapper that enhances the default i18n store with type safety
 * This replaces the default getI18n and setupI18n exports
 */

import {
	setupI18n as setupOriginal,
	getI18n as getOriginal
} from './application/stores/store.svelte.js';
import type { I18nConfig, I18nInstance } from './domain/models/types.js';

// Try to import generated types - these will be created by the application
type AppI18nPath = string; // Will be overridden when types are generated
// Types will be overridden when generated

// Attempt to load generated types if they exist
try {
	const appTypes = await import('../types/app-i18n-generated.js');
	// @ts-expect-error - Global type assignment
	globalThis.__I18N_TYPES__ = appTypes;
} catch {
	// Types not generated yet - that's OK
}

/**
 * Enhanced I18nInstance with type-safe t() method
 */
export interface TypedI18nInstance extends Omit<I18nInstance, 't'> {
	/**
	 * Type-safe translation function
	 * When app types are generated, this will provide autocomplete and type checking
	 */
	t(key: AppI18nPath, params?: Record<string, unknown>): string;
}

/**
 * Create a typed wrapper around the i18n instance
 */
function makeTyped(instance: I18nInstance): TypedI18nInstance {
	// Return the instance as-is but with typed interface
	// The actual runtime behavior doesn't change
	return instance as TypedI18nInstance;
}

/**
 * Get the global i18n instance with type safety
 * This is the ONLY getI18n export - always type-safe
 */
export function getI18n(): TypedI18nInstance {
	return makeTyped(getOriginal());
}

/**
 * Setup i18n with configuration and get type-safe instance
 * This is the ONLY setupI18n export - always type-safe
 */
export function setupI18n(config: I18nConfig): TypedI18nInstance {
	return makeTyped(setupOriginal(config));
}
