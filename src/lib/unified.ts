/**
 * Unified i18n initialization for both packages and applications
 * Provides consistent API with optional type safety
 */

import type {
	I18nConfig,
	TranslationSchema,
	I18nInstance,
	InterpolationParams
} from '$lib/core/types.js';
import { setupI18n, getI18n } from '$lib/core/store.svelte.js';
import { configManager } from '$lib/core/config-manager.js';
import { registerPackageTranslations } from '$lib/services/built-in-loader.js';

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
 * Typed unified i18n instance with application-specific translation keys
 */
export interface TypedI18nInstance<TPath extends string = string> extends Omit<I18nInstance, 't'> {
	t(key: TPath, params?: InterpolationParams): string;
	// Include sync methods from base interface
	setLocaleSync?: (locale: string) => void;
	loadLanguageSync?: (locale: string, translations: any) => void;
}

/**
 * Create a unified i18n configuration with optional type safety
 * This function works identically for both packages and applications
 *
 * @example
 * // Without type safety (simple usage)
 * export const i18n = createI18n({
 *   namespace: 'app',
 *   isMain: true,
 *   translations
 * });
 *
 * @example
 * // With type safety (recommended)
 * import type { I18nPath } from '$lib/types/i18n-generated';
 *
 * export const i18n = createI18n<I18nPath>({
 *   namespace: 'app',
 *   isMain: true,
 *   translations
 * });
 *
 * @example
 * // In a package
 * import translations from '$lib/translations.js';
 *
 * export const i18n = createI18n({
 *   namespace: 'my-ui-lib',
 *   translations
 * });
 */
export function createI18n<TPath extends string = string>(
	config: UnifiedI18nConfig = {}
): TypedI18nInstance<TPath> {
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

	return instance as TypedI18nInstance<TPath>;
}

/**
 * Get an existing i18n instance by namespace with optional type safety
 * @param namespace - The namespace to get, defaults to 'app'
 *
 * @example
 * // Without type safety
 * const i18n = getI18nInstance();
 *
 * @example
 * // With type safety
 * import type { I18nPath } from '$lib/types/i18n-generated';
 * const i18n = getI18nInstance<I18nPath>();
 */
export function getI18nInstance<TPath extends string = string>(
	namespace?: string
): TypedI18nInstance<TPath> {
	return getI18n(namespace) as TypedI18nInstance<TPath>;
}

/**
 * Initialize i18n on the client side
 * Call this in your root +layout.svelte
 *
 * @example
 * // In +layout.svelte (both for packages and apps)
 * <script>
 *   import { onMount } from 'svelte';
 *   import { initI18n } from '@shelchin/svelte-i18n';
 *   import { i18n } from '$lib/i18n';
 *
 *   onMount(() => {
 *     initI18n(i18n);
 *   });
 * </script>
 */
export async function initI18n<TPath extends string = string>(
	instance: TypedI18nInstance<TPath> | I18nInstance
): Promise<TypedI18nInstance<TPath> | I18nInstance> {
	// Auto-detect environment and load accordingly
	if (typeof window !== 'undefined' && 'clientLoad' in instance && instance.clientLoad) {
		// Client-side: load translations
		await instance.clientLoad();
	}
	// Server-side loading is handled in +layout.server.ts if needed

	return instance;
}

// Export types
export type { I18nConfig, TranslationSchema } from '$lib/core/types.js';
export type I18n = ReturnType<typeof createI18n>;

// Legacy exports for backward compatibility (from typed-unified.ts)
export const createTypedUnifiedI18n = createI18n;
export const getTypedUnifiedI18n = getI18nInstance;
export const initTypedI18n = initI18n;
export type TypedUnifiedI18nInstance<T extends string = string> = TypedI18nInstance<T>;
