import { describe, it, expect, beforeEach } from 'vitest';
import { setupI18n } from './store.svelte.js';
import type { TranslationSchema } from './types.js';

describe('i18n Store', () => {
	let i18n: ReturnType<typeof setupI18n>;

	const enTranslations: TranslationSchema = {
		welcome: 'Welcome {name}!',
		items: {
			count: '{count} item|{count} items'
		},
		nested: {
			deep: {
				key: 'Deep nested value'
			}
		}
	};

	const zhTranslations: TranslationSchema = {
		welcome: '欢迎 {name}！',
		items: {
			count: '{count} 个项目'
		},
		nested: {
			deep: {
				key: '深层嵌套值'
			}
		}
	};

	beforeEach(() => {
		i18n = setupI18n({
			defaultLocale: 'en',
			fallbackLocale: 'en'
		});
	});

	describe('Basic Translation', () => {
		it('should return translation key when no translations loaded', () => {
			expect(i18n.t('welcome')).toBe('welcome');
		});

		it('should translate simple key after loading language', async () => {
			await i18n.loadLanguage('en', enTranslations);
			expect(i18n.t('welcome', { name: 'World' })).toBe('Welcome World!');
		});

		it('should handle nested keys', async () => {
			await i18n.loadLanguage('en', enTranslations);
			expect(i18n.t('nested.deep.key')).toBe('Deep nested value');
		});
	});

	describe('Interpolation', () => {
		it('should interpolate values', async () => {
			await i18n.loadLanguage('en', enTranslations);
			expect(i18n.t('welcome', { name: 'Svelte' })).toBe('Welcome Svelte!');
		});

		it('should handle missing interpolation params', async () => {
			await i18n.loadLanguage('en', enTranslations);
			expect(i18n.t('welcome')).toBe('Welcome {name}!');
		});
	});

	describe('Pluralization', () => {
		it('should handle singular form', async () => {
			await i18n.loadLanguage('en', enTranslations);
			expect(i18n.t('items.count', { count: 1 })).toBe('1 item');
		});

		it('should handle plural form', async () => {
			await i18n.loadLanguage('en', enTranslations);
			expect(i18n.t('items.count', { count: 5 })).toBe('5 items');
		});

		it('should handle zero count', async () => {
			await i18n.loadLanguage('en', enTranslations);
			expect(i18n.t('items.count', { count: 0 })).toBe('0 item');
		});
	});

	describe('Language Switching', () => {
		it('should switch between languages', async () => {
			await i18n.loadLanguage('en', enTranslations);
			await i18n.loadLanguage('zh', zhTranslations);

			i18n.setLocale('en');
			expect(i18n.t('welcome', { name: 'World' })).toBe('Welcome World!');

			i18n.setLocale('zh');
			expect(i18n.t('welcome', { name: '世界' })).toBe('欢迎 世界！');
		});

		it('should fall back to default locale for missing translations', async () => {
			await i18n.loadLanguage('en', enTranslations);
			await i18n.loadLanguage('zh', { welcome: '欢迎!' }); // Missing nested keys

			i18n.setLocale('zh');
			expect(i18n.t('nested.deep.key')).toBe('Deep nested value'); // Falls back to en
		});
	});

	describe('Formatting', () => {
		it('should format dates', async () => {
			await i18n.loadLanguage('en', enTranslations);
			const date = new Date('2024-01-15');
			const formatted = i18n.formatDate(date);
			expect(formatted).toContain('2024');
		});

		it('should format numbers', async () => {
			await i18n.loadLanguage('en', enTranslations);
			const formatted = i18n.formatNumber(1234.56);
			expect(formatted).toContain('1');
			expect(formatted).toContain('234');
		});
	});

	describe('Validation', () => {
		it('should validate correct translations', async () => {
			await i18n.loadLanguage('en', enTranslations);
			await i18n.loadLanguage('zh', zhTranslations);

			const isValid = i18n.validateTranslations('zh', enTranslations);
			expect(isValid).toBe(true);
		});

		it('should detect missing translations', async () => {
			await i18n.loadLanguage('en', enTranslations);
			await i18n.loadLanguage('zh', { welcome: '欢迎!' }); // Missing keys

			const isValid = i18n.validateTranslations('zh', enTranslations);
			expect(isValid).toBe(false);
		});
	});

	describe('Namespace Support', () => {
		it('should handle namespaced translations', async () => {
			const namespacedI18n = setupI18n({
				defaultLocale: 'en',
				namespace: 'myapp'
			});

			await namespacedI18n.loadLanguage('en', enTranslations);
			
			// Set locale explicitly to ensure it's correct
			await namespacedI18n.setLocale('en');
			
			// Verify translations are loaded
			expect(namespacedI18n.locales).toContain('en');
			expect(namespacedI18n.locale).toBe('en');
			
			// Namespace doesn't affect how translations work - it's for separation between packages
			// The namespace is used for auto-discovery and preventing conflicts
			expect(namespacedI18n.t('welcome', { name: 'World' })).toBe('Welcome World!');
		});
	});
});
