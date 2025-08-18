/**
 * Unit tests for client-init.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	setupI18nClient,
	initI18nOnMount,
	i18nIsReady,
	i18nClientInit
} from '$lib/kit/client-init.js';

// Mock browser environment
vi.mock('$app/environment', () => ({
	browser: true
}));

describe('Client Init Functions', () => {
	let mockI18n: any;
	let originalLocalStorage: Storage;
	let localStorageData: Record<string, string> = {};

	beforeEach(() => {
		// Mock localStorage
		originalLocalStorage = global.localStorage;
		localStorageData = {};
		global.localStorage = {
			getItem: vi.fn((key: string) => localStorageData[key] || null),
			setItem: vi.fn((key: string, value: string) => {
				localStorageData[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete localStorageData[key];
			}),
			clear: vi.fn(() => {
				localStorageData = {};
			}),
			length: 0,
			key: vi.fn()
		} as Storage;

		// Mock i18n instance
		mockI18n = {
			locale: 'en',
			locales: ['en', 'zh', 'ja'],
			availableLocales: ['en', 'zh', 'ja', 'ko', 'es'],
			setLocale: vi.fn().mockImplementation(async (locale: string) => {
				mockI18n.locale = locale;
			}),
			setLocaleSync: vi.fn().mockImplementation((locale: string) => {
				mockI18n.locale = locale;
			}),
			loadLanguageSync: vi.fn(),
			clientLoad: vi.fn().mockResolvedValue(undefined),
			subscribe: vi.fn()
		};
	});

	afterEach(() => {
		global.localStorage = originalLocalStorage;
		vi.clearAllMocks();
	});

	describe('setupI18nClient', () => {
		it('should setup i18n with SSR translations', () => {
			const data = {
				locale: 'zh',
				locales: ['en', 'zh', 'ja'],
				ssrTranslations: { welcome: '欢迎' }
			};

			const result = setupI18nClient(mockI18n, data);

			expect(mockI18n.loadLanguageSync).toHaveBeenCalledWith('zh', { welcome: '欢迎' });
			expect(result).toEqual({
				locale: 'zh',
				locales: ['en', 'zh', 'ja'],
				i18nReady: true
			});
		});

		it('should prioritize stored locale over SSR data', () => {
			localStorageData['i18n-locale'] = 'ja';
			const data = {
				locale: 'zh',
				locales: ['en', 'zh', 'ja']
			};

			const result = setupI18nClient(mockI18n, data);

			expect(mockI18n.setLocaleSync).toHaveBeenCalledWith('ja');
			expect(result.locale).toBe('ja');
		});

		it('should use SSR locale when no stored locale exists', () => {
			const data = {
				locale: 'zh',
				locales: ['en', 'zh', 'ja']
			};

			const result = setupI18nClient(mockI18n, data);

			expect(mockI18n.setLocaleSync).toHaveBeenCalledWith('zh');
			expect(localStorage.setItem).toHaveBeenCalledWith('i18n-locale', 'zh');
			expect(result.locale).toBe('zh');
		});

		it('should handle missing setLocaleSync method', () => {
			delete mockI18n.setLocaleSync;
			const data = {
				locale: 'zh',
				locales: ['en', 'zh', 'ja']
			};

			const result = setupI18nClient(mockI18n, data);

			expect(mockI18n.setLocale).toHaveBeenCalledWith('zh');
			expect(result.locale).toBe('zh');
		});

		it('should use custom storage key', () => {
			const data = { locale: 'zh' };
			const options = { storageKey: 'custom-key' };

			setupI18nClient(mockI18n, data, options);

			expect(localStorage.setItem).toHaveBeenCalledWith('custom-key', 'zh');
		});

		it('should handle localStorage errors gracefully', () => {
			global.localStorage.setItem = vi.fn(() => {
				throw new Error('Storage quota exceeded');
			});
			global.localStorage.getItem = vi.fn(() => {
				throw new Error('Storage access denied');
			});

			const data = { locale: 'zh' };
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			const result = setupI18nClient(mockI18n, data);

			expect(consoleSpy).toHaveBeenCalled();
			expect(result).toEqual({
				locale: 'zh',
				locales: ['en', 'zh', 'ja'],
				i18nReady: true
			});

			consoleSpy.mockRestore();
		});

		it('should not save to localStorage when using stored locale', () => {
			localStorageData['i18n-locale'] = 'ja';
			const data = { locale: 'zh' };

			vi.clearAllMocks(); // Clear previous calls
			setupI18nClient(mockI18n, data);

			// Should read from localStorage but not write back the stored value
			expect(localStorage.getItem).toHaveBeenCalledWith('i18n-locale');
			expect(localStorage.setItem).not.toHaveBeenCalled();
		});

		it('should handle invalid stored locale', () => {
			localStorageData['i18n-locale'] = 'invalid';
			mockI18n.locales = ['en', 'zh'];
			const data = { locale: 'zh' };

			const result = setupI18nClient(mockI18n, data);

			// Should fall back to SSR data
			expect(mockI18n.setLocaleSync).toHaveBeenCalledWith('zh');
			expect(result.locale).toBe('zh');
		});
	});

	describe('initI18nOnMount', () => {
		it('should call init function when provided', async () => {
			const initFunction = vi.fn().mockResolvedValue(undefined);

			await initI18nOnMount(mockI18n, {}, { initFunction });

			expect(initFunction).toHaveBeenCalledWith(mockI18n);
		});

		it('should restore locale from localStorage', async () => {
			localStorageData['i18n-locale'] = 'zh';

			await initI18nOnMount(mockI18n, {});

			expect(mockI18n.setLocale).toHaveBeenCalledWith('zh');
		});

		it('should check availableLocales when locale not in locales', async () => {
			localStorageData['i18n-locale'] = 'ko';
			mockI18n.locales = ['en', 'zh'];
			mockI18n.availableLocales = ['en', 'zh', 'ko'];

			await initI18nOnMount(mockI18n, {});

			expect(mockI18n.setLocale).toHaveBeenCalledWith('ko');
		});

		it('should not set locale if not available', async () => {
			localStorageData['i18n-locale'] = 'invalid';

			await initI18nOnMount(mockI18n, {});

			expect(mockI18n.setLocale).not.toHaveBeenCalled();
		});

		it('should use custom storage key', async () => {
			localStorageData['custom-key'] = 'ja';

			await initI18nOnMount(mockI18n, {}, { storageKey: 'custom-key' });

			expect(mockI18n.setLocale).toHaveBeenCalledWith('ja');
		});

		it('should handle localStorage errors', async () => {
			global.localStorage.getItem = vi.fn(() => {
				throw new Error('Storage access denied');
			});
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			await initI18nOnMount(mockI18n, {});

			expect(consoleSpy).toHaveBeenCalled();
			consoleSpy.mockRestore();
		});

		it('should subscribe to locale changes', async () => {
			mockI18n.subscribe = vi.fn();

			await initI18nOnMount(mockI18n, {});

			expect(mockI18n.subscribe).toHaveBeenCalled();
		});

		it('should save locale changes to localStorage via subscription', async () => {
			let subscribeCallback: any;
			mockI18n.subscribe = vi.fn((cb) => {
				subscribeCallback = cb;
			});

			await initI18nOnMount(mockI18n, {});

			// Simulate locale change
			subscribeCallback({ locale: 'ja' });

			expect(localStorage.setItem).toHaveBeenCalledWith('i18n-locale', 'ja');
		});

		it('should handle subscription errors gracefully', async () => {
			let subscribeCallback: any;
			mockI18n.subscribe = vi.fn((cb) => {
				subscribeCallback = cb;
			});
			global.localStorage.setItem = vi.fn(() => {
				throw new Error('Storage error');
			});
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			await initI18nOnMount(mockI18n, {});
			subscribeCallback({ locale: 'ja' });

			expect(consoleSpy).toHaveBeenCalled();
			consoleSpy.mockRestore();
		});

		it('should return i18n ready state', async () => {
			const result = await initI18nOnMount(mockI18n, {});

			expect(result).toEqual({
				locale: mockI18n.locale, // Will be the current locale
				locales: ['en', 'zh', 'ja'],
				i18nReady: true
			});
		});
	});

	describe('i18nIsReady', () => {
		it('should return true when locale is loaded', () => {
			mockI18n.locale = 'zh';
			mockI18n.locales = ['en', 'zh', 'ja'];

			expect(i18nIsReady(mockI18n, { locale: 'zh' })).toBe(true);
		});

		it('should use i18n locale when data locale not provided', () => {
			mockI18n.locale = 'en';
			mockI18n.locales = ['en', 'zh'];

			expect(i18nIsReady(mockI18n, {})).toBe(true);
		});

		it('should return false when locale not loaded', () => {
			mockI18n.locale = 'ko';
			mockI18n.locales = ['en', 'zh'];

			expect(i18nIsReady(mockI18n, { locale: 'ko' })).toBe(false);
		});
	});

	describe('i18nClientInit (deprecated)', () => {
		it('should call both setupI18nClient and initI18nOnMount', async () => {
			const data = { locale: 'zh' };
			const options = { storageKey: 'custom-key' };

			const result = await i18nClientInit(mockI18n, data, options);

			expect(mockI18n.setLocaleSync).toHaveBeenCalled();
			expect(result).toEqual({
				locale: 'zh', // Should be 'zh' after setLocaleSync is called
				locales: ['en', 'zh', 'ja'],
				i18nReady: true
			});
		});

		it('should handle autoLoad option', async () => {
			const data = { locale: 'zh' };
			const options = { autoLoad: true };

			await i18nClientInit(mockI18n, data, options);

			expect(mockI18n.setLocaleSync).toHaveBeenCalled();
		});

		it('should pass init function through', async () => {
			const initFunction = vi.fn().mockResolvedValue(undefined);
			const data = {};
			const options = { initFunction };

			await i18nClientInit(mockI18n, data, options);

			expect(initFunction).toHaveBeenCalled();
		});
	});
});
