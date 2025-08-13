import { DEV } from '../../utils/env.js';
import { SvelteMap } from 'svelte/reactivity';
import type {
	I18nConfig,
	I18nInstance,
	TranslationSchema,
	InterpolationParams,
	LanguageMeta,
	TranslationFile
} from '../../domain/models/types.js';
import {
	getNestedValue,
	interpolate,
	pluralize,
	validateSchema,
	detectBrowserLanguage as detectLang,
	mergeTranslations
} from '../../domain/services/utils.js';
import { autoDiscoverTranslations as autoDiscoverV2 } from '../../infrastructure/loaders/auto-discovery-v2.js';
import {
	loadBuiltInTranslations,
	loadBuiltInTranslationsSync
} from '../../infrastructure/loaders/built-in.js';
// Universal persistence is used instead
// import { saveLocale, getInitialLocale } from '../../infrastructure/persistence/persistence.js';
import {
	saveLocaleUniversal,
	getInitialLocaleUniversal
} from '../../infrastructure/persistence/universal-persistence.js';
import {
	formatNumber as fmtNumber,
	formatCurrency as fmtCurrency,
	formatDate as fmtDate,
	formatTime as fmtTime,
	formatRelativeTime as fmtRelativeTime,
	formatList as fmtList,
	FORMATS
} from '../../infrastructure/formatters/formatter.js';

// Simple validation popup controller to prevent multiple popups
class ValidationPopupController {
	private activePopup: string | null = null;

	canShowPopup(namespace: string): boolean {
		return this.activePopup === null || this.activePopup === namespace;
	}

	setActivePopup(namespace: string | null): void {
		this.activePopup = namespace;
	}
}

const validationPopupController = new ValidationPopupController();

export class I18nStore implements I18nInstance {
	private config: I18nConfig;
	private translations = $state<Record<string, TranslationSchema>>({});
	private languageMeta = $state<Record<string, LanguageMeta>>({});
	private currentLocale = $state<string>('');
	private loading = $state<boolean>(false);
	private namespacePrefix: string;
	private validationErrors = $state<Record<string, string[]>>({});
	// Store available locales as a reactive array
	private availableLocales = $state<string[]>([]);

	// On server-side, $derived doesn't work, so we need getters
	get locale() {
		return this.currentLocale;
	}

	get locales() {
		return this.availableLocales;
	}

	get isLoading() {
		return this.loading;
	}

	get errors() {
		return this.validationErrors;
	}

	get meta() {
		return this.languageMeta;
	}

	constructor(config: I18nConfig) {
		this.config = config;
		this.namespacePrefix = config.namespace ? `${config.namespace}:` : '';

		// For SSR, locale should be set via serverLoad or clientLoad
		// Set default locale initially
		this.currentLocale = config.defaultLocale;

		// Load registered translations immediately for SSR
		// This ensures translations are available during server-side rendering
		this.loadRegisteredTranslations();

		// Note: Auto-discovery is now handled in clientLoad() to avoid duplicate calls
		// Don't call setupAutoDiscovery here anymore
	}

	/**
	 * Set locale synchronously without persistence (for initial hydration)
	 */
	setLocaleSync(locale: string): void {
		if (this.translations[locale]) {
			this.currentLocale = locale;
		}
	}

	async setLocale(locale: string): Promise<void> {
		console.log(`[setLocale] Attempting to set locale to: ${locale}`);
		console.log(`[setLocale] Available translations:`, Object.keys(this.translations));
		console.log(`[setLocale] Available locales:`, this.availableLocales);

		if (this.translations[locale]) {
			this.currentLocale = locale;
			// Persist to both cookie and localStorage
			saveLocaleUniversal(locale, {
				cookieName: this.config.cookieName,
				storageKey: this.config.storageKey
			});
			console.log(`[setLocale] Successfully set locale to: ${locale}`);
		} else {
			// Try to load the language if it's in availableLocales but not yet loaded
			if (this.availableLocales.includes(locale)) {
				console.log(
					`[setLocale] Locale ${locale} is available but not loaded, attempting to load...`
				);
				try {
					// Determine the source URL for auto-discovered languages
					let source: string | undefined;
					if (typeof window !== 'undefined') {
						// Check if this is an auto-discovered language
						// In SvelteKit, static files are served from the root, not /static
						const basePath = window.location.origin;
						const namespace = this.config.namespace || 'app';
						// Static files in SvelteKit are served without the /static prefix
						const translationsPath = `/translations/${namespace}/${locale}.json`;
						source = `${basePath}${translationsPath}`;
						console.log(`[setLocale] Attempting to load from: ${source}`);
					}
					
					await this.loadLanguage(locale, source);
					this.currentLocale = locale;
					saveLocaleUniversal(locale, {
						cookieName: this.config.cookieName,
						storageKey: this.config.storageKey
					});
					console.log(`[setLocale] Successfully loaded and set locale to: ${locale}`);
				} catch (error) {
					console.error(`[setLocale] Failed to load locale ${locale}:`, error);
				}
			} else {
				// Don't try auto-discovery here - it should be done once in clientLoad
				// This prevents duplicate requests when switching languages
				console.warn(
					`Locale "${locale}" not loaded and not available. Please ensure it's loaded via clientLoad() or loadLanguage()`
				);
			}
		}
	}

	t = (key: string, params?: InterpolationParams): string => {
		// Handle namespaced keys
		let actualKey = key;
		if (this.config.namespace) {
			// If key already has namespace prefix, use it as is
			if (key.startsWith(this.namespacePrefix)) {
				actualKey = key.substring(this.namespacePrefix.length);
			}
			// Otherwise, treat it as a local key
		}

		// Check if translations exist for current locale first
		const currentTranslations = this.translations[this.currentLocale];
		let value = currentTranslations
			? (getNestedValue(currentTranslations, actualKey) as string | null)
			: null;

		if ((value === null || value === undefined) && this.config.fallbackLocale) {
			const fallbackTranslations = this.translations[this.config.fallbackLocale];
			value = fallbackTranslations
				? (getNestedValue(fallbackTranslations, actualKey) as string | null)
				: null;
		}

		if (value === null || value === undefined) {
			if (this.config.missingKeyHandler) {
				return this.config.missingKeyHandler(key, this.currentLocale);
			}
			if (DEV) {
				console.warn(`Missing translation: ${key} in locale: ${this.currentLocale}`);
			}
			return key;
		}

		if (typeof value !== 'string') {
			console.warn(`Translation value for ${key} is not a string`);
			return key;
		}

		// Handle pluralization
		if (params?.count !== undefined) {
			value = pluralize(
				value,
				params.count as number,
				this.currentLocale,
				this.config.pluralization?.rules
			);
		}

		// Handle interpolation
		if (params) {
			value = interpolate(value, params, this.config.interpolation);
		}

		return value as string;
	};

	/**
	 * Load translations synchronously (for built-in translations)
	 * This is used to prevent flash during hydration
	 */
	loadLanguageSync(locale: string, translations: TranslationSchema | TranslationFile): void {
		// Extract metadata if present
		let translationData: TranslationSchema;
		if (
			'_meta' in translations &&
			typeof translations._meta === 'object' &&
			translations._meta !== null
		) {
			this.languageMeta[locale] = translations._meta as unknown as LanguageMeta;
			// Remove _meta from translations
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { _meta, ...rest } = translations;
			translationData = rest as TranslationSchema;
		} else {
			translationData = translations as TranslationSchema;
		}

		// Validate translations against the default locale schema
		if (this.translations[this.config.defaultLocale] && locale !== this.config.defaultLocale) {
			const errors = validateSchema(translationData, this.translations[this.config.defaultLocale]);
			if (errors.length > 0) {
				this.validationErrors[locale] = errors;

				// Show user-friendly error in development
				// Always show validation errors for debugging
				const namespace = this.config.namespace || 'app';
				console.error(
					`❌ Translation validation failed for ${namespace} in locale "${locale}":`,
					errors
				);
				console.group(`Missing/Invalid translations in ${namespace} for locale "${locale}":`);
				errors.forEach((error) => console.error(`  • ${error}`));
				console.groupEnd();
			} else {
				// Clear errors if validation passes
				delete this.validationErrors[locale];
			}
		}

		this.translations[locale] = translationData;
		// Add locale to available locales if not already present
		if (!this.availableLocales.includes(locale)) {
			this.availableLocales.push(locale);
		}
	}

	async loadLanguage(
		locale: string,
		source?: string | TranslationSchema | TranslationFile
	): Promise<void> {
		this.loading = true;

		try {
			let data: TranslationFile | TranslationSchema;

			if (typeof source === 'string') {
				// Load from URL
				const response = await fetch(source);
				if (!response.ok) {
					throw new Error(`Failed to load translations from ${source}`);
				}
				data = await response.json();
			} else if (source) {
				// Use provided translations
				data = source;
			} else if (this.config.loadLocale) {
				// Use configured loader
				data = await this.config.loadLocale(locale);
			} else {
				throw new Error(`No source provided for locale ${locale}`);
			}

			// Extract metadata if present
			let translations: TranslationSchema;
			if ('_meta' in data && typeof data._meta === 'object' && data._meta !== null) {
				this.languageMeta[locale] = data._meta as LanguageMeta;
				// Remove _meta from translations
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { _meta, ...rest } = data;
				translations = rest as TranslationSchema;
			} else {
				translations = data as TranslationSchema;
			}

			// Always validate translations against the default locale schema
			if (this.translations[this.config.defaultLocale] && locale !== this.config.defaultLocale) {
				const errors = validateSchema(translations, this.translations[this.config.defaultLocale]);
				if (errors.length > 0) {
					this.validationErrors[locale] = errors;

					// Show user-friendly error in development
					// Always show validation errors for debugging
					const namespace = this.config.namespace || 'app';
					console.error(
						`❌ Translation validation failed for ${namespace} in locale "${locale}":`,
						errors
					);
					console.group(`Missing/Invalid translations in ${namespace} for locale "${locale}":`);
					errors.forEach((error) => console.error(`  • ${error}`));
					console.groupEnd();
				} else {
					// Clear errors if validation passes
					delete this.validationErrors[locale];
				}
			}

			// Merge with existing translations to allow overriding
			// This ensures auto-discovered translations can override built-in ones
			if (this.translations[locale]) {
				console.log(`[loadLanguage] Merging translations for ${locale}`);
				this.translations[locale] = mergeTranslations(this.translations[locale], translations);
			} else {
				console.log(`[loadLanguage] Adding new translations for ${locale}`);
				this.translations[locale] = translations;
				// Add locale to available locales if not already present
				if (!this.availableLocales.includes(locale)) {
					console.log(`[loadLanguage] Adding ${locale} to availableLocales`);
					this.availableLocales.push(locale);
				}
			}
			console.log(`[loadLanguage] After loading ${locale}, translations keys:`, Object.keys(this.translations));
			console.log(`[loadLanguage] After loading ${locale}, availableLocales:`, this.availableLocales);
		} catch (error) {
			console.error(`Failed to load language ${locale}:`, error);
			throw error;
		} finally {
			this.loading = false;
		}
	}

	validateTranslations(locale: string, schema?: TranslationSchema): boolean {
		const translations = this.translations[locale];
		if (!translations) {
			console.error(`No translations loaded for locale ${locale}`);
			return false;
		}

		const baseSchema = schema || this.translations[this.config.defaultLocale];
		if (!baseSchema) {
			console.error('No schema available for validation');
			return false;
		}

		const errors = validateSchema(translations, baseSchema);
		if (errors.length > 0) {
			console.error(`Validation errors for ${locale}:`, errors);
			return false;
		}

		return true;
	}

	formatDate(date: Date | number | string, preset?: string): string {
		const options =
			preset && preset in FORMATS.date
				? FORMATS.date[preset as keyof typeof FORMATS.date]
				: this.config.formats?.date;
		return fmtDate(date, this.currentLocale, options);
	}

	formatTime(date: Date | number | string, preset?: string): string {
		const options =
			preset && preset in FORMATS.time
				? FORMATS.time[preset as keyof typeof FORMATS.time]
				: this.config.formats?.time;
		return fmtTime(date, this.currentLocale, options);
	}

	formatNumber(num: number, preset?: string): string {
		const options =
			preset && preset in FORMATS.number
				? FORMATS.number[preset as keyof typeof FORMATS.number]
				: this.config.formats?.number;
		return fmtNumber(num, this.currentLocale, options);
	}

	formatCurrency(num: number, currency?: string): string {
		return fmtCurrency(num, this.currentLocale, currency, this.config.formats?.currency);
	}

	formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
		return fmtRelativeTime(value, unit, this.currentLocale);
	}

	formatList(items: string[], type?: 'conjunction' | 'disjunction' | 'unit'): string {
		return fmtList(items, this.currentLocale, type);
	}

	detectBrowserLanguage(): string | null {
		return detectLang();
	}

	getNamespace(): string | undefined {
		return this.config.namespace;
	}

	canShowValidationPopup(): boolean {
		if (!this.config.namespace) return true;
		return validationPopupController.canShowPopup(this.config.namespace);
	}

	setActiveValidationPopup(active: boolean): void {
		if (this.config.namespace) {
			validationPopupController.setActivePopup(active ? this.config.namespace : null);
		}
	}

	/**
	 * Server-side method to load translations and determine best locale
	 * This method is for SSR and should be called in +layout.server.ts
	 *
	 * @param cookies SvelteKit cookies object
	 * @returns The best locale to use based on cookie and available translations
	 */
	async serverLoad(cookies: any): Promise<string> {
		// Load translations if not already loaded
		if (this.locales.length === 0) {
			// Wait for translations to be loaded
			// In SSR, translations should be loaded synchronously in i18n.ts
			await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay to ensure translations are loaded

			// If still no translations, try loading built-in ones
			if (this.locales.length === 0) {
				try {
					await loadBuiltInTranslations(this, {
						onLoaded: (locale) => console.log(`✓ Loaded built-in ${locale}`),
						onError: (locale) => console.warn(`No built-in translations for ${locale}`)
					});
				} catch (error) {
					console.warn('Failed to load built-in translations:', error);
				}
			}
		}

		// Get actually available locales (built-in translations that are truly loaded)
		const actuallyAvailable = this.locales;

		// In SSR, also check static/translations/index.json for declared locales
		// But we need to verify they actually exist
		const declaredLocales: string[] = [];
		if (typeof window === 'undefined') {
			try {
				// Try to read index.json to see what locales are declared
				const { existsSync, readFileSync } = await import('fs');
				const { join } = await import('path');

				const indexPath = join(process.cwd(), 'static/translations/index.json');
				if (existsSync(indexPath)) {
					const indexContent = JSON.parse(readFileSync(indexPath, 'utf-8'));
					const namespace = this.config.namespace || 'app';

					if (namespace === 'app' && indexContent.autoDiscovery?.app) {
						// For app namespace, check if declared locales actually have files
						for (const locale of indexContent.autoDiscovery.app) {
							const localePath = join(process.cwd(), `static/translations/app/${locale}.json`);
							if (existsSync(localePath)) {
								declaredLocales.push(locale);
							} else {
								console.warn(
									`[SSR] Declared locale '${locale}' in index.json but file not found: app/${locale}.json`
								);
							}
						}
					} else if (indexContent.autoDiscovery?.packages?.[namespace]) {
						const { existsSync } = await import('fs');
						const { join } = await import('path');
						// For package namespace, check files
						for (const locale of indexContent.autoDiscovery.packages[namespace]) {
							const localePath = join(
								process.cwd(),
								`static/translations/${namespace}/${locale}.json`
							);
							if (existsSync(localePath)) {
								declaredLocales.push(locale);
							} else {
								console.warn(
									`[SSR] Declared locale '${locale}' in index.json but file not found: ${namespace}/${locale}.json`
								);
							}
						}
					}
				}
			} catch (error) {
				console.warn('[SSR] Could not check static translations:', error);
			}
		}

		// Combine actually available (built-in) and declared (static) locales
		// Use array deduplication without Set to avoid svelte reactivity warnings
		const allAvailableLocales = [...actuallyAvailable, ...declaredLocales].filter(
			(locale, index, arr) => arr.indexOf(locale) === index
		);

		// Load discovered locales for SSR
		// This ensures translations are available for server-side rendering
		if (declaredLocales.length > 0 && typeof window === 'undefined') {
			const { existsSync, readFileSync } = await import('fs');
			const { join } = await import('path');
			const namespace = this.config.namespace || 'app';
			for (const locale of declaredLocales) {
				// Load the actual translations for SSR if not already loaded
				if (!this.translations[locale]) {
					try {
						const localePath = join(
							process.cwd(),
							`static/translations/${namespace === 'app' ? 'app' : namespace}/${locale}.json`
						);
						if (existsSync(localePath)) {
							const translationData = JSON.parse(readFileSync(localePath, 'utf-8'));
							// Load translations synchronously for SSR
							// This will also add the locale to availableLocales
							this.loadLanguageSync(locale, translationData);
							console.log(`[SSR] Loaded auto-discovered translations for ${locale}`);
						}
					} catch (error) {
						console.warn(`[SSR] Failed to load translations for ${locale}:`, error);
						// Even if loading fails, add to available locales so client can try
						if (!this.availableLocales.includes(locale)) {
							this.availableLocales = [...this.availableLocales, locale];
						}
					}
				}
			}
		}

		// Get locale from cookie
		const cookieName = this.config.cookieName || 'i18n-locale';
		const cookieLocale = cookies?.get ? cookies.get(cookieName) : undefined;

		console.log(
			'[SSR] serverLoad - cookies object:',
			!!cookies,
			'cookieName:',
			cookieName,
			'cookieLocale:',
			cookieLocale
		);

		// Determine the best locale to use
		let bestLocale = this.config.defaultLocale;

		if (cookieLocale && allAvailableLocales.includes(cookieLocale)) {
			// Use cookie locale if it's available (either built-in or static)
			bestLocale = cookieLocale;
		} else if (allAvailableLocales.includes(this.config.defaultLocale)) {
			// Use default locale if available
			bestLocale = this.config.defaultLocale;
		} else if (allAvailableLocales.length > 0) {
			// Fallback to first available locale
			bestLocale = allAvailableLocales[0];
		}

		// Force set the locale
		this.currentLocale = bestLocale;

		return bestLocale;
	}

	/**
	 * Load registered translations synchronously (for SSR)
	 * This ensures translations are available during server-side rendering
	 */
	private loadRegisteredTranslations(): void {
		// Load built-in translations synchronously for SSR
		loadBuiltInTranslationsSync(this);
	}

	/**
	 * Client-side method to automatically load all available languages
	 * This method handles:
	 * - Checking if languages are already loaded
	 * - Loading all available languages
	 * - Setting fallback locale if needed
	 *
	 * @param options Optional configuration for loading
	 * @returns Promise that resolves when loading is complete
	 */
	async clientLoad(options?: { initialLocale?: string }): Promise<void> {
		console.log('[clientLoad] Starting client load...');
		console.log('[clientLoad] Current locales:', this.locales);
		console.log('[clientLoad] Namespace:', this.config.namespace);
		
		// Step 1: Load built-in translations if not already loaded
		if (this.locales.length === 0) {
			console.log('[clientLoad] Loading built-in translations...');
			try {
				await loadBuiltInTranslations(this, {
					onLoaded: (locale) => console.log(`✓ Loaded built-in ${locale}`),
					onError: (locale) => console.warn(`No built-in translations for ${locale}`)
				});
			} catch (error) {
				console.warn('Failed to load built-in translations:', error);
			}
		} else {
			console.log('[clientLoad] Built-in translations already loaded');
		}

		// Step 2: ALWAYS try auto-discovery system (based on index.json configuration)
		// This is important because auto-discovered translations can add new locales
		// or override existing built-in translations
		console.log('[clientLoad] Starting auto-discovery...');
		try {
			await autoDiscoverV2(this, {
				namespace: this.config.namespace,
				onLoaded: (target, locale) => {
					console.log(`✓ Auto-discovered ${locale} for ${target}`);
				},
				onError: (target, locale, error) => {
					console.error(`Failed to auto-discover ${locale} for ${target}:`, error);
				}
			});
		} catch (error) {
			console.error('Auto-discovery error:', error);
		}

		// Use provided initial locale or get from cookies/localStorage
		const clientLocale =
			options?.initialLocale ||
			getInitialLocaleUniversal(
				this.config.defaultLocale,
				typeof document !== 'undefined' ? document.cookie : undefined,
				{
					cookieName: this.config.cookieName,
					storageKey: this.config.storageKey
				}
			);

		// Set locale if available, otherwise fallback
		if (this.locales.includes(clientLocale)) {
			this.currentLocale = clientLocale;
		} else if (!this.locales.includes(this.currentLocale)) {
			const fallbackLocale = this.locales[0] || 'en';
			await this.setLocale(fallbackLocale);
		}
	}
}

let globalInstance: I18nStore | null = null;
const namespacedInstances = new SvelteMap<string, I18nStore>();
// Store main app config for inheritance
let mainAppConfig: I18nConfig | null = null;

// Make instances globally accessible for library components
if (typeof globalThis !== 'undefined') {
	(globalThis as any).__i18n_instances = namespacedInstances;
}

export function setupI18n(config: I18nConfig): I18nInstance {
	// If this is a namespaced instance, create a separate instance for it
	if (config.namespace) {
		const existing = namespacedInstances.get(config.namespace);
		if (existing) {
			return existing;
		}

		// Inherit configuration from main app if available
		let effectiveConfig = config;
		if (mainAppConfig) {
			effectiveConfig = {
				...config,
				// Inherit locale settings from main app
				defaultLocale: mainAppConfig.defaultLocale,
				fallbackLocale: mainAppConfig.fallbackLocale,
				// Inherit formatting and interpolation settings
				interpolation: config.interpolation || mainAppConfig.interpolation,
				formats: config.formats || mainAppConfig.formats,
				pluralization: config.pluralization || mainAppConfig.pluralization,
				// Keep the package's namespace
				namespace: config.namespace
			};
		}

		const instance = new I18nStore(effectiveConfig);
		namespacedInstances.set(config.namespace, instance);
		return instance;
	}

	// For the global instance, reuse if it already exists
	// This prevents losing translations during client-side navigation
	if (globalInstance) {
		return globalInstance;
	}

	// Store as main app config for inheritance
	mainAppConfig = config;
	globalInstance = new I18nStore(config);

	// Also store the global instance in namespacedInstances with 'app' key
	// This allows library components to access it via __i18n_instances
	if (config.namespace === 'app') {
		namespacedInstances.set('app', globalInstance);
	}

	return globalInstance;
}

export function getI18n(namespace?: string): I18nInstance {
	// If namespace is provided, get the namespaced instance
	if (namespace) {
		const instance = namespacedInstances.get(namespace);
		if (!instance) {
			throw new Error(
				`i18n instance for namespace "${namespace}" not found. Call setupI18n with this namespace first.`
			);
		}
		return instance;
	}

	// Otherwise, return the global instance
	if (!globalInstance) {
		throw new Error('i18n not initialized. Call setupI18n first.');
	}
	return globalInstance;
}

// Test utility to reset global state
export function resetI18nForTesting(): void {
	globalInstance = null;
	namespacedInstances.clear();
}
