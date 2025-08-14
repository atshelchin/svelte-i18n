import { describe, it, expect } from 'vitest';
import { commonLanguages, isValidLanguageCode } from './language-search.js';

describe('Language Search Utils', () => {
	describe('commonLanguages data integrity', () => {
		it('should not have duplicate language codes', () => {
			const codes = commonLanguages.map((lang) => lang.code.toLowerCase());
			const uniqueCodes = new Set(codes);

			// Find duplicates for better error message
			const duplicates: string[] = [];
			const seen = new Set<string>();

			for (const code of codes) {
				if (seen.has(code)) {
					duplicates.push(code);
				} else {
					seen.add(code);
				}
			}

			if (duplicates.length > 0) {
				const duplicateInfo = duplicates
					.map((code) => {
						const entries = commonLanguages.filter((lang) => lang.code.toLowerCase() === code);
						return `\n  Code '${code}' appears ${entries.length} times: ${entries.map((e) => e.name).join(', ')}`;
					})
					.join('');

				throw new Error(`Found duplicate language codes:${duplicateInfo}`);
			}

			expect(codes.length).toBe(uniqueCodes.size);
		});

		it('should have valid data for all languages', () => {
			for (const lang of commonLanguages) {
				expect(lang.code).toBeTruthy();
				expect(lang.name).toBeTruthy();
				expect(lang.englishName).toBeTruthy();
				expect(lang.flag).toBeTruthy();
				expect(['ltr', 'rtl']).toContain(lang.direction);
			}
		});

		it('should have all expected ISO 639-1 codes', () => {
			const expectedCodes = ['en', 'zh', 'es', 'hi', 'ar', 'fr', 'ru', 'pt', 'de', 'ja'];
			for (const code of expectedCodes) {
				const found = commonLanguages.some((lang) => lang.code === code);
				expect(found, `Missing expected ISO 639-1 code: ${code}`).toBe(true);
			}
		});

		it('should have expected ISO 639-2/3 codes', () => {
			const expectedCodes = ['eng', 'chi', 'spa', 'hin', 'ara', 'fra', 'rus', 'por', 'deu', 'jpn'];
			for (const code of expectedCodes) {
				const found = commonLanguages.some((lang) => lang.code === code);
				expect(found, `Missing expected ISO 639-2/3 code: ${code}`).toBe(true);
			}
		});
	});

	describe('isValidLanguageCode', () => {
		it('should validate ISO 639-1 codes', () => {
			expect(isValidLanguageCode('en')).toBe(true);
			expect(isValidLanguageCode('zh')).toBe(true);
			expect(isValidLanguageCode('fr')).toBe(true);
		});

		it('should validate ISO 639-2/3 codes', () => {
			expect(isValidLanguageCode('eng')).toBe(true);
			expect(isValidLanguageCode('chi')).toBe(true);
			expect(isValidLanguageCode('fra')).toBe(true);
		});

		it('should validate BCP 47 codes', () => {
			expect(isValidLanguageCode('en-US')).toBe(true);
			expect(isValidLanguageCode('zh-CN')).toBe(true);
			expect(isValidLanguageCode('zh-TW')).toBe(true);
		});

		it('should be case-insensitive', () => {
			expect(isValidLanguageCode('EN')).toBe(true);
			expect(isValidLanguageCode('En')).toBe(true);
			expect(isValidLanguageCode('eN')).toBe(true);
		});

		it('should return false for invalid codes', () => {
			expect(isValidLanguageCode('xyz')).toBe(false);
			expect(isValidLanguageCode('123')).toBe(false);
			expect(isValidLanguageCode('xx-YY')).toBe(false);
		});
	});
});
