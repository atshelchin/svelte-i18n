/**
 * Unified formatter using native Intl API
 * Supports all major locales with minimal code
 */

// Cache formatters for performance
const formatterCache = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat>();

function getCacheKey(locale: string, type: string, options?: unknown): string {
	return `${locale}:${type}:${JSON.stringify(options || {})}`;
}

/**
 * Format numbers with locale-specific rules
 */
export function formatNumber(
	value: number,
	locale: string,
	options?: Intl.NumberFormatOptions
): string {
	const cacheKey = getCacheKey(locale, 'number', options);

	let formatter = formatterCache.get(cacheKey) as Intl.NumberFormat;
	if (!formatter) {
		formatter = new Intl.NumberFormat(locale, options);
		formatterCache.set(cacheKey, formatter);
	}

	return formatter.format(value);
}

/**
 * Format currency with locale-specific rules
 */
export function formatCurrency(
	value: number,
	locale: string,
	currency?: string,
	options?: Intl.NumberFormatOptions
): string {
	// Auto-detect currency based on locale if not provided
	const currencyCode = currency || getCurrencyForLocale(locale);

	return formatNumber(value, locale, {
		style: 'currency',
		currency: currencyCode,
		...options
	});
}

/**
 * Format dates with locale-specific rules
 */
export function formatDate(
	date: Date | number | string,
	locale: string,
	options?: Intl.DateTimeFormatOptions
): string {
	const cacheKey = getCacheKey(locale, 'date', options);

	let formatter = formatterCache.get(cacheKey) as Intl.DateTimeFormat;
	if (!formatter) {
		formatter = new Intl.DateTimeFormat(locale, options);
		formatterCache.set(cacheKey, formatter);
	}

	const dateObj = date instanceof Date ? date : new Date(date);
	return formatter.format(dateObj);
}

/**
 * Format time with locale-specific rules
 */
export function formatTime(
	date: Date | number | string,
	locale: string,
	options?: Intl.DateTimeFormatOptions
): string {
	// Don't mix timeStyle with specific time component options
	const defaultOptions: Intl.DateTimeFormatOptions = options?.timeStyle
		? { timeStyle: options.timeStyle }
		: { hour: 'numeric', minute: 'numeric' };

	return formatDate(date, locale, {
		...defaultOptions,
		...options
	});
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(
	value: number,
	unit: Intl.RelativeTimeFormatUnit,
	locale: string,
	options?: Intl.RelativeTimeFormatOptions
): string {
	const formatter = new Intl.RelativeTimeFormat(locale, options);
	return formatter.format(value, unit);
}

/**
 * Format lists (e.g., "A, B, and C")
 */
export function formatList(
	items: string[],
	locale: string,
	type: 'conjunction' | 'disjunction' | 'unit' = 'conjunction'
): string {
	const formatter = new Intl.ListFormat(locale, { type });
	return formatter.format(items);
}

/**
 * Get default currency for common locales
 */
function getCurrencyForLocale(locale: string): string {
	const currencyMap: Record<string, string> = {
		// Major population countries (>10M people)
		'en-US': 'USD',
		'en-GB': 'GBP',
		'en-CA': 'CAD',
		'en-AU': 'AUD',
		'en-IN': 'INR',
		'zh-CN': 'CNY',
		'zh-TW': 'TWD',
		'zh-HK': 'HKD',
		ja: 'JPY',
		'ja-JP': 'JPY',
		de: 'EUR',
		'de-DE': 'EUR',
		fr: 'EUR',
		'fr-FR': 'EUR',
		es: 'EUR',
		'es-ES': 'EUR',
		'es-MX': 'MXN',
		'es-AR': 'ARS',
		'es-CO': 'COP',
		pt: 'EUR',
		'pt-BR': 'BRL',
		'pt-PT': 'EUR',
		ru: 'RUB',
		'ru-RU': 'RUB',
		ar: 'SAR',
		'ar-SA': 'SAR',
		'ar-EG': 'EGP',
		'ar-AE': 'AED',
		'hi-IN': 'INR',
		'bn-BD': 'BDT',
		'pa-IN': 'INR',
		'ur-PK': 'PKR',
		id: 'IDR',
		'id-ID': 'IDR',
		vi: 'VND',
		'vi-VN': 'VND',
		th: 'THB',
		'th-TH': 'THB',
		ko: 'KRW',
		'ko-KR': 'KRW',
		tr: 'TRY',
		'tr-TR': 'TRY',
		it: 'EUR',
		'it-IT': 'EUR',
		pl: 'PLN',
		'pl-PL': 'PLN',
		uk: 'UAH',
		'uk-UA': 'UAH',
		nl: 'EUR',
		'nl-NL': 'EUR',
		'fa-IR': 'IRR',
		'ms-MY': 'MYR',
		'fil-PH': 'PHP',
		'ta-IN': 'INR',
		'te-IN': 'INR',
		'mr-IN': 'INR',
		'gu-IN': 'INR',
		'kn-IN': 'INR',
		'or-IN': 'INR',
		'ml-IN': 'INR',
		'as-IN': 'INR',
		'ne-NP': 'NPR',
		'si-LK': 'LKR',
		'my-MM': 'MMK',
		'km-KH': 'KHR',
		'lo-LA': 'LAK',
		'ka-GE': 'GEL',
		'az-AZ': 'AZN',
		'uz-UZ': 'UZS',
		'kk-KZ': 'KZT',
		'ky-KG': 'KGS',
		'tg-TJ': 'TJS',
		'tk-TM': 'TMT',
		'mn-MN': 'MNT',
		'hu-HU': 'HUF',
		'cs-CZ': 'CZK',
		'sk-SK': 'EUR',
		'bg-BG': 'BGN',
		'ro-RO': 'RON',
		'sr-RS': 'RSD',
		'hr-HR': 'EUR',
		'sl-SI': 'EUR',
		'lt-LT': 'EUR',
		'lv-LV': 'EUR',
		'et-EE': 'EUR',
		'fi-FI': 'EUR',
		'sv-SE': 'SEK',
		'da-DK': 'DKK',
		'nb-NO': 'NOK',
		'is-IS': 'ISK',
		'he-IL': 'ILS',
		'am-ET': 'ETB',
		'ha-NG': 'NGN',
		'yo-NG': 'NGN',
		'ig-NG': 'NGN',
		'zu-ZA': 'ZAR',
		'xh-ZA': 'ZAR',
		'af-ZA': 'ZAR',
		'sw-KE': 'KES',
		'sw-TZ': 'TZS'
	};

	// Try exact match
	if (currencyMap[locale]) {
		return currencyMap[locale];
	}

	// Try language code only
	const langCode = locale.split('-')[0];
	if (currencyMap[langCode]) {
		return currencyMap[langCode];
	}

	// Default to USD for unknown locales
	return 'USD';
}

/**
 * Preset formats for common use cases
 */
export const FORMATS = {
	// Number formats
	number: {
		default: {},
		decimal: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
		percent: { style: 'percent' },
		compact: { notation: 'compact' },
		scientific: { notation: 'scientific' },
		engineering: { notation: 'engineering' }
	},

	// Date formats
	date: {
		short: { dateStyle: 'short' } as Intl.DateTimeFormatOptions,
		medium: { dateStyle: 'medium' } as Intl.DateTimeFormatOptions,
		long: { dateStyle: 'long' } as Intl.DateTimeFormatOptions,
		full: { dateStyle: 'full' } as Intl.DateTimeFormatOptions,
		yearMonth: { year: 'numeric', month: 'long' } as Intl.DateTimeFormatOptions,
		monthDay: { month: 'long', day: 'numeric' } as Intl.DateTimeFormatOptions,
		weekday: { weekday: 'long' } as Intl.DateTimeFormatOptions
	},

	// Time formats
	time: {
		short: { timeStyle: 'short' } as Intl.DateTimeFormatOptions,
		medium: { timeStyle: 'medium' } as Intl.DateTimeFormatOptions,
		long: { timeStyle: 'long' } as Intl.DateTimeFormatOptions,
		hour: { hour: 'numeric' } as Intl.DateTimeFormatOptions,
		hourMinute: { hour: 'numeric', minute: 'numeric' } as Intl.DateTimeFormatOptions,
		hourMinuteSecond: {
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric'
		} as Intl.DateTimeFormatOptions
	},

	// DateTime formats
	dateTime: {
		short: { dateStyle: 'short', timeStyle: 'short' },
		medium: { dateStyle: 'medium', timeStyle: 'medium' },
		long: { dateStyle: 'long', timeStyle: 'long' }
	}
} as const;
