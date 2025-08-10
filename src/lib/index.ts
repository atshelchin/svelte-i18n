// Core exports
export { setupI18n, getI18n } from './application/stores/store.svelte.js';
export {
	saveLocale,
	loadSavedLocale,
	clearSavedLocale,
	getInitialLocale
} from './infrastructure/persistence/persistence.js';
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
} from './domain/models/types.js';

// Type-safe exports
export {
	createTypedI18n,
	createTypedI18nFromGenerated,
	type TypedI18nInstance,
	type ExtractParams,
	type GetKeyParams,
	type GeneratedTranslationTypes
} from './application/services/typed-i18n.js';

// Utility exports
export {
	validateSchema,
	detectBrowserLanguage,
	mergeTranslations
} from './domain/services/utils.js';
export { getAppBasePath, buildAssetUrl } from './infrastructure/loaders/base-path.js';

// Auto-discovery exports
export {
	autoDiscoverTranslations,
	loadAutoDiscoveryConfig,
	getCachedAutoDiscoveryConfig,
	type AutoDiscoveryConfig,
	type AutoDiscoveryOptions
} from './infrastructure/loaders/auto-discovery-v2.js';

// App language helpers
export {
	getAppSupportedLanguages,
	isAppLanguageSupported
} from './infrastructure/loaders/app-languages.js';

// Language search utilities
export {
	fuzzySearchLanguages,
	getLanguageInfo,
	getAllLanguages,
	type LanguageInfo
} from './infrastructure/utils/language-search.js';

// Formatter exports
export {
	formatNumber,
	formatCurrency,
	formatDate,
	formatTime,
	formatRelativeTime,
	formatList,
	FORMATS
} from './infrastructure/formatters/formatter.js';

// Component exports
export { default as Trans } from './presentation/components/Trans.svelte';
export { default as LanguageSwitcher } from './presentation/components/LanguageSwitcher.svelte';
export { default as ValidationStatus } from './presentation/components/ValidationStatus.svelte';
export { default as ValidationPopup } from './presentation/components/ValidationPopup.svelte';
export { default as TypeSafetyDemo } from './presentation/components/TypeSafetyDemo.svelte';
export { default as CodeExample } from './presentation/components/CodeExample.svelte';

// Built-in loader exports
export {
	registerBuiltInTranslations,
	loadBuiltInTranslations,
	registerPackageTranslations,
	type TranslationRegistry
} from './infrastructure/loaders/built-in.js';

// Translation utility exports
export {
	getAvailableLocales,
	getTranslation,
	getMergedTranslations,
	isLocaleAvailable,
	getNamespaces,
	getNamespaceLocales
} from './infrastructure/loaders/translation-utils.js';
