/**
 * Default language metadata for common locales
 * Provides fallback information when _meta is not available in translation files
 */

import type { LanguageMeta } from '../models/types.js';

/**
 * Default metadata for common languages
 */
export const DEFAULT_LANGUAGE_META: Record<string, LanguageMeta> = {
	// Major languages
	en: { name: 'English', flag: '🇬🇧', direction: 'ltr' },
	zh: { name: '中文', flag: '🇨🇳', direction: 'ltr' },
	'zh-CN': { name: '简体中文', flag: '🇨🇳', direction: 'ltr' },
	'zh-TW': { name: '繁體中文', flag: '🇹🇼', direction: 'ltr' },
	'zh-HK': { name: '繁體中文 (香港)', flag: '🇭🇰', direction: 'ltr' },
	es: { name: 'Español', flag: '🇪🇸', direction: 'ltr' },
	hi: { name: 'हिन्दी', flag: '🇮🇳', direction: 'ltr' },
	ar: { name: 'العربية', flag: '🇸🇦', direction: 'rtl' },
	pt: { name: 'Português', flag: '🇵🇹', direction: 'ltr' },
	'pt-BR': { name: 'Português (Brasil)', flag: '🇧🇷', direction: 'ltr' },
	bn: { name: 'বাংলা', flag: '🇧🇩', direction: 'ltr' },
	ru: { name: 'Русский', flag: '🇷🇺', direction: 'ltr' },
	ja: { name: '日本語', flag: '🇯🇵', direction: 'ltr' },
	pa: { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', direction: 'ltr' },
	de: { name: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
	jv: { name: 'Basa Jawa', flag: '🇮🇩', direction: 'ltr' },
	ko: { name: '한국어', flag: '🇰🇷', direction: 'ltr' },
	fr: { name: 'Français', flag: '🇫🇷', direction: 'ltr' },
	te: { name: 'తెలుగు', flag: '🇮🇳', direction: 'ltr' },
	mr: { name: 'मराठी', flag: '🇮🇳', direction: 'ltr' },
	tr: { name: 'Türkçe', flag: '🇹🇷', direction: 'ltr' },
	ta: { name: 'தமிழ்', flag: '🇮🇳', direction: 'ltr' },
	vi: { name: 'Tiếng Việt', flag: '🇻🇳', direction: 'ltr' },
	ur: { name: 'اردو', flag: '🇵🇰', direction: 'rtl' },
	it: { name: 'Italiano', flag: '🇮🇹', direction: 'ltr' },
	th: { name: 'ไทย', flag: '🇹🇭', direction: 'ltr' },
	gu: { name: 'ગુજરાતી', flag: '🇮🇳', direction: 'ltr' },
	fa: { name: 'فارسی', flag: '🇮🇷', direction: 'rtl' },
	pl: { name: 'Polski', flag: '🇵🇱', direction: 'ltr' },
	uk: { name: 'Українська', flag: '🇺🇦', direction: 'ltr' },
	kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳', direction: 'ltr' },
	ml: { name: 'മലയാളം', flag: '🇮🇳', direction: 'ltr' },
	or: { name: 'ଓଡ଼ିଆ', flag: '🇮🇳', direction: 'ltr' },
	my: { name: 'မြန်မာ', flag: '🇲🇲', direction: 'ltr' },
	si: { name: 'සිංහල', flag: '🇱🇰', direction: 'ltr' },

	// European languages
	nl: { name: 'Nederlands', flag: '🇳🇱', direction: 'ltr' },
	sv: { name: 'Svenska', flag: '🇸🇪', direction: 'ltr' },
	no: { name: 'Norsk', flag: '🇳🇴', direction: 'ltr' },
	nb: { name: 'Norsk Bokmål', flag: '🇳🇴', direction: 'ltr' },
	nn: { name: 'Norsk Nynorsk', flag: '🇳🇴', direction: 'ltr' },
	da: { name: 'Dansk', flag: '🇩🇰', direction: 'ltr' },
	fi: { name: 'Suomi', flag: '🇫🇮', direction: 'ltr' },
	el: { name: 'Ελληνικά', flag: '🇬🇷', direction: 'ltr' },
	cs: { name: 'Čeština', flag: '🇨🇿', direction: 'ltr' },
	sk: { name: 'Slovenčina', flag: '🇸🇰', direction: 'ltr' },
	hu: { name: 'Magyar', flag: '🇭🇺', direction: 'ltr' },
	ro: { name: 'Română', flag: '🇷🇴', direction: 'ltr' },
	bg: { name: 'Български', flag: '🇧🇬', direction: 'ltr' },
	hr: { name: 'Hrvatski', flag: '🇭🇷', direction: 'ltr' },
	sr: { name: 'Српски', flag: '🇷🇸', direction: 'ltr' },
	sl: { name: 'Slovenščina', flag: '🇸🇮', direction: 'ltr' },
	lt: { name: 'Lietuvių', flag: '🇱🇹', direction: 'ltr' },
	lv: { name: 'Latviešu', flag: '🇱🇻', direction: 'ltr' },
	et: { name: 'Eesti', flag: '🇪🇪', direction: 'ltr' },
	is: { name: 'Íslenska', flag: '🇮🇸', direction: 'ltr' },
	ga: { name: 'Gaeilge', flag: '🇮🇪', direction: 'ltr' },
	mt: { name: 'Malti', flag: '🇲🇹', direction: 'ltr' },
	sq: { name: 'Shqip', flag: '🇦🇱', direction: 'ltr' },
	mk: { name: 'Македонски', flag: '🇲🇰', direction: 'ltr' },
	ca: { name: 'Català', flag: '🇪🇸', direction: 'ltr' },
	eu: { name: 'Euskara', flag: '🇪🇸', direction: 'ltr' },
	gl: { name: 'Galego', flag: '🇪🇸', direction: 'ltr' },

	// Other Asian languages
	id: { name: 'Bahasa Indonesia', flag: '🇮🇩', direction: 'ltr' },
	ms: { name: 'Bahasa Melayu', flag: '🇲🇾', direction: 'ltr' },
	tl: { name: 'Tagalog', flag: '🇵🇭', direction: 'ltr' },
	fil: { name: 'Filipino', flag: '🇵🇭', direction: 'ltr' },
	km: { name: 'ខ្មែរ', flag: '🇰🇭', direction: 'ltr' },
	lo: { name: 'ລາວ', flag: '🇱🇦', direction: 'ltr' },
	ka: { name: 'ქართული', flag: '🇬🇪', direction: 'ltr' },
	hy: { name: 'Հայերեն', flag: '🇦🇲', direction: 'ltr' },
	az: { name: 'Azərbaycan', flag: '🇦🇿', direction: 'ltr' },
	kk: { name: 'Қазақ', flag: '🇰🇿', direction: 'ltr' },
	uz: { name: 'Oʻzbek', flag: '🇺🇿', direction: 'ltr' },
	ky: { name: 'Кыргызча', flag: '🇰🇬', direction: 'ltr' },
	tg: { name: 'Тоҷикӣ', flag: '🇹🇯', direction: 'ltr' },
	tk: { name: 'Türkmen', flag: '🇹🇲', direction: 'ltr' },
	mn: { name: 'Монгол', flag: '🇲🇳', direction: 'ltr' },
	ne: { name: 'नेपाली', flag: '🇳🇵', direction: 'ltr' },

	// African languages
	sw: { name: 'Kiswahili', flag: '🇰🇪', direction: 'ltr' },
	am: { name: 'አማርኛ', flag: '🇪🇹', direction: 'ltr' },
	ha: { name: 'Hausa', flag: '🇳🇬', direction: 'ltr' },
	yo: { name: 'Yorùbá', flag: '🇳🇬', direction: 'ltr' },
	ig: { name: 'Igbo', flag: '🇳🇬', direction: 'ltr' },
	zu: { name: 'isiZulu', flag: '🇿🇦', direction: 'ltr' },
	xh: { name: 'isiXhosa', flag: '🇿🇦', direction: 'ltr' },
	af: { name: 'Afrikaans', flag: '🇿🇦', direction: 'ltr' },

	// Middle Eastern languages
	he: { name: 'עברית', flag: '🇮🇱', direction: 'rtl' },
	iw: { name: 'עברית', flag: '🇮🇱', direction: 'rtl' }, // Deprecated code for Hebrew
	ps: { name: 'پښتو', flag: '🇦🇫', direction: 'rtl' },
	ku: { name: 'کوردی', flag: '🇮🇶', direction: 'rtl' }
};

/**
 * Get metadata for a language with fallback to defaults
 * @param locale The locale code
 * @param customMeta Optional custom metadata to use
 * @returns Language metadata
 */
export function getLanguageMeta(locale: string, customMeta?: LanguageMeta): LanguageMeta {
	// Use custom metadata if provided
	if (customMeta) {
		return customMeta;
	}

	// Check exact match first
	if (DEFAULT_LANGUAGE_META[locale]) {
		return DEFAULT_LANGUAGE_META[locale];
	}

	// Try base language code (e.g., 'en' for 'en-US')
	const baseLocale = locale.split('-')[0];
	if (DEFAULT_LANGUAGE_META[baseLocale]) {
		const meta = { ...DEFAULT_LANGUAGE_META[baseLocale] };
		// Adjust flag for regional variants
		if (locale === 'en-US') meta.flag = '🇺🇸';
		else if (locale === 'en-GB') meta.flag = '🇬🇧';
		else if (locale === 'en-AU') meta.flag = '🇦🇺';
		else if (locale === 'en-CA') meta.flag = '🇨🇦';
		else if (locale === 'fr-CA') meta.flag = '🇨🇦';
		else if (locale === 'es-MX') meta.flag = '🇲🇽';
		else if (locale === 'es-AR') meta.flag = '🇦🇷';
		return meta;
	}

	// Fallback to generic metadata
	return {
		name: locale.toUpperCase(),
		flag: '🌐',
		direction: 'ltr'
	};
}

/**
 * Merge multiple language metadata sources
 * Priority: custom > translation file > defaults
 */
export function mergeLanguageMeta(
	locale: string,
	sources: {
		custom?: LanguageMeta;
		fromFile?: LanguageMeta;
		defaults?: boolean;
	}
): LanguageMeta {
	// Custom metadata has highest priority
	if (sources.custom) {
		return sources.custom;
	}

	// Translation file metadata has second priority
	if (sources.fromFile) {
		return sources.fromFile;
	}

	// Use defaults if requested
	if (sources.defaults) {
		return getLanguageMeta(locale);
	}

	// Final fallback
	return {
		name: locale,
		flag: '🌐',
		direction: 'ltr'
	};
}
