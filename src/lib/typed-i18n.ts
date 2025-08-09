/**
 * Enhanced type-safe i18n system with auto-completion
 */

import type { TranslationSchema, InterpolationParams, I18nConfig, I18nInstance } from './types.js';

// Helper type to extract all possible translation keys from a schema
export type ExtractKeys<T, P extends string = ''> = T extends object
	? {
			[K in keyof T]: K extends string
				? T[K] extends object
					? ExtractKeys<T[K], P extends '' ? K : `${P}.${K}`> | (P extends '' ? K : `${P}.${K}`)
					: P extends ''
						? K
						: `${P}.${K}`
				: never;
		}[keyof T]
	: never;

// Helper type to extract parameter requirements for each key
export type ExtractParams<T extends TranslationSchema> = {
	[K in ExtractKeys<T>]: string;
};

// Type to get the parameters for a specific key
export type GetKeyParams<
	T extends TranslationSchema,
	K extends string
> = K extends keyof ExtractParams<T>
	? ExtractParams<T>[K] extends string
		? InterpolationParams
		: never
	: never;

// Enhanced I18n instance with type-safe translations
export interface TypedI18nInstance<
	TSchema extends TranslationSchema = TranslationSchema,
	TKeys extends string = ExtractKeys<TSchema>
> extends I18nInstance<TKeys> {
	/**
	 * Type-safe translation function with auto-completion
	 * @param key - Translation key (auto-completed)
	 * @param params - Parameters for interpolation
	 */
	t<K extends TKeys>(key: K, params?: InterpolationParams): string;

	/**
	 * Add a new translation key (only in development)
	 * This will add the key to the base locale
	 */
	addKey?(key: string, value: string, locale?: string): void;

	/**
	 * Get all available translation keys
	 */
	getKeys(): TKeys[];

	/**
	 * Check if a key exists
	 */
	hasKey(key: string): boolean;
}

// Create a typed wrapper around the standard i18n instance
export function createTypedI18n<TSchema extends TranslationSchema>(
	i18n: I18nInstance,
	schema?: TSchema
): TypedI18nInstance<TSchema> {
	const typedI18n = i18n as TypedI18nInstance<TSchema>;

	// Extract all keys from the schema
	const extractAllKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
		const keys: string[] = [];

		for (const key in obj) {
			if (key === '_meta') continue;

			const fullKey = prefix ? `${prefix}.${key}` : key;
			keys.push(fullKey);

			if (typeof obj[key] === 'object' && obj[key] !== null) {
				keys.push(...extractAllKeys(obj[key] as Record<string, unknown>, fullKey));
			}
		}

		return keys;
	};

	// Add getKeys method
	typedI18n.getKeys = () => {
		if (schema) {
			return extractAllKeys(schema) as typeof typedI18n extends TypedI18nInstance<TSchema, infer K>
				? K[]
				: never[];
		}
		// Fallback to extracting from loaded translations
		const currentTranslations = (i18n as { translations?: Record<string, unknown> }).translations?.[
			i18n.locale
		];
		if (currentTranslations) {
			return extractAllKeys(
				currentTranslations as Record<string, unknown>
			) as typeof typedI18n extends TypedI18nInstance<TSchema, infer K> ? K[] : never[];
		}
		return [] as typeof typedI18n extends TypedI18nInstance<TSchema, infer K> ? K[] : never[];
	};

	// Add hasKey method
	typedI18n.hasKey = (key: string) => {
		const keys = typedI18n.getKeys();
		return keys.includes(key as (typeof keys)[number]);
	};

	// Add development-only key addition
	if (import.meta.env.DEV) {
		typedI18n.addKey = (key: string, value: string, locale?: string) => {
			const targetLocale = locale || i18n.locale;
			console.log(`[i18n] Adding new key "${key}" to locale "${targetLocale}": "${value}"`);

			// This would typically trigger a file write or API call
			// to persist the new translation
			// For now, we'll just log it

			// In a real implementation, this would:
			// 1. Add the key to the base locale JSON file
			// 2. Optionally add placeholder values to other locales
			// 3. Trigger a hot reload
		};
	}

	return typedI18n;
}

// Type definitions for generated translation files
export interface GeneratedTranslationTypes {
	schema: TranslationSchema;
	keys: string;
	params: Record<string, InterpolationParams>;
}

// Helper to create a fully typed i18n instance from generated types
export async function createTypedI18nFromGenerated<T extends GeneratedTranslationTypes>(
	config: I18nConfig
): Promise<TypedI18nInstance<T['schema'], T['keys']>> {
	// This would be imported from the main store
	const { setupI18n } = await import('./store.svelte.js');

	const i18n = setupI18n(config);
	return createTypedI18n<T['schema']>(i18n);
}
