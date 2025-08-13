import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ValidationPopup from './ValidationPopup.svelte';
import { createI18nStore } from '../../application/stores/store.svelte.js';
import type { I18nInstance } from '../../domain/models/types.js';

describe('ValidationPopup', () => {
	let mockI18n: I18nInstance;

	beforeEach(() => {
		// Create a mock i18n instance with validation errors
		mockI18n = createI18nStore({
			namespace: 'test',
			defaultLocale: 'en',
			fallbackLocale: 'en',
			translations: {
				en: {
					welcome: 'Welcome',
					demo: {
						title: 'Demo',
						features: 'Features',
						formatting: 'Formatting'
					}
				}
			}
		});

		// Manually add validation errors for different languages
		(mockI18n as any).validationErrors = {
			'zh-TW': ['Missing translation: demo.advanced', 'Missing translation: demo.apiReference'],
			de: [
				'Missing translation: demo.addLanguagesWithoutRebuild',
				'Missing translation: demo.advanced',
				'Missing translation: demo.allLanguagesLoaded',
				'Missing translation: demo.apiReference',
				'Missing translation: demo.autoDiscovery'
			],
			ar: [
				'Missing translation: demo.addLanguagesWithoutRebuild',
				'Missing translation: demo.advanced',
				'Missing translation: demo.allLanguagesLoaded'
			],
			ko: ['Missing translation: demo.features'],
			pt: ['Missing translation: demo.title', 'Missing translation: demo.formatting'],
			es: ['Missing translation: demo.advanced']
		};

		// Add locales
		(mockI18n as any).availableLocales = ['en', 'zh-TW', 'de', 'ar', 'ko', 'pt', 'es'];
	});

	it('should display correct number of languages with errors', () => {
		const { container } = render(ValidationPopup, {
			props: {
				i18n: mockI18n
			}
		});

		// Check if the select element exists
		const selectElement = container.querySelector('select.language-select');
		expect(selectElement).toBeTruthy();

		// Check number of options (should be 6 languages with errors)
		const options = container.querySelectorAll('select.language-select option');
		expect(options.length).toBe(6);
	});

	it('should display correct flags for each language', () => {
		const { container } = render(ValidationPopup, {
			props: {
				i18n: mockI18n
			}
		});

		const options = container.querySelectorAll('select.language-select option');

		// Check if flags are displayed correctly
		const optionTexts = Array.from(options).map((opt) => opt.textContent);

		// Should contain the correct flag emojis
		expect(optionTexts.some((text) => text?.includes('🇹🇼'))).toBe(true); // zh-TW
		expect(optionTexts.some((text) => text?.includes('🇩🇪'))).toBe(true); // de
		expect(optionTexts.some((text) => text?.includes('🇸🇦'))).toBe(true); // ar
		expect(optionTexts.some((text) => text?.includes('🇰🇷'))).toBe(true); // ko
		expect(optionTexts.some((text) => text?.includes('🇵🇹'))).toBe(true); // pt
		expect(optionTexts.some((text) => text?.includes('🇪🇸'))).toBe(true); // es
	});

	it('should display correct error counts for each language', () => {
		const { container } = render(ValidationPopup, {
			props: {
				i18n: mockI18n
			}
		});

		const options = container.querySelectorAll('select.language-select option');
		const optionTexts = Array.from(options).map((opt) => opt.textContent);

		// Check error counts in the option text
		// Format: "{flag} {name} ({count} errors)"
		expect(optionTexts.some((text) => text?.includes('(2 errors)'))).toBe(true); // zh-TW has 2 errors
		expect(optionTexts.some((text) => text?.includes('(5 errors)'))).toBe(true); // de has 5 errors
		expect(optionTexts.some((text) => text?.includes('(3 errors)'))).toBe(true); // ar has 3 errors
		expect(optionTexts.some((text) => text?.includes('(1 errors)'))).toBe(true); // ko has 1 error
		expect(optionTexts.some((text) => text?.includes('(2 errors)'))).toBe(true); // pt has 2 errors
		expect(optionTexts.some((text) => text?.includes('(1 errors)'))).toBe(true); // es has 1 error
	});

	it('should display language names correctly', () => {
		const { container } = render(ValidationPopup, {
			props: {
				i18n: mockI18n
			}
		});

		const options = container.querySelectorAll('select.language-select option');
		const optionTexts = Array.from(options).map((opt) => opt.textContent);

		// Check if language names are displayed
		expect(optionTexts.some((text) => text?.includes('繁體中文'))).toBe(true); // zh-TW
		expect(optionTexts.some((text) => text?.includes('Deutsch'))).toBe(true); // de
		expect(optionTexts.some((text) => text?.includes('العربية'))).toBe(true); // ar
		expect(optionTexts.some((text) => text?.includes('한국어'))).toBe(true); // ko
		expect(optionTexts.some((text) => text?.includes('Português'))).toBe(true); // pt
		expect(optionTexts.some((text) => text?.includes('Español'))).toBe(true); // es
	});

	it('should show total error count in header', () => {
		const { container } = render(ValidationPopup, {
			props: {
				i18n: mockI18n
			}
		});

		// Total errors: 2 + 5 + 3 + 1 + 2 + 1 = 14
		const headerText = container.querySelector('.popup-header')?.textContent;
		expect(headerText).toContain('14 issues');
		expect(headerText).toContain('6 languages');
	});

	it('should not display languages without errors', () => {
		// Add a language without errors
		(mockI18n as any).availableLocales.push('fr');

		const { container } = render(ValidationPopup, {
			props: {
				i18n: mockI18n
			}
		});

		const options = container.querySelectorAll('select.language-select option');
		const optionTexts = Array.from(options).map((opt) => opt.textContent);

		// Should not contain French since it has no errors
		expect(optionTexts.some((text) => text?.includes('🇫🇷'))).toBe(false);
		expect(optionTexts.some((text) => text?.includes('Français'))).toBe(false);

		// Should still have 6 options (not 7)
		expect(options.length).toBe(6);
	});

	it('should handle languages without metadata gracefully', () => {
		// Add a language with errors but no metadata
		(mockI18n as any).validationErrors['xx-XX'] = ['Missing translation: test'];
		(mockI18n as any).availableLocales.push('xx-XX');

		const { container } = render(ValidationPopup, {
			props: {
				i18n: mockI18n
			}
		});

		const options = container.querySelectorAll('select.language-select option');
		const optionTexts = Array.from(options).map((opt) => opt.textContent);

		// Should display with default flag and uppercase name
		expect(optionTexts.some((text) => text?.includes('🌐'))).toBe(true); // Default flag
		expect(optionTexts.some((text) => text?.includes('XX-XX'))).toBe(true); // Uppercase locale as name
	});
});
