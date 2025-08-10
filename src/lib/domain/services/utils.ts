import type { TranslationSchema, InterpolationParams, I18nConfig } from '../models/types.js';

export function getNestedValue(obj: unknown, path: string): unknown {
	const result = path
		.split('.')
		.reduce((current, key) => (current as Record<string, unknown>)?.[key], obj);
	return result === undefined ? null : result;
}

export function interpolate(
	template: string,
	params: InterpolationParams = {},
	config: I18nConfig['interpolation'] = {}
): string {
	const prefix = config?.prefix || '{';
	const suffix = config?.suffix || '}';
	const regex = new RegExp(
		`${escapeRegex(prefix)}([^${escapeRegex(suffix)}]+)${escapeRegex(suffix)}`,
		'g'
	);

	return template.replace(regex, (match, key) => {
		const value = params[key.trim()];
		return value !== undefined ? String(value) : match;
	});
}

export function pluralize(
	template: string,
	count: number,
	locale: string = 'en',
	rules?: Record<string, (count: number) => number>
): string {
	const parts = template.split('|').map((s) => s.trim());
	if (parts.length === 1) return parts[0];

	const pluralRule = rules?.[locale] || defaultPluralRule;
	const index = Math.min(pluralRule(count), parts.length - 1);

	return parts[index] || parts[parts.length - 1];
}

function defaultPluralRule(count: number): number {
	if (count === 0) return 0;
	if (count === 1) return 0;
	return 1;
}

function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function validateSchema(
	translations: unknown,
	schema: TranslationSchema,
	path: string = ''
): string[] {
	const errors: string[] = [];

	for (const key in schema) {
		const fullPath = path ? `${path}.${key}` : key;
		const schemaValue = schema[key];
		const translationValue = (translations as Record<string, unknown>)?.[key];

		if (translationValue === undefined) {
			errors.push(`Missing translation: ${fullPath}`);
		} else if (typeof schemaValue === 'object' && !Array.isArray(schemaValue)) {
			if (typeof translationValue !== 'object') {
				errors.push(
					`Type mismatch at ${fullPath}: expected object, got ${typeof translationValue}`
				);
			} else {
				errors.push(...validateSchema(translationValue, schemaValue, fullPath));
			}
		} else if (typeof schemaValue === 'string' && typeof translationValue !== 'string') {
			errors.push(`Type mismatch at ${fullPath}: expected string, got ${typeof translationValue}`);
		}
	}

	return errors;
}

export function detectBrowserLanguage(): string | null {
	if (typeof window === 'undefined' && typeof global === 'undefined') return null;

	const nav = (
		typeof window !== 'undefined'
			? window.navigator
			: (global as Record<string, unknown>)?.navigator
	) as Navigator & {
		userLanguage?: string;
		browserLanguage?: string;
		systemLanguage?: string;
	};

	if (!nav) return null;

	// Check navigator.languages first (preferred)
	if (nav.languages && nav.languages.length > 0) {
		return nav.languages[0].split('-')[0];
	}

	const language = nav.language || nav.userLanguage || nav.browserLanguage || nav.systemLanguage;

	if (language) {
		return language.split('-')[0];
	}

	return null;
}

export function mergeTranslations(
	base: TranslationSchema,
	override: TranslationSchema
): TranslationSchema {
	const result = { ...base };

	for (const key in override) {
		const overrideValue = override[key];
		const baseValue = base[key];

		if (
			typeof overrideValue === 'object' &&
			typeof baseValue === 'object' &&
			!Array.isArray(overrideValue) &&
			!Array.isArray(baseValue)
		) {
			result[key] = mergeTranslations(baseValue, overrideValue);
		} else {
			result[key] = overrideValue;
		}
	}

	return result;
}
