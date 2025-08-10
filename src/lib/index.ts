/**
 * Main export file for svelte-i18n with type safety
 * When the app generates types, this will provide full type safety
 */

// Import the core functionality
import {
	getI18n as getOriginalI18n,
	setupI18n as setupOriginalI18n
} from './application/stores/store.svelte.js';

export { type I18nStore } from './application/stores/store.svelte.js';
// Types are used below

// Direct re-export without modification
// Type safety will be provided by d.ts files in the app
export const getI18n = getOriginalI18n;
export const setupI18n = setupOriginalI18n;

// Re-export the interface for extension
export type { I18nInstance } from './domain/models/types.js';

// Re-export other types
export type {
	I18nConfig,
	TranslationSchema,
	TranslationFile,
	LanguageMeta,
	InterpolationParams,
	PathKeys,
	TypedTranslationFunction,
	ExtractKeys
} from './domain/models/types.js';

// Other exports
export {
	saveLocale,
	loadSavedLocale,
	clearSavedLocale,
	getInitialLocale
} from './infrastructure/persistence/persistence.js';

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

// Typed wrapper exports
export {
	createTypedWrapper,
	validateTranslationKey,
	getTranslationKey,
	type TypedTranslate,
	type TypedI18nInstance
} from './application/services/typed-wrapper.js';

// Type-safe factory for creating typed i18n instances
export { createTypedI18n } from './typed-export.js';
