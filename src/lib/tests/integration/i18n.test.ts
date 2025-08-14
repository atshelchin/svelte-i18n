import { describe, it, expect, beforeAll } from 'vitest';
import { libI18n, getEffectiveLibI18n } from '$lib/translations/i18n.js';
import { initTypedI18n } from '$lib/unified.js';

describe('Library i18n', () => {
	beforeAll(async () => {
		// Initialize the library i18n
		await initTypedI18n(libI18n);
	});

	it('should have translations loaded', () => {
		// Check that locales are loaded
		expect(libI18n.locales).toContain('en');
		expect(libI18n.locales).toContain('zh');
		expect(libI18n.locales).toContain('ja');
	});

	it('should translate ValidationPopup keys correctly', () => {
		// Test English translations
		expect(libI18n.t('validationPopup.header.title')).toBe('Translation Validation Report');
		expect(libI18n.t('validationPopup.floatingIndicator.translationIssues')).toBe(
			'Translation Issues'
		);
		expect(libI18n.t('validationPopup.controls.languageLabel')).toBe('Language:');
	});

	it('should switch languages and translate correctly', async () => {
		// Switch to Chinese
		await libI18n.setLocale('zh');
		expect(libI18n.locale).toBe('zh');

		// Check Chinese translations
		expect(libI18n.t('validationPopup.header.title')).toBe('翻译验证报告 (内置版本)');
		expect(libI18n.t('validationPopup.floatingIndicator.translationIssues')).toBe('翻译问题');

		// Switch back to English
		await libI18n.setLocale('en');
		expect(libI18n.locale).toBe('en');
		expect(libI18n.t('validationPopup.header.title')).toBe('Translation Validation Report');
	});

	it('should get effective library i18n instance', () => {
		const effectiveI18n = getEffectiveLibI18n();
		expect(effectiveI18n).toBeDefined();
		expect(effectiveI18n.t).toBeDefined();
		expect(effectiveI18n.locale).toBeDefined();
	});
});
