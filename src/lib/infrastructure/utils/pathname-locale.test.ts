import { describe, it, expect } from 'vitest';
import {
	extractLocaleFromPathname,
	extractSupportedLocaleFromPathname,
	getBestLocale,
	shouldUsePathnameLocale
} from './pathname-locale.js';

// Mock i18n instance - only need locales property for these tests
const createMockI18n = (locales: string[]) => ({
	locale: 'en',
	locales
});

describe('Pathname Locale Utils', () => {
	describe('extractLocaleFromPathname', () => {
		it('should extract ISO 639-1 language codes', () => {
			expect(extractLocaleFromPathname('/en/about')).toBe('en');
			expect(extractLocaleFromPathname('/zh/products')).toBe('zh');
			expect(extractLocaleFromPathname('/fr/contact')).toBe('fr');
		});

		it('should extract ISO 639-2/3 language codes', () => {
			expect(extractLocaleFromPathname('/eng/about')).toBe('eng');
			expect(extractLocaleFromPathname('/chi/products')).toBe('chi');
			expect(extractLocaleFromPathname('/fra/contact')).toBe('fra');
		});

		it('should extract BCP 47 locale codes', () => {
			expect(extractLocaleFromPathname('/en-US/about')).toBe('en-US');
			expect(extractLocaleFromPathname('/zh-CN/products')).toBe('zh-CN');
			expect(extractLocaleFromPathname('/zh-TW/contact')).toBe('zh-TW');
		});

		it('should return null for invalid language codes', () => {
			expect(extractLocaleFromPathname('/xyz/about')).toBe(null);
			expect(extractLocaleFromPathname('/123/products')).toBe(null);
			expect(extractLocaleFromPathname('/notlang/contact')).toBe(null);
		});

		it('should return null for paths without language codes', () => {
			expect(extractLocaleFromPathname('/about')).toBe(null);
			expect(extractLocaleFromPathname('/products/detail')).toBe(null);
			expect(extractLocaleFromPathname('/')).toBe(null);
		});

		it('should handle uppercase language codes', () => {
			expect(extractLocaleFromPathname('/EN/about')).toBe('EN');
			expect(extractLocaleFromPathname('/ZH-CN/products')).toBe('ZH-CN');
		});

		it('should only check the first segment', () => {
			expect(extractLocaleFromPathname('/products/en/detail')).toBe(null);
			expect(extractLocaleFromPathname('/api/zh/data')).toBe(null);
		});
	});

	describe('extractSupportedLocaleFromPathname', () => {
		it('should return locale if supported by app', () => {
			const i18n = createMockI18n(['en', 'zh', 'fr']);
			expect(extractSupportedLocaleFromPathname('/en/about', i18n)).toBe('en');
			expect(extractSupportedLocaleFromPathname('/zh/products', i18n)).toBe('zh');
		});

		it('should return null if locale not supported', () => {
			const i18n = createMockI18n(['en', 'zh']);
			expect(extractSupportedLocaleFromPathname('/fr/about', i18n)).toBe(null);
			expect(extractSupportedLocaleFromPathname('/de/products', i18n)).toBe(null);
		});

		it('should fallback to base locale for regional variants', () => {
			const i18n = createMockI18n(['en', 'zh']);
			expect(extractSupportedLocaleFromPathname('/en-US/about', i18n)).toBe('en');
			expect(extractSupportedLocaleFromPathname('/zh-CN/products', i18n)).toBe('zh');
		});

		it('should prefer exact match over base locale', () => {
			const i18n = createMockI18n(['en', 'en-US', 'zh', 'zh-CN']);
			expect(extractSupportedLocaleFromPathname('/en-US/about', i18n)).toBe('en-US');
			expect(extractSupportedLocaleFromPathname('/zh-CN/products', i18n)).toBe('zh-CN');
		});

		it('should return null for invalid paths', () => {
			const i18n = createMockI18n(['en', 'zh']);
			expect(extractSupportedLocaleFromPathname('/about', i18n)).toBe(null);
			expect(extractSupportedLocaleFromPathname('/xyz/products', i18n)).toBe(null);
			expect(extractSupportedLocaleFromPathname('/', i18n)).toBe(null);
		});
	});

	describe('getBestLocale', () => {
		it('should prioritize pathname locale over fallback', () => {
			const i18n = createMockI18n(['en', 'zh', 'fr']);
			const result = getBestLocale('/zh/about', i18n, 'en', 'fr');
			expect(result).toBe('zh');
		});

		it('should use fallback if pathname has no locale', () => {
			const i18n = createMockI18n(['en', 'zh', 'fr']);
			const result = getBestLocale('/about', i18n, 'en', 'fr');
			expect(result).toBe('en');
		});

		it('should use default if no pathname locale and no fallback', () => {
			const i18n = createMockI18n(['en', 'zh', 'fr']);
			const result = getBestLocale('/about', i18n, null, 'fr');
			expect(result).toBe('fr');
		});

		it('should use default if pathname locale not supported', () => {
			const i18n = createMockI18n(['en', 'zh']);
			const result = getBestLocale('/de/about', i18n, 'en', 'fr');
			expect(result).toBe('en');
		});

		it('should use default if fallback not supported', () => {
			const i18n = createMockI18n(['en', 'zh']);
			const result = getBestLocale('/about', i18n, 'de', 'fr');
			expect(result).toBe('fr');
		});

		it('should handle undefined fallback', () => {
			const i18n = createMockI18n(['en', 'zh']);
			const result = getBestLocale('/about', i18n, undefined, 'en');
			expect(result).toBe('en');
		});

		it('should handle empty string fallback', () => {
			const i18n = createMockI18n(['en', 'zh']);
			const result = getBestLocale('/about', i18n, '', 'en');
			expect(result).toBe('en');
		});
	});

	describe('shouldUsePathnameLocale', () => {
		it('should return true if pathname locale differs from current', () => {
			const i18n = createMockI18n(['en', 'zh', 'fr']);
			expect(shouldUsePathnameLocale('/zh/about', i18n, 'en')).toBe(true);
			expect(shouldUsePathnameLocale('/fr/products', i18n, 'zh')).toBe(true);
		});

		it('should return false if pathname locale matches current', () => {
			const i18n = createMockI18n(['en', 'zh', 'fr']);
			expect(shouldUsePathnameLocale('/en/about', i18n, 'en')).toBe(false);
			expect(shouldUsePathnameLocale('/zh/products', i18n, 'zh')).toBe(false);
		});

		it('should return false if no pathname locale', () => {
			const i18n = createMockI18n(['en', 'zh', 'fr']);
			expect(shouldUsePathnameLocale('/about', i18n, 'en')).toBe(false);
			expect(shouldUsePathnameLocale('/products', i18n, 'zh')).toBe(false);
		});

		it('should return false if pathname locale not supported', () => {
			const i18n = createMockI18n(['en', 'zh']);
			expect(shouldUsePathnameLocale('/de/about', i18n, 'en')).toBe(false);
			expect(shouldUsePathnameLocale('/fr/products', i18n, 'zh')).toBe(false);
		});
	});

	describe('Priority chain integration', () => {
		it('should correctly prioritize: pathname > localStorage > cookie > default', () => {
			const i18n = createMockI18n(['en', 'zh', 'fr', 'de']);

			// Pathname takes priority
			expect(getBestLocale('/de/page', i18n, 'zh', 'en')).toBe('de');

			// localStorage/cookie takes priority when no pathname locale
			expect(getBestLocale('/page', i18n, 'zh', 'en')).toBe('zh');

			// Default when nothing else
			expect(getBestLocale('/page', i18n, null, 'fr')).toBe('fr');
		});

		it('should handle complex real-world scenarios', () => {
			const i18n = createMockI18n(['en', 'zh', 'zh-CN', 'zh-TW']);

			// Exact match preferred
			expect(getBestLocale('/zh-CN/page', i18n, 'en', 'zh')).toBe('zh-CN');

			// Fallback to base when regional not supported
			const i18n2 = createMockI18n(['en', 'zh']);
			expect(getBestLocale('/zh-CN/page', i18n2, 'en', 'fr')).toBe('zh');

			// Invalid pathname locale falls back to localStorage/cookie
			expect(getBestLocale('/xyz/page', i18n, 'zh-TW', 'en')).toBe('zh-TW');
		});
	});

	describe('SSR Auto-discovery Support', () => {
		it('should detect auto-discovered locale from pathname', () => {
			const i18n = createMockI18n(['en', 'zh', 'fr']); // ko not loaded yet
			const availableLocales = ['en', 'zh', 'fr', 'ko', 'ja']; // ko, ja are auto-discovered

			// Should recognize ko from pathname even though not loaded
			const result = getBestLocale('/ko/about', i18n, null, 'en', availableLocales);
			expect(result).toBe('ko');
		});

		it('should prioritize pathname over cookie for auto-discovered locales', () => {
			const i18n = createMockI18n(['en', 'zh']);
			const availableLocales = ['en', 'zh', 'ko', 'ja'];

			// Cookie says zh, but pathname says ko (auto-discovered)
			const result = getBestLocale('/ko/products', i18n, 'zh', 'en', availableLocales);
			expect(result).toBe('ko');
		});

		it('should use auto-discovered locale from cookie when no pathname locale', () => {
			const i18n = createMockI18n(['en', 'zh']);
			const availableLocales = ['en', 'zh', 'ko', 'ja'];

			// No pathname locale, cookie has auto-discovered locale
			const result = getBestLocale('/about', i18n, 'ko', 'en', availableLocales);
			expect(result).toBe('ko');
		});

		it('should handle region codes with auto-discovered base locale', () => {
			const i18n = createMockI18n(['en', 'zh']);
			const availableLocales = ['en', 'zh', 'es', 'pt'];

			// es-MX should fall back to es (auto-discovered)
			const result = getBestLocale('/es-MX/contact', i18n, 'en', 'zh', availableLocales);
			expect(result).toBe('es');
		});

		it('should reject invalid locales even with availableLocales', () => {
			const i18n = createMockI18n(['en', 'zh']);
			const availableLocales = ['en', 'zh', 'ko', 'ja'];

			// xyz is not a valid locale code
			const result = getBestLocale('/xyz/page', i18n, 'ja', 'en', availableLocales);
			expect(result).toBe('ja'); // Falls back to cookie
		});

		it('should handle complex SSR priority scenarios', () => {
			const i18n = createMockI18n(['en', 'zh']);
			const availableLocales = ['en', 'zh', 'ko', 'ja', 'fr', 'de'];

			// Test various SSR scenarios
			expect(getBestLocale('/ja/page', i18n, 'ko', 'en', availableLocales)).toBe('ja'); // pathname wins
			expect(getBestLocale('/page', i18n, 'ko', 'en', availableLocales)).toBe('ko'); // cookie wins
			expect(getBestLocale('/page', i18n, 'es', 'en', availableLocales)).toBe('en'); // default wins (es not available)
			expect(getBestLocale('/fr/page', i18n, null, 'zh', availableLocales)).toBe('fr'); // auto-discovered pathname
		});

		it('should work without availableLocales parameter (backward compatibility)', () => {
			const i18n = createMockI18n(['en', 'zh', 'fr']);

			// Should work as before when availableLocales not provided
			expect(getBestLocale('/zh/page', i18n, 'en', 'fr')).toBe('zh');
			expect(getBestLocale('/ko/page', i18n, 'en', 'fr')).toBe('en'); // ko not supported
		});
	});
});
