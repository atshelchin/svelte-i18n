import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupI18n, resetI18nForTesting } from '$lib/core/store.svelte.js';

describe('I18n Store', () => {
	beforeEach(() => {
		// Reset global instance
		vi.resetModules();
		resetI18nForTesting();
	});

	describe('setupI18n', () => {
		it('should initialize with default config', () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			expect(i18n.locale).toBe('en');
			expect(i18n.locales).toEqual([]);
			expect(i18n.isLoading).toBe(false);
		});

		it('should support namespace configuration', () => {
			const i18n = setupI18n({
				defaultLocale: 'en',
				namespace: 'myapp'
			});

			expect(i18n.getNamespace()).toBe('myapp');
		});
	});

	describe('loadLanguage', () => {
		it('should load translations from object', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('en', {
				greeting: 'Hello',
				user: {
					name: 'Name'
				}
			});

			expect(i18n.locales).toContain('en');
			expect(i18n.t('greeting')).toBe('Hello');
			expect(i18n.t('user.name')).toBe('Name');
		});

		it('should extract and store language metadata', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('fr', {
				_meta: {
					name: 'Français',
					flag: '🇫🇷',
					direction: 'ltr'
				},
				greeting: 'Bonjour'
			});

			expect(i18n.meta.fr).toEqual({
				name: 'Français',
				flag: '🇫🇷',
				direction: 'ltr'
			});
		});

		it('should validate translations against default locale', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('en', {
				greeting: 'Hello',
				farewell: 'Goodbye'
			});

			await i18n.loadLanguage('fr', {
				greeting: 'Bonjour'
				// Missing 'farewell'
			});

			expect(i18n.errors.fr).toBeDefined();
			expect(i18n.errors.fr.length).toBeGreaterThan(0);
		});
	});

	describe('translation', () => {
		it('should translate simple keys', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('en', {
				hello: 'Hello World'
			});

			expect(i18n.t('hello')).toBe('Hello World');
		});

		it('should support interpolation', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('en', {
				welcome: 'Welcome {name}!'
			});

			expect(i18n.t('welcome', { name: 'Alice' })).toBe('Welcome Alice!');
		});

		it('should support nested keys', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('en', {
				user: {
					profile: {
						title: 'User Profile'
					}
				}
			});

			expect(i18n.t('user.profile.title')).toBe('User Profile');
		});

		it('should handle missing keys', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('en', {});

			// Without a custom handler, it returns the key itself
			expect(i18n.t('missing.key')).toBe('missing.key');
		});

		it('should use custom missing key handler', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en',
				missingKeyHandler: (key, locale) => `[${locale}:${key}]`
			});

			await i18n.loadLanguage('en', {});

			expect(i18n.t('missing.key')).toBe('[en:missing.key]');
		});
	});

	describe('locale switching', () => {
		it('should switch between loaded locales', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('en', { hello: 'Hello' });
			await i18n.loadLanguage('fr', { hello: 'Bonjour' });

			expect(i18n.t('hello')).toBe('Hello');

			await i18n.setLocale('fr');
			expect(i18n.locale).toBe('fr');
			expect(i18n.t('hello')).toBe('Bonjour');

			// Reset locale back to avoid affecting other tests
			await i18n.setLocale('en');
		});

		it('should not switch to unloaded locale', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('en', { hello: 'Hello' });

			const consoleSpy = vi.spyOn(console, 'warn');
			i18n.setLocale('de');

			expect(i18n.locale).toBe('en');
			expect(consoleSpy).toHaveBeenCalledWith(
				'Locale "de" not loaded and not available. Please ensure it\'s loaded via clientLoad() or loadLanguage()'
			);
		});
	});

	describe('formatting', () => {
		it('should format numbers', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('en', {});

			expect(i18n.formatNumber(1234567.89)).toBe('1,234,567.89');
			expect(i18n.formatNumber(0.42, 'percent')).toBe('42%');
		});

		it('should format currency', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('en', {});

			const formatted = i18n.formatCurrency(99.99);
			expect(formatted).toContain('99.99');
		});

		it('should format dates', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('en', {});

			const date = new Date('2024-01-15');
			const formatted = i18n.formatDate(date, 'short');
			expect(formatted).toContain('1');
			expect(formatted).toContain('15');
		});

		it('should format relative time', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('en', {});

			expect(i18n.formatRelativeTime(-1, 'day')).toBe('1 day ago');
			expect(i18n.formatRelativeTime(2, 'hour')).toBe('in 2 hours');
		});

		it('should format lists', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en'
			});

			await i18n.loadLanguage('en', {});

			expect(i18n.formatList(['A', 'B', 'C'])).toBe('A, B, and C');
			expect(i18n.formatList(['X', 'Y'], 'disjunction')).toBe('X or Y');
		});
	});

	describe('namespace isolation', () => {
		it('should support multiple isolated instances', () => {
			const app = setupI18n({
				defaultLocale: 'en',
				namespace: 'app'
			});

			const lib = setupI18n({
				defaultLocale: 'en',
				namespace: 'library'
			});

			expect(app.getNamespace()).toBe('app');
			expect(lib.getNamespace()).toBe('library');
		});

		it('should prevent duplicate validation popups', () => {
			const app = setupI18n({
				defaultLocale: 'en',
				namespace: 'app'
			});

			const lib = setupI18n({
				defaultLocale: 'en',
				namespace: 'library'
			});

			// First instance can show popup
			expect(app.canShowValidationPopup()).toBe(true);
			app.setActiveValidationPopup(true);

			// Second instance should be blocked
			expect(lib.canShowValidationPopup()).toBe(false);

			// Release the popup
			app.setActiveValidationPopup(false);
			expect(lib.canShowValidationPopup()).toBe(true);
		});
	});
});
