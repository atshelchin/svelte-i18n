// Core exports
export { setupI18n, getI18n } from './application/stores/store.svelte.js';
export { autoLoadLanguages, watchLanguages } from './infrastructure/loaders/auto-loader.js';
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
	autoDiscoverAllTranslations,
	withAutoDiscovery,
	createAutoDiscoveryEffect,
	type AutoDiscoveryOptions
} from './infrastructure/loaders/auto-discovery.js';

export { fuzzySearchLanguages, type LanguageInfo } from './infrastructure/loaders/languages.js';

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

// Built-in translations exports
export {
	builtInTranslations,
	getBuiltInLocales,
	getBuiltInTranslation
} from './assets/translations/index.js';
