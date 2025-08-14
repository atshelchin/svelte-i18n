/**
 * Default language metadata for common locales
 * Provides fallback information when _meta is not available in translation files
 */

import type { LanguageMeta } from '../models/types.js';
import { commonLanguages } from '../../infrastructure/utils/language-search.js';

// Partial metadata that can be used as fallback
type PartialLanguageMeta = {
	name: string;
	flag: string;
	direction: 'ltr' | 'rtl';
	englishName?: string;
};

/**
 * Default metadata for common languages
 * These are derived from the single source of truth in language-search.ts
 */
export const DEFAULT_LANGUAGE_META_PARTIAL: Record<string, PartialLanguageMeta> =
	Object.fromEntries(
		commonLanguages.map((lang) => [
			lang.code,
			{
				name: lang.name,
				flag: lang.flag,
				direction: lang.direction,
				englishName: lang.englishName
			}
		])
	);

/**
 * Get metadata for a language with fallback to defaults
 * @param locale The locale code
 * @param customMeta Optional custom metadata to use
 * @returns Language metadata
 */
export function getLanguageMeta(locale: string, customMeta?: Partial<LanguageMeta>): LanguageMeta {
	// Use custom metadata if provided and complete
	if (
		customMeta &&
		customMeta.code &&
		customMeta.name &&
		customMeta.englishName &&
		customMeta.direction
	) {
		return customMeta as LanguageMeta;
	}

	// Build complete metadata from partial data
	const partial =
		DEFAULT_LANGUAGE_META_PARTIAL[locale] || DEFAULT_LANGUAGE_META_PARTIAL[locale.split('-')[0]];

	if (partial) {
		const meta: LanguageMeta = {
			code: locale,
			name: partial.name,
			englishName: partial.englishName || partial.name, // Use name as fallback for englishName
			direction: partial.direction,
			flag: partial.flag
		};

		// Adjust flag for regional variants that might not be in the main list
		if (locale === 'en-US' && !DEFAULT_LANGUAGE_META_PARTIAL[locale]) meta.flag = '🇺🇸';
		else if (locale === 'en-GB' && !DEFAULT_LANGUAGE_META_PARTIAL[locale]) meta.flag = '🇬🇧';
		else if (locale === 'en-AU' && !DEFAULT_LANGUAGE_META_PARTIAL[locale]) meta.flag = '🇦🇺';
		else if (locale === 'en-CA' && !DEFAULT_LANGUAGE_META_PARTIAL[locale]) meta.flag = '🇨🇦';
		else if (locale === 'fr-CA' && !DEFAULT_LANGUAGE_META_PARTIAL[locale]) meta.flag = '🇨🇦';
		else if (locale === 'es-MX' && !DEFAULT_LANGUAGE_META_PARTIAL[locale]) meta.flag = '🇲🇽';
		else if (locale === 'es-AR' && !DEFAULT_LANGUAGE_META_PARTIAL[locale]) meta.flag = '🇦🇷';

		return meta;
	}

	// Fallback to generic metadata
	return {
		code: locale,
		name: locale.toUpperCase(),
		englishName: locale.toUpperCase(),
		direction: 'ltr',
		flag: '🌐'
	};
}

/**
 * Merge multiple language metadata sources
 * Priority: custom > translation file > defaults
 */
export function mergeLanguageMeta(
	locale: string,
	sources: {
		custom?: LanguageMeta;
		fromFile?: LanguageMeta;
		defaults?: boolean;
	}
): LanguageMeta {
	// Custom metadata has highest priority
	if (sources.custom) {
		return sources.custom;
	}

	// Translation file metadata has second priority
	if (sources.fromFile) {
		return sources.fromFile;
	}

	// Use defaults if requested
	if (sources.defaults) {
		return getLanguageMeta(locale);
	}

	// Final fallback
	return {
		code: locale,
		name: locale,
		englishName: locale,
		flag: '🌐',
		direction: 'ltr'
	};
}
