/**
 * I18n metadata for @shelchin/svelte-i18n package
 * This allows consuming applications to discover and validate our translations
 */

// Export metadata about this library's i18n
export const I18N_META = {
	namespace: '@shelchin/svelte-i18n',
	defaultLocale: 'en',
	typesPath: './i18n-types',
	translationsPath: 'src/translations/@shelchin/svelte-i18n'
};

// Re-export generated types
export type { I18nPath, I18nKeys, I18N_PATHS } from './types/library-i18n-generated.js';
