/**
 * Type-safe unified i18n configuration
 * Provides type checking for translation keys
 */

import { createI18n as createOriginal, initI18n, type UnifiedI18nConfig } from './unified.js';
import type { I18nInstance, InterpolationParams } from './domain/models/types.js';

// Re-export types from unified
export type { UnifiedI18nConfig } from './unified.js';

/**
 * Typed unified i18n instance with application-specific translation keys
 */
export interface TypedUnifiedI18nInstance<TPath extends string = string>
	extends Omit<I18nInstance, 't'> {
	t(key: TPath, params?: InterpolationParams): string;
	// Include sync methods from base interface
	setLocaleSync?: (locale: string) => void;
	loadLanguageSync?: (locale: string, translations: any) => void;
}

/**
 * Create a type-safe i18n instance with compile-time key checking
 *
 * @example
 * ```typescript
 * import { createTypedI18n } from '@shelchin/svelte-i18n';
 * import type { I18nPath } from './types/i18n-generated';
 *
 * const config = {
 *   namespace: 'app',
 *   isMain: true,
 *   translations: {...}
 * };
 *
 * // Now i18n.t() only accepts valid keys
 * export const i18n = createTypedI18n<I18nPath>(config);
 * ```
 */
export function createTypedUnifiedI18n<TPath extends string = string>(
	config: UnifiedI18nConfig = {}
): TypedUnifiedI18nInstance<TPath> {
	return createOriginal(config) as TypedUnifiedI18nInstance<TPath>;
}

/**
 * Type-safe wrapper for getI18n function
 */
export function getTypedUnifiedI18n<
	TPath extends string = string
>(): TypedUnifiedI18nInstance<TPath> {
	return createOriginal() as TypedUnifiedI18nInstance<TPath>;
}

// Type-safe version of initI18n that accepts typed instances
export async function initTypedI18n<TPath extends string = string>(
	instance: TypedUnifiedI18nInstance<TPath>
) {
	return initI18n(instance as I18nInstance);
}
