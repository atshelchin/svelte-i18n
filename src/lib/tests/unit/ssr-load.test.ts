import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadI18nSSR, i18nServerLoad } from '$lib/kit/ssr-load.js';
import { setupI18n, clearAllInstances } from '$lib/core/store.svelte.js';
import {
	registerBuiltInTranslations,
	clearRegisteredTranslations
} from '$lib/services/built-in-loader.js';

// Helper to load translations synchronously in tests
function loadTranslationsSync(i18n: any, translations: Record<string, any>) {
	for (const [locale, data] of Object.entries(translations)) {
		if (i18n.loadLanguageSync) {
			i18n.loadLanguageSync(locale, data);
		} else {
			// Fallback if method doesn't exist
			if (!i18n.translations) i18n.translations = {};
			i18n.translations[locale] = data;
			if (!i18n.locales.includes(locale)) {
				i18n.locales.push(locale);
			}
		}
	}
}

// Mock the ssr-file-loader module
vi.mock('$lib/services/ssr-file-loader.js', () => ({
	isAutoDiscoveredLocale: vi.fn((locale: string, namespace: string) => {
		// Mock auto-discovered locales for testing
		if (namespace === 'app') {
			return ['ko', 'fr', 'de'].includes(locale);
		}
		return false;
	}),
	loadServerTranslations: vi.fn((i18n: any, locale: string, namespace: string) => {
		// Mock loading translations on server
		if (namespace === 'app' && ['ko', 'fr', 'de'].includes(locale)) {
			// Simulate loading translations
			if (!i18n.translations) {
				i18n.translations = {};
			}
			i18n.translations[locale] = {
				hello: `Hello in ${locale}`,
				welcome: `Welcome in ${locale}`
			};
			if (!i18n.locales.includes(locale)) {
				i18n.locales.push(locale);
			}
			return true;
		}
		return false;
	})
}));

// Mock fs module for auto-discovery config
vi.mock('fs', () => ({
	existsSync: vi.fn(() => true),
	readFileSync: vi.fn(() =>
		JSON.stringify({
			autoDiscovery: {
				app: ['ko', 'fr', 'de'],
				packages: {
					'test-pkg': ['es', 'it']
				}
			}
		})
	)
}));

// Mock path module
vi.mock('path', () => ({
	join: vi.fn((...args) => args.join('/'))
}));

describe('SSR Load Functions', () => {
	beforeEach(() => {
		clearRegisteredTranslations();
		clearAllInstances();
		vi.clearAllMocks();

		// Reset global window for SSR tests
		(global as any).window = undefined;
	});

	afterEach(() => {
		clearRegisteredTranslations();
		clearAllInstances();
	});

	describe('loadI18nSSR', () => {
		it('should detect and use pathname locale for built-in languages', async () => {
			// Setup built-in translations
			registerBuiltInTranslations({
				app: {
					en: { welcome: 'Welcome' },
					zh: { welcome: '欢迎' },
					ja: { welcome: 'ようこそ' }
				}
			});

			const i18n = setupI18n({
				defaultLocale: 'en',
				fallbackLocale: 'en',
				namespace: 'app'
			});

			// Load built-in translations (simulate server load)
			loadTranslationsSync(i18n, {
				en: { welcome: 'Welcome' },
				zh: { welcome: '欢迎' },
				ja: { welcome: 'ようこそ' }
			});

			const cookies = {
				get: () => undefined // No cookie
			};

			const url = { pathname: '/zh/about' };

			// Test
			const result = await loadI18nSSR(i18n, cookies as any, url);

			// Assertions
			expect(result.locale).toBe('zh');
			expect(result.locales).toContain('zh');
			expect(result.i18nReady).toBe(true);
			expect(result.ssrTranslations).toBeUndefined(); // Built-in locale, no SSR translations needed
			expect(result.isAutoDiscovered).toBe(false);
		});

		it('should prioritize pathname locale over cookie locale', async () => {
			registerBuiltInTranslations({
				app: {
					en: { test: 'English' },
					zh: { test: 'Chinese' },
					ja: { test: 'Japanese' }
				}
			});

			const i18n = setupI18n({
				defaultLocale: 'en',
				fallbackLocale: 'en',
				namespace: 'app'
			});

			loadTranslationsSync(i18n, {
				en: { test: 'English' },
				zh: { test: 'Chinese' },
				ja: { test: 'Japanese' }
			});

			const cookies = {
				get: (name: string) => (name === 'i18n-locale' ? 'ja' : undefined)
			};

			const url = { pathname: '/zh/products' };

			const result = await loadI18nSSR(i18n, cookies as any, url);

			// Should use zh from pathname, not ja from cookie
			expect(result.locale).toBe('zh');
			expect(i18n.locale).toBe('zh');
		});

		it('should fall back to cookie locale when no pathname locale', async () => {
			registerBuiltInTranslations({
				app: {
					en: { test: 'English' },
					ja: { test: 'Japanese' }
				}
			});

			const i18n = setupI18n({
				defaultLocale: 'en',
				fallbackLocale: 'en',
				namespace: 'app'
			});

			loadTranslationsSync(i18n, {
				en: { test: 'English' },
				ja: { test: 'Japanese' }
			});

			const cookies = {
				get: (name: string) => (name === 'i18n-locale' ? 'ja' : undefined)
			};

			const url = { pathname: '/about' }; // No locale in pathname

			const result = await loadI18nSSR(i18n, cookies as any, url);

			// Should use ja from cookie
			expect(result.locale).toBe('ja');
			expect(i18n.locale).toBe('ja');
		});

		it('should handle auto-discovered locale and return ssrTranslations', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en',
				fallbackLocale: 'en',
				namespace: 'app'
			});

			// Initially only has English
			loadTranslationsSync(i18n, {
				en: { test: 'English' }
			});

			const cookies = {
				get: (name: string) => (name === 'i18n-locale' ? 'ko' : undefined)
			};

			const result = await loadI18nSSR(i18n, cookies as any);

			// Should load and return Korean translations
			expect(result.locale).toBe('ko');
			expect(result.isAutoDiscovered).toBe(true);
			expect(result.ssrTranslations).toBeDefined();
			expect(result.ssrTranslations).toEqual({
				hello: 'Hello in ko',
				welcome: 'Welcome in ko'
			});
			expect(result.locales).toContain('ko'); // Should include auto-discovered
		});

		it('should detect auto-discovered locale from pathname', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en',
				fallbackLocale: 'en',
				namespace: 'app'
			});

			loadTranslationsSync(i18n, {
				en: { test: 'English' }
			});

			const cookies = {
				get: () => undefined
			};

			const url = { pathname: '/fr/contact' };

			const result = await loadI18nSSR(i18n, cookies as any, url);

			// Should detect and load French
			expect(result.locale).toBe('fr');
			expect(result.isAutoDiscovered).toBe(true);
			expect(result.ssrTranslations).toBeDefined();
			expect(result.ssrTranslations).toEqual({
				hello: 'Hello in fr',
				welcome: 'Welcome in fr'
			});
		});

		it('should use default locale when no pathname or cookie locale', async () => {
			const i18n = setupI18n({
				defaultLocale: 'zh',
				fallbackLocale: 'en',
				namespace: 'app'
			});

			loadTranslationsSync(i18n, {
				zh: { test: 'Chinese' },
				en: { test: 'English' }
			});

			const cookies = {
				get: () => undefined
			};

			const result = await loadI18nSSR(i18n, cookies as any);

			// Should use default locale
			expect(result.locale).toBe('zh');
			expect(i18n.locale).toBe('zh');
		});

		it('should respect custom cookie name', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en',
				fallbackLocale: 'en',
				namespace: 'app'
			});

			loadTranslationsSync(i18n, {
				en: { test: 'English' },
				ja: { test: 'Japanese' }
			});

			const cookies = {
				get: (name: string) => (name === 'custom-locale' ? 'ja' : undefined)
			};

			const result = await loadI18nSSR(i18n, cookies as any, undefined, {
				cookieName: 'custom-locale'
			});

			expect(result.locale).toBe('ja');
			expect(result.cookieName).toBe('custom-locale');
		});

		it('should include all available locales in response', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en',
				fallbackLocale: 'en',
				namespace: 'app'
			});

			loadTranslationsSync(i18n, {
				en: { test: 'English' },
				zh: { test: 'Chinese' }
			});

			const cookies = {
				get: () => undefined
			};

			const result = await loadI18nSSR(i18n, cookies as any);

			// Should include built-in and auto-discovered locales
			expect(result.locales).toContain('en');
			expect(result.locales).toContain('zh');
			expect(result.locales).toContain('ko'); // From mock auto-discovery config
			expect(result.locales).toContain('fr');
			expect(result.locales).toContain('de');
		});

		it('should handle package namespace correctly', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en',
				fallbackLocale: 'en',
				namespace: 'test-pkg'
			});

			loadTranslationsSync(i18n, {
				en: { test: 'English' }
			});

			const cookies = {
				get: () => undefined
			};

			const result = await loadI18nSSR(i18n, cookies as any);

			expect(result.namespace).toBe('test-pkg');
			// Package locales from mock config
			expect(result.locales).toContain('es');
			expect(result.locales).toContain('it');
		});

		it('should handle invalid pathname locale gracefully', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en',
				fallbackLocale: 'en',
				namespace: 'app'
			});

			loadTranslationsSync(i18n, {
				en: { test: 'English' }
			});

			const cookies = {
				get: () => undefined
			};

			const url = { pathname: '/invalid-locale/page' };

			const result = await loadI18nSSR(i18n, cookies as any, url);

			// Should fall back to default
			expect(result.locale).toBe('en');
			expect(result.isAutoDiscovered).toBe(false);
		});
	});

	describe('i18nServerLoad (backward compatibility)', () => {
		it('should work without URL parameter', async () => {
			registerBuiltInTranslations({
				app: {
					en: { test: 'English' },
					zh: { test: 'Chinese' }
				}
			});

			const i18n = setupI18n({
				defaultLocale: 'en',
				fallbackLocale: 'en',
				namespace: 'app'
			});

			loadTranslationsSync(i18n, {
				en: { test: 'English' },
				zh: { test: 'Chinese' }
			});

			const cookies = {
				get: (name: string) => (name === 'i18n-locale' ? 'zh' : undefined)
			};

			// Use deprecated function
			const result = await i18nServerLoad(i18n, cookies as any);

			// Should work the same but without pathname detection
			expect(result.locale).toBe('zh');
			expect(result.i18nReady).toBe(true);
			expect(result).toHaveProperty('locales');
			expect(result).toHaveProperty('ssrTranslations');
		});

		it('should accept options parameter', async () => {
			const i18n = setupI18n({
				defaultLocale: 'en',
				fallbackLocale: 'en',
				namespace: 'app'
			});

			loadTranslationsSync(i18n, {
				en: { test: 'English' }
			});

			const cookies = {
				get: () => undefined
			};

			const result = await i18nServerLoad(i18n, cookies as any, {
				defaultLocale: 'zh',
				cookieName: 'my-locale'
			});

			expect(result.locale).toBe('zh');
			expect(result.cookieName).toBe('my-locale');
		});
	});
});
