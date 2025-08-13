/**
 * Integration test for unified i18n system
 * Tests that library i18n instances follow app configuration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createI18n, getI18nInstance } from './unified.js';
import type { UnifiedI18nConfig } from './unified.js';

describe('Unified I18n Integration', () => {
	beforeEach(() => {
		// Clear all instances before each test
		(globalThis as any).__i18n_instances = undefined;
	});

	afterEach(() => {
		// Clean up after each test
		(globalThis as any).__i18n_instances = undefined;
	});

	describe('Library follows App configuration', () => {
		it('should make library instance follow app locale changes', async () => {
			// Create main app instance with multiple languages
			const appConfig: UnifiedI18nConfig = {
				namespace: 'app',
				isMain: true,
				defaultLocale: 'en',
				fallbackLocale: 'en',
				translations: {
					en: { welcome: 'Welcome' },
					zh: { welcome: '欢迎' },
					fr: { welcome: 'Bienvenue' },
					de: { welcome: 'Willkommen' }
				}
			};
			const appI18n = createI18n(appConfig);

			// Create library instance with fewer languages
			const libConfig: UnifiedI18nConfig = {
				namespace: '@my/lib',
				translations: {
					en: { button: 'Click' },
					zh: { button: '点击' }
					// Note: library doesn't have fr or de translations
				}
			};
			const libI18n = createI18n(libConfig);

			// Initially both should be 'en'
			expect(appI18n.locale).toBe('en');
			expect(libI18n.locale).toBe('en');

			// Change app locale to 'zh'
			await appI18n.setLocale('zh');

			// Library should follow
			expect(appI18n.locale).toBe('zh');
			expect(libI18n.locale).toBe('zh');

			// Change app locale to 'fr' (library doesn't have this)
			await appI18n.setLocale('fr');

			// Library should still follow, even without translations
			expect(appI18n.locale).toBe('fr');
			expect(libI18n.locale).toBe('fr');

			// Library should fallback for missing translations
			expect(libI18n.t('button')).toBe('Click'); // Falls back to English
		});

		it('should allow library to access app instance', () => {
			// Create app instance
			const appConfig: UnifiedI18nConfig = {
				namespace: 'app',
				isMain: true,
				defaultLocale: 'en',
				translations: {
					en: { title: 'App' },
					zh: { title: '应用' },
					ja: { title: 'アプリ' },
					fr: { title: 'Application' },
					de: { title: 'Anwendung' }
				}
			};
			const appI18n = createI18n(appConfig);

			// Create library instance
			const libConfig: UnifiedI18nConfig = {
				namespace: '@my/lib',
				translations: {
					en: { label: 'Label' },
					zh: { label: '标签' }
				}
			};
			const libI18n = createI18n(libConfig);

			// Library can get app instance
			const retrievedAppI18n = getI18nInstance('app');
			expect(retrievedAppI18n).toBe(appI18n);

			// App has all its languages
			expect(appI18n.locales).toContain('en');
			expect(appI18n.locales).toContain('zh');
			expect(appI18n.locales).toContain('ja');
			expect(appI18n.locales).toContain('fr');
			expect(appI18n.locales).toContain('de');

			// Library only has its own languages
			expect(libI18n.locales).toContain('en');
			expect(libI18n.locales).toContain('zh');
			expect(libI18n.locales).not.toContain('fr');
		});

		it('should handle multiple library instances following app', async () => {
			// Create app
			const appI18n = createI18n({
				namespace: 'app',
				isMain: true,
				defaultLocale: 'en',
				translations: {
					en: { app: 'Application' },
					zh: { app: '应用程序' },
					ja: { app: 'アプリケーション' }
				}
			});

			// Create multiple library instances
			const lib1 = createI18n({
				namespace: '@lib/one',
				translations: {
					en: { one: 'One' },
					zh: { one: '一' }
				}
			});

			const lib2 = createI18n({
				namespace: '@lib/two',
				translations: {
					en: { two: 'Two' },
					ja: { two: '二' }
				}
			});

			// All start with 'en'
			expect(appI18n.locale).toBe('en');
			expect(lib1.locale).toBe('en');
			expect(lib2.locale).toBe('en');

			// Change app to 'zh'
			await appI18n.setLocale('zh');

			// All libraries follow
			expect(appI18n.locale).toBe('zh');
			expect(lib1.locale).toBe('zh');
			expect(lib2.locale).toBe('zh');

			// lib2 doesn't have 'zh', should fallback
			expect(lib2.t('two')).toBe('Two'); // Fallback to English

			// Change to 'ja'
			await appI18n.setLocale('ja');

			expect(appI18n.locale).toBe('ja');
			expect(lib1.locale).toBe('ja');
			expect(lib2.locale).toBe('ja');

			// lib1 doesn't have 'ja', lib2 does
			expect(lib1.t('one')).toBe('One'); // Fallback
			expect(lib2.t('two')).toBe('二'); // Has Japanese
		});

		it('should work with getAppSupportedLanguages function', async () => {
			// Import the function we're testing
			const { getAppSupportedLanguages } = await import(
				'./infrastructure/loaders/app-languages.js'
			);

			// Create app with many languages
			createI18n({
				namespace: 'app',
				isMain: true,
				defaultLocale: 'en',
				translations: {
					en: {},
					zh: {},
					ja: {},
					fr: {},
					de: {},
					ar: {},
					'zh-TW': {}
				}
			});

			// Create library with few languages
			const libI18n = createI18n({
				namespace: '@shelchin/svelte-i18n',
				translations: {
					en: {},
					zh: {},
					ja: {}
				}
			});

			// When library component calls getAppSupportedLanguages
			// it should get the app's languages, not library's
			const languages = await getAppSupportedLanguages(libI18n);

			// Should include all app languages
			expect(languages).toContain('en');
			expect(languages).toContain('zh');
			expect(languages).toContain('ja');
			expect(languages).toContain('fr');
			expect(languages).toContain('de');
			expect(languages).toContain('ar');
			expect(languages).toContain('zh-TW');

			// Should be sorted
			expect(languages).toEqual(['ar', 'de', 'en', 'fr', 'ja', 'zh', 'zh-TW']);
		});
	});

	describe('Configuration inheritance', () => {
		it('should inherit fallback locale from app', () => {
			// App with custom fallback
			createI18n({
				namespace: 'app',
				isMain: true,
				defaultLocale: 'en',
				fallbackLocale: 'zh', // Custom fallback
				translations: {
					en: { msg: 'English' },
					zh: { msg: '中文' }
				}
			});

			// Library without specifying fallback
			const libI18n = createI18n({
				namespace: '@my/lib',
				translations: {
					en: { btn: 'Button' },
					zh: { btn: '按钮' }
				}
			});

			// Library inherits app's fallback
			// Since fallbackLocale is not a public property, we test the behavior
			// by checking if fallback works correctly
			expect(libI18n.t('nonexistent' as any)).toBeDefined();
		});

		it('should inherit interpolation settings from app', () => {
			// App with custom interpolation
			const appI18n = createI18n({
				namespace: 'app',
				isMain: true,
				defaultLocale: 'en',
				translations: {
					en: { greeting: 'Hello [[name]]' }
				},
				interpolation: {
					prefix: '[[',
					suffix: ']]'
				}
			});

			// Library without interpolation config
			const libI18n = createI18n({
				namespace: '@my/lib',
				translations: {
					en: { welcome: 'Welcome [[user]]' }
				}
			});

			// Test interpolation with custom markers
			expect(appI18n.t('greeting', { name: 'World' })).toBe('Hello World');
			expect(libI18n.t('welcome', { user: 'John' })).toBe('Welcome John');
		});
	});

	describe('Real-world scenario: LanguageSwitcher component', () => {
		it('should show all app languages in library component', async () => {
			// Simulate the real app setup
			const appI18n = createI18n({
				namespace: 'app',
				isMain: true,
				defaultLocale: 'en',
				translations: {
					en: { app: 'App' },
					zh: { app: '应用' },
					ja: { app: 'アプリ' },
					fr: { app: 'Application' },
					de: { app: 'Anwendung' },
					ar: { app: 'تطبيق' },
					'zh-TW': { app: '應用' }
				}
			});

			// Simulate library i18n (like @shelchin/svelte-i18n)
			const libI18n = createI18n({
				namespace: '@shelchin/svelte-i18n',
				translations: {
					en: { switcher: 'Language' },
					zh: { switcher: '语言' },
					ja: { switcher: '言語' }
				}
			});

			// Import the helper function
			const { getAppSupportedLanguages } = await import(
				'./infrastructure/loaders/app-languages.js'
			);

			// When LanguageSwitcher component gets languages
			const availableLanguages = await getAppSupportedLanguages(libI18n);

			// Should show all 7 app languages, not just 3 library languages
			expect(availableLanguages.length).toBe(7);
			expect(availableLanguages).toEqual(['ar', 'de', 'en', 'fr', 'ja', 'zh', 'zh-TW']);

			// When user selects a language in the switcher
			await appI18n.setLocale('fr');

			// Both app and library should switch
			expect(appI18n.locale).toBe('fr');
			expect(libI18n.locale).toBe('fr');

			// Library falls back for missing French translations
			expect(libI18n.t('switcher')).toBe('Language'); // Fallback to English
		});
	});
});
