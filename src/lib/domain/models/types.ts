export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

export type TranslationValue = string | number | boolean | Date;
export type InterpolationParams = Record<string, TranslationValue>;

export interface TranslationSchema {
	[key: string]: string | TranslationSchema;
}

export interface LanguageMeta {
	code: string; // ISO 639-1 language code (e.g., "en", "zh")
	name: string; // Native name of the language (e.g., "English", "中文")
	englishName: string; // English name (e.g., "Chinese")
	direction: 'ltr' | 'rtl'; // Text direction
	flag?: string; // Optional flag emoji
}

export interface TranslationFile {
	_meta?: LanguageMeta;
	[key: string]: string | TranslationSchema | LanguageMeta | undefined;
}

export interface I18nConfig {
	defaultLocale: string;
	fallbackLocale?: string;
	namespace?: string;
	loadLocale?: (locale: string) => Promise<TranslationSchema>;
	missingKeyHandler?: (key: string, locale: string) => string;
	interpolation?: {
		prefix?: string;
		suffix?: string;
	};
	pluralization?: {
		rules?: Record<string, (count: number) => number>;
	};
	formats?: {
		date?: Intl.DateTimeFormatOptions;
		time?: Intl.DateTimeFormatOptions;
		number?: Intl.NumberFormatOptions;
		currency?: Intl.NumberFormatOptions;
	};
	/**
	 * Auto-discovery configuration for loading translations from static files
	 * When enabled, the i18n instance will automatically look for translation files
	 * in the application's static directory following naming conventions:
	 * - true: Enable with default settings
	 * - false: Disable auto-discovery
	 * - object: Custom configuration options
	 */
	autoDiscovery?:
		| boolean
		| {
				baseUrl?: string;
				patterns?: string[];
				locales?: string[];
				debug?: boolean;
		  };
}

export interface I18nInstance<TKeys extends string = string> {
	locale: string;
	locales: string[];
	isLoading: boolean;
	errors: Record<string, string[]>;
	meta: Record<string, LanguageMeta>;
	t: <K extends TKeys>(key: K, params?: InterpolationParams) => string;
	setLocale: (locale: string) => void;
	loadLanguage: (
		locale: string,
		source?: string | TranslationSchema | TranslationFile
	) => Promise<void>;
	validateTranslations: (locale: string, schema?: TranslationSchema) => boolean;
	formatDate: (date: Date | number | string, preset?: string) => string;
	formatTime: (date: Date | number | string, preset?: string) => string;
	formatNumber: (num: number, preset?: string) => string;
	formatCurrency: (num: number, currency?: string) => string;
	formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
	formatList: (items: string[], type?: 'conjunction' | 'disjunction' | 'unit') => string;
	detectBrowserLanguage: () => string | null;
	getNamespace: () => string | undefined;
	canShowValidationPopup: () => boolean;
	setActiveValidationPopup: (active: boolean) => void;
	getAllKeys?: () => TKeys[];
	clientLoad: (options?: Record<string, unknown>) => Promise<void>;
}

export type PathKeys<T> = T extends object
	? {
			[K in keyof T]: K extends string
				? T[K] extends object
					? K | `${K}.${PathKeys<T[K]>}`
					: K
				: never;
		}[keyof T]
	: never;

export type TypedTranslationFunction<T extends TranslationSchema> = (
	key: PathKeys<T>,
	params?: InterpolationParams
) => string;

// Extract all possible keys from a schema
export type ExtractKeys<T, P extends string = ''> = T extends object
	? {
			[K in keyof T]: K extends string
				? T[K] extends object
					? ExtractKeys<T[K], P extends '' ? K : `${P}.${K}`> | (P extends '' ? K : `${P}.${K}`)
					: P extends ''
						? K
						: `${P}.${K}`
				: never;
		}[keyof T]
	: never;
