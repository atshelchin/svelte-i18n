// Core exports
export { setupI18n, getI18n } from './store.svelte.js';
export { autoLoadLanguages, watchLanguages } from './auto-loader.js';
export { saveLocale, loadSavedLocale, clearSavedLocale, getInitialLocale } from './persistence.js';
export type {
	I18nConfig,
	I18nInstance,
	TranslationSchema,
	TranslationFile,
	LanguageMeta,
	InterpolationParams,
	PathKeys,
	TypedTranslationFunction,
	ExtractKeys
} from './types.js';

// Type-safe exports
export {
	createTypedI18n,
	createTypedI18nFromGenerated,
	type TypedI18nInstance,
	type ExtractParams,
	type GetKeyParams,
	type GeneratedTranslationTypes
} from './typed-i18n.js';

// Utility exports
export { validateSchema, detectBrowserLanguage, mergeTranslations } from './utils.js';
export { getAppBasePath, buildAssetUrl } from './base-path.js';

// Auto-discovery exports
export {
	autoDiscoverTranslations,
	autoDiscoverAllTranslations,
	withAutoDiscovery,
	createAutoDiscoveryEffect,
	type AutoDiscoveryOptions
} from './auto-discovery.js';

// Formatter exports
export {
	formatNumber,
	formatCurrency,
	formatDate,
	formatTime,
	formatRelativeTime,
	formatList,
	FORMATS
} from './formatter.js';

// Component exports
export { default as Trans } from './components/Trans.svelte';
export { default as LanguageSwitcher } from './components/LanguageSwitcher.svelte';
export { default as ValidationStatus } from './components/ValidationStatus.svelte';
export { default as ValidationPopup } from './components/ValidationPopup.svelte';
export { default as TypeSafetyDemo } from './components/TypeSafetyDemo.svelte';
export { default as CodeExample } from './components/CodeExample.svelte';
