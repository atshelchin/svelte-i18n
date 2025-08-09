import type {
	I18nConfig,
	I18nInstance,
	TranslationSchema,
	InterpolationParams,
	LanguageMeta,
	TranslationFile
} from './types.js';
import {
	getNestedValue,
	interpolate,
	pluralize,
	validateSchema,
	detectBrowserLanguage as detectLang,
	mergeTranslations
} from './utils.js';
import { autoDiscoverTranslations } from './auto-discovery.js';
import { saveLocale, getInitialLocale } from './persistence.js';
import {
	formatNumber as fmtNumber,
	formatCurrency as fmtCurrency,
	formatDate as fmtDate,
	formatTime as fmtTime,
	formatRelativeTime as fmtRelativeTime,
	formatList as fmtList,
	FORMATS
} from './formatter.js';

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

class I18nStore implements I18nInstance {
	private config: I18nConfig;
	private translations = $state<Record<string, TranslationSchema>>({});
	private languageMeta = $state<Record<string, LanguageMeta>>({});
	private currentLocale = $state<string>('');
	private loading = $state<boolean>(false);
	private namespacePrefix: string;
	private validationErrors = $state<Record<string, string[]>>({});

	locale = $derived(this.currentLocale);
	locales = $derived(Object.keys(this.translations));
	isLoading = $derived(this.loading);
	errors = $derived(this.validationErrors);
	meta = $derived(this.languageMeta);

	constructor(config: I18nConfig) {
		this.config = config;
		this.namespacePrefix = config.namespace ? `${config.namespace}:` : '';

		// Get initial locale based on saved preference or browser detection
		this.currentLocale = getInitialLocale(config.defaultLocale);

		// Setup auto-discovery if enabled
		if (config.autoDiscovery && config.namespace) {
			this.setupAutoDiscovery();
		}
	}

	async setLocale(locale: string): Promise<void> {
		if (this.translations[locale]) {
			this.currentLocale = locale;
			// Persist the user's choice
			saveLocale(locale);
		} else {
			// Try auto-discovery before warning
			if (this.config.autoDiscovery && this.config.namespace) {
				const options =
					typeof this.config.autoDiscovery === 'object' ? this.config.autoDiscovery : {};

				const translations = await autoDiscoverTranslations(this.config.namespace, locale, options);

				if (translations) {
					await this.loadLanguage(locale, translations);
					this.currentLocale = locale;
					saveLocale(locale);
					return;
				}
			}

			console.warn(`Locale "${locale}" not loaded`);
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
			if (import.meta.env.DEV) {
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
					console.error(`❌ Translation validation failed for locale "${locale}":`, errors);

					// Show user-friendly error in development
					if (import.meta.env.DEV) {
						console.group(`Missing/Invalid translations in ${locale}:`);
						errors.forEach((error) => console.error(`  • ${error}`));
						console.groupEnd();
					}
				} else {
					// Clear errors if validation passes
					delete this.validationErrors[locale];
				}
			}

			// Merge with existing translations if namespace is used
			if (this.config.namespace && this.translations[locale]) {
				this.translations[locale] = mergeTranslations(this.translations[locale], translations);
			} else {
				this.translations[locale] = translations;
			}
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

	private async setupAutoDiscovery(): Promise<void> {
		if (!this.config.autoDiscovery || !this.config.namespace) return;

		const options = typeof this.config.autoDiscovery === 'object' ? this.config.autoDiscovery : {};

		// Auto-discover translations for common locales on initialization
		if (typeof window !== 'undefined') {
			const locales = options.locales || ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko'];
			for (const locale of locales) {
				try {
					const translations = await autoDiscoverTranslations(
						this.config.namespace,
						locale,
						options
					);
					if (translations) {
						await this.loadLanguage(locale, translations);
					}
				} catch {
					// Silent fail for auto-discovery
				}
			}
		}
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
}

let globalInstance: I18nStore | null = null;
const namespacedInstances = new Map<string, I18nStore>();

export function setupI18n(config: I18nConfig): I18nStore {
	// If this is a namespaced instance, create a separate instance for it
	if (config.namespace) {
		const existing = namespacedInstances.get(config.namespace);
		if (existing) {
			return existing;
		}
		const instance = new I18nStore(config);
		namespacedInstances.set(config.namespace, instance);
		return instance;
	}

	// For the global instance, reuse if it already exists
	// This prevents losing translations during client-side navigation
	if (globalInstance) {
		return globalInstance;
	}
	globalInstance = new I18nStore(config);
	return globalInstance;
}

export function getI18n(): I18nStore {
	if (!globalInstance) {
		throw new Error('i18n not initialized. Call setupI18n first.');
	}
	return globalInstance;
}
