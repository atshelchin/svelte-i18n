/**
 * Unified i18n initialization for both packages and applications
 * Provides consistent API regardless of context
 */

import type { I18nConfig, TranslationSchema } from '$lib/domain/models/types.js';
import { setupI18n, getI18n } from '$lib/application/stores/store.svelte.js';
import { configManager } from '$lib/application/stores/config-manager.js';
import { registerPackageTranslations } from '$lib/services/loader.js';

export interface UnifiedI18nConfig extends Partial<I18nConfig> {
	/**
	 * The namespace for this i18n instance
	 * - Use 'app' or leave empty for main application
	 * - Use package name for libraries
	 */
	namespace?: string;

	/**
	 * Whether this is the main application instance
	 * When true, other instances will inherit its configuration
	 */
	isMain?: boolean;

	/**
	 * Built-in translations for this instance
	 */
	translations?: Record<string, TranslationSchema>;
}

/**
 * Create a unified i18n configuration
 * This function works identically for both packages and applications
 *
 * @example
 * // In a package (my-ui-lib/src/lib/i18n.ts)
 * import translations from '$lib/translations.js';
 *
 * export const i18n = createI18n({
 *   namespace: 'my-ui-lib',
 *   translations
 * });
 *
 * @example
 * // In a SvelteKit app (src/lib/i18n.ts)
 * import translations from '$lib/translations.js';
 *
 * export const i18n = createI18n({
 *   namespace: 'app',
 *   isMain: true,
 *   defaultLocale: 'en',
 *   fallbackLocale: 'en',
 *   translations
 * });
 */
export function createI18n(config: UnifiedI18nConfig = {}) {
	const namespace = config.namespace || 'app';
	const isMain = config.isMain ?? namespace === 'app';

	// Register built-in translations if provided
	if (config.translations) {
		registerPackageTranslations(namespace, config.translations);
	}

	// Create the base configuration
	// Keep namespace as 'app' internally for consistency with registration
	const baseConfig: I18nConfig = {
		...config,
		defaultLocale: config.defaultLocale || 'en',
		fallbackLocale: config.fallbackLocale || 'en',
		namespace: namespace
	};

	// Register configuration
	configManager.register(namespace, baseConfig, isMain);

	// Get the effective configuration (may inherit from main app)
	const effectiveConfig = configManager.getConfig(namespace) || baseConfig;

	// Setup i18n with the effective configuration
	const instance = setupI18n(effectiveConfig);

	return instance;
}

/**
 * Get an existing i18n instance by namespace
 * If namespace is not provided, returns the main app instance
 */
export function getI18nInstance(namespace?: string) {
	return getI18n(namespace);
}

/**
 * Initialize i18n (call this in both packages and apps after setup)
 * This provides a consistent initialization flow
 *
 * @example
 * // In +layout.svelte (both for packages and apps)
 * import { onMount } from 'svelte';
 * import { i18n, initI18n } from '$lib/i18n';
 *
 * onMount(async () => {
 *   await initI18n(i18n);
 * });
 */
export async function initI18n(instance: ReturnType<typeof setupI18n>) {
	// Auto-detect environment and load accordingly
	if (typeof window !== 'undefined') {
		// Client-side: load translations
		await instance.clientLoad();
	}
	// Server-side loading is handled in +layout.server.ts if needed

	return instance;
}

// Re-export commonly used types
export type { I18nConfig, TranslationSchema } from '$lib/domain/models/types.js';
export type I18n = ReturnType<typeof createI18n>;
