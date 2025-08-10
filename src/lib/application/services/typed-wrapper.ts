/**
 * Typed i18n wrapper that provides compile-time type safety
 * This wrapper uses the generated types from the CLI tool
 */

import type { I18nInstance, InterpolationParams } from '../../domain/models/types.js';
// These types should be imported from the app's generated types
// This is just a placeholder for the library
type I18nKeys = Record<string, unknown>;
type I18nPath = string;

/**
 * Type helper to get nested value from object
 */
type GetValue<T, P extends string> = P extends keyof T
	? T[P]
	: P extends `${infer K}.${infer R}`
		? K extends keyof T
			? T[K] extends Record<string, unknown>
				? GetValue<T[K], R>
				: never
			: never
		: never;

/**
 * Extract parameter type from a value
 */
type ExtractParams<V> = V extends { key: string; params: infer P } ? P : never;

/**
 * Type-safe translation function signature
 */
export interface TypedTranslate {
	<P extends I18nPath>(
		key: P,
		...params: ExtractParams<GetValue<I18nKeys, P>> extends never
			? []
			: [ExtractParams<GetValue<I18nKeys, P>>]
	): string;
}

/**
 * Type-safe i18n instance
 */
export interface TypedI18nInstance extends Omit<I18nInstance, 't'> {
	t: TypedTranslate;
}

/**
 * Create a typed wrapper around the i18n instance
 * @param i18n - The base i18n instance
 * @returns A typed i18n instance with compile-time type safety
 */
export function createTypedWrapper(i18n: I18nInstance): TypedI18nInstance {
	// Create typed translation function
	const typedT: TypedTranslate = ((key: string, params?: Record<string, unknown>) => {
		return i18n.t(key, params as InterpolationParams);
	}) as TypedTranslate;

	// Return typed instance
	return {
		...i18n,
		t: typedT
	};
}

/**
 * Helper function to validate translation keys at runtime
 * Useful during development to catch missing translations
 */
export function validateTranslationKey(key: string, availablePaths: readonly string[]): boolean {
	return availablePaths.includes(key);
}

/**
 * Development-only helper to get autocomplete for translation keys
 * @example
 * const key = getTranslationKey('demo.title'); // autocomplete works!
 */
export function getTranslationKey<K extends I18nPath>(key: K): K {
	return key;
}
