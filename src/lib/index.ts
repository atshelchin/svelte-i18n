/**
 * Main export file for svelte-i18n with type safety
 * When the app generates types, this will provide full type safety
 */

// Import the core functionality
import {
	getI18n as getOriginalI18n,
	setupI18n as setupOriginalI18n
} from '$lib/application/stores/store.svelte.js';

export { type I18nStore } from '$lib/application/stores/store.svelte.js';
// Types are used below

// Direct re-export without modification
// Type safety will be provided by d.ts files in the app
export const getI18n = getOriginalI18n;
export const setupI18n = setupOriginalI18n;

// Re-export the interface for extension
export type { I18nInstance } from '$lib/domain/models/types.js';

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
} from '$lib/domain/models/types.js';

// Other exports
export {
	saveLocale,
	loadSavedLocale,
	clearSavedLocale,
	getInitialLocale
} from '$lib/services/persistence.js';

// Utility exports
export {
	validateSchema,
	detectBrowserLanguage,
	mergeTranslations
} from '$lib/utils/translation-utils.js';
export { getAppBasePath, buildAssetUrl } from '$lib/utils/base-path.js';

// Layout helper exports - unified from kit/load
export {
	// Main helper functions
	i18nServerLoad,
	i18nUniversalLoad,
	i18nClientInit,
	i18nIsReady,
	// Simplified layout helpers
	loadI18nSSR,
	loadI18nUniversal,
	setupI18nClient,
	initI18nOnMount
} from '$lib/kit/load.js';

// Auto-discovery exports
export {
	autoDiscoverTranslations,
	loadAutoDiscoveryConfig,
	getCachedAutoDiscoveryConfig,
	type AutoDiscoveryConfig,
	type AutoDiscoveryOptions
} from '$lib/services/discovery.js';

// App language helpers
export { getAppSupportedLanguages, isAppLanguageSupported } from '$lib/utils/app-languages.js';

// Language search utilities
export {
	fuzzySearchLanguages,
	getLanguageInfo,
	getAllLanguages,
	type LanguageInfo
} from '$lib/utils/language-search.js';

// Formatter exports
export {
	formatNumber,
	formatCurrency,
	formatDate,
	formatTime,
	formatRelativeTime,
	formatList,
	FORMATS
} from '$lib/services/formatter.js';

// Component exports
export { default as LanguageSwitcher } from '$lib/presentation/components/LanguageSwitcher.svelte';
export { default as ValidationPopup } from '$lib/presentation/components/ValidationPopup.svelte';

// Built-in loader exports
export {
	registerBuiltInTranslations,
	loadBuiltInTranslations,
	registerPackageTranslations,
	type TranslationRegistry
} from '$lib/services/loader.js';

// Translation utility exports
export {
	getAvailableLocales,
	getTranslation,
	getMergedTranslations,
	isLocaleAvailable,
	getNamespaces,
	getNamespaceLocales
} from '$lib/utils/translation-loader-utils.js';

// Typed wrapper exports
export {
	createTypedWrapper,
	validateTranslationKey,
	getTranslationKey,
	type TypedTranslate,
	type TypedI18nInstance
} from '$lib/application/services/typed-wrapper.js';

// Unified API for consistent usage in packages and apps
export {
	createI18n,
	getI18nInstance,
	initI18n,
	type UnifiedI18nConfig,
	type I18n
} from '$lib/unified.js';

// Type-safe unified API
export {
	createTypedUnifiedI18n,
	getTypedUnifiedI18n,
	initTypedI18n,
	type TypedUnifiedI18nInstance
} from '$lib/typed-unified.js';

// URL locale utilities
export { deLocalizeUrl } from '$lib/utils/url-locale.js';
export {
	extractLocaleFromPathname,
	extractSupportedLocaleFromPathname,
	getBestLocale,
	shouldUsePathnameLocale
} from '$lib/utils/pathname-locale.js';
