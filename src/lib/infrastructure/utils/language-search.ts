/**
 * Language search utilities
 */

export interface LanguageInfo {
	code: string;
	name: string;
	englishName: string;
	direction?: 'ltr' | 'rtl';
	flag?: string;
}

// Common languages with metadata
const commonLanguages: LanguageInfo[] = [
	{ code: 'en', name: 'English', englishName: 'English', flag: '🇬🇧' },
	{ code: 'zh', name: '中文', englishName: 'Chinese', flag: '🇨🇳' },
	{ code: 'es', name: 'Español', englishName: 'Spanish', flag: '🇪🇸' },
	{ code: 'fr', name: 'Français', englishName: 'French', flag: '🇫🇷' },
	{ code: 'de', name: 'Deutsch', englishName: 'German', flag: '🇩🇪' },
	{ code: 'ja', name: '日本語', englishName: 'Japanese', flag: '🇯🇵' },
	{ code: 'ko', name: '한국어', englishName: 'Korean', flag: '🇰🇷' },
	{ code: 'pt', name: 'Português', englishName: 'Portuguese', flag: '🇵🇹' },
	{ code: 'ru', name: 'Русский', englishName: 'Russian', flag: '🇷🇺' },
	{ code: 'ar', name: 'العربية', englishName: 'Arabic', direction: 'rtl', flag: '🇸🇦' },
	{ code: 'hi', name: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳' },
	{ code: 'it', name: 'Italiano', englishName: 'Italian', flag: '🇮🇹' },
	{ code: 'nl', name: 'Nederlands', englishName: 'Dutch', flag: '🇳🇱' },
	{ code: 'pl', name: 'Polski', englishName: 'Polish', flag: '🇵🇱' },
	{ code: 'tr', name: 'Türkçe', englishName: 'Turkish', flag: '🇹🇷' },
	{ code: 'vi', name: 'Tiếng Việt', englishName: 'Vietnamese', flag: '🇻🇳' },
	{ code: 'th', name: 'ไทย', englishName: 'Thai', flag: '🇹🇭' },
	{ code: 'id', name: 'Bahasa Indonesia', englishName: 'Indonesian', flag: '🇮🇩' },
	{ code: 'he', name: 'עברית', englishName: 'Hebrew', direction: 'rtl', flag: '🇮🇱' },
	{ code: 'sv', name: 'Svenska', englishName: 'Swedish', flag: '🇸🇪' },
	{ code: 'no', name: 'Norsk', englishName: 'Norwegian', flag: '🇳🇴' },
	{ code: 'da', name: 'Dansk', englishName: 'Danish', flag: '🇩🇰' },
	{ code: 'fi', name: 'Suomi', englishName: 'Finnish', flag: '🇫🇮' },
	{ code: 'cs', name: 'Čeština', englishName: 'Czech', flag: '🇨🇿' },
	{ code: 'hu', name: 'Magyar', englishName: 'Hungarian', flag: '🇭🇺' },
	{ code: 'el', name: 'Ελληνικά', englishName: 'Greek', flag: '🇬🇷' },
	{ code: 'ro', name: 'Română', englishName: 'Romanian', flag: '🇷🇴' },
	{ code: 'uk', name: 'Українська', englishName: 'Ukrainian', flag: '🇺🇦' },
	{ code: 'bg', name: 'Български', englishName: 'Bulgarian', flag: '🇧🇬' },
	{ code: 'zh-TW', name: '繁體中文', englishName: 'Traditional Chinese', flag: '🇹🇼' },
	{ code: 'zh-CN', name: '简体中文', englishName: 'Simplified Chinese', flag: '🇨🇳' },
	{ code: 'pt-BR', name: 'Português (Brasil)', englishName: 'Portuguese (Brazil)', flag: '🇧🇷' }
];

/**
 * Search for languages by query string
 * Matches against code, native name, or English name
 */
export function fuzzySearchLanguages(query: string): LanguageInfo[] {
	if (!query) return [];

	const lowerQuery = query.toLowerCase();
	return commonLanguages.filter(
		(lang) =>
			lang.code.toLowerCase().includes(lowerQuery) ||
			lang.name.toLowerCase().includes(lowerQuery) ||
			lang.englishName.toLowerCase().includes(lowerQuery)
	);
}

/**
 * Get language info by code
 */
export function getLanguageInfo(code: string): LanguageInfo | undefined {
	return commonLanguages.find((lang) => lang.code === code);
}

/**
 * Get all supported languages
 */
export function getAllLanguages(): LanguageInfo[] {
	return [...commonLanguages];
}
