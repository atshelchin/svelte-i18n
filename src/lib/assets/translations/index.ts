/**
 * Built-in translations for @shelchin/svelte-i18n package
 * These translations are bundled with the package and available without any configuration
 */

import en from '../../../translations/@shelchin/svelte-i18n/en.json' with { type: 'json' };
import zh from '../../../translations/@shelchin/svelte-i18n/zh.json' with { type: 'json' };

// Export translations as a map
export const builtInTranslations = {
	en,
	zh
} as const;

// Export individual translations for tree-shaking
export { default as translationEn } from '../../../translations/@shelchin/svelte-i18n/en.json' with { type: 'json' };
export { default as translationZh } from '../../../translations/@shelchin/svelte-i18n/zh.json' with { type: 'json' };

/**
 * Get all available built-in locales
 */
export function getBuiltInLocales(): string[] {
	return Object.keys(builtInTranslations);
}

/**
 * Get built-in translation for a specific locale
 */
export function getBuiltInTranslation(locale: string) {
	return builtInTranslations[locale as keyof typeof builtInTranslations];
}
