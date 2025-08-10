/**
 * Type-safe exports for i18n with full autocomplete support
 * Import from '$lib/typed' instead of '$lib' to get type safety:
 *
 * import { getI18n } from '$lib/typed';
 * const i18n = getI18n();
 * i18n.t('common.welcome'); // ✅ Type-safe with autocomplete!
 */

import {
	getI18n as getOriginalI18n,
	setupI18n as setupOriginalI18n
} from './application/stores/store.svelte.js';
import type { I18nConfig, I18nInstance, InterpolationParams } from './domain/models/types.js';
// Import the app-generated types (application should generate these)
import type { I18nPath, I18nKeys } from '../types/app-i18n-generated.js';

// Helper type to get nested value from object
type GetValue<T, P extends string> = P extends keyof T
	? T[P]
	: P extends `${infer K}.${infer R}`
		? K extends keyof T
			? T[K] extends Record<string, unknown>
				? GetValue<T[K], R>
				: never
			: never
		: never;

// Extract params from the generated ParamsKey type
type GetPathParams<P extends I18nPath> =
	GetValue<I18nKeys, P> extends { key: string; params: infer Params } ? Params : never;

/**
 * Type-safe i18n instance with autocomplete for translation keys
 */
export interface TypedI18nInstance extends Omit<I18nInstance, 't'> {
	/**
	 * Type-safe translation function with autocomplete
	 * @param key - Translation key (with autocomplete!)
	 * @param params - Parameters for interpolation (type-checked!)
	 */
	t<P extends I18nPath>(
		key: P,
		...params: GetPathParams<P> extends never ? [] : [GetPathParams<P>]
	): string;
}

/**
 * Create a type-safe proxy around the i18n instance
 */
function createTypedProxy(instance: I18nInstance): TypedI18nInstance {
	return new Proxy(instance, {
		get(target, prop) {
			if (prop === 't') {
				// Return a typed version of the t function
				return (key: string, params?: Record<string, unknown>) => {
					return target.t(key, params as InterpolationParams);
				};
			}
			return target[prop as keyof I18nInstance];
		}
	}) as TypedI18nInstance;
}

/**
 * Get the global i18n instance with type safety
 *
 * @example
 * import { getI18n } from '$lib/typed';
 *
 * const i18n = getI18n();
 * i18n.t('common.welcome'); // ✅ Autocomplete!
 * i18n.t('common.greeting', { name: 'John' }); // ✅ Type-checked params!
 * i18n.t('invalid.key'); // ❌ TypeScript error!
 */
export function getI18n(): TypedI18nInstance {
	const instance = getOriginalI18n();
	return createTypedProxy(instance);
}

/**
 * Setup i18n with configuration and get type-safe instance
 *
 * @example
 * import { setupI18n } from '$lib/typed';
 *
 * const i18n = setupI18n({
 *   defaultLocale: 'en',
 *   fallbackLocale: 'en'
 * });
 *
 * i18n.t('common.welcome'); // ✅ Type-safe!
 */
export function setupI18n(config: I18nConfig): TypedI18nInstance {
	const instance = setupOriginalI18n(config);
	return createTypedProxy(instance);
}

// Re-export everything else from the main index
export * from './index.js';
