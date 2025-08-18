/**
 * Unit tests for universal-load.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadI18nUniversal, i18nUniversalLoad } from '$lib/kit/universal-load.js';

// Mock browser environment
let mockBrowser = true;
vi.mock('$app/environment', () => ({
	get browser() {
		return mockBrowser;
	}
}));

describe('Universal Load Functions', () => {
	let mockI18n: any;
	let originalLocalStorage: Storage;
	let localStorageData: Record<string, string> = {};
	let originalWindow: any;

	beforeEach(() => {
		// Reset browser mock
		mockBrowser = true;

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

		// Mock window
		originalWindow = global.window;
		global.window = {
			...global.window,
			location: {
				origin: 'http://localhost:3000',
				pathname: '/',
				search: '',
				hash: ''
			}
		} as any;

		// Mock i18n instance
		mockI18n = {
			locale: 'en',
			locales: ['en', 'zh', 'ja'],
			availableLocales: ['en', 'zh', 'ja', 'ko', 'es'],
			setLocale: vi.fn().mockImplementation(async (locale: string) => {
				mockI18n.locale = locale;
			}),
			clientLoad: vi.fn().mockResolvedValue(undefined),
			localeRestored: false
		};
	});

	afterEach(() => {
		global.localStorage = originalLocalStorage;
		global.window = originalWindow;
		vi.clearAllMocks();
	});

	describe('loadI18nUniversal', () => {
		describe('Client-side behavior', () => {
			it('should call clientLoad with skipLocaleRestore', async () => {
				const data = { locale: 'zh', locales: ['en', 'zh'] };

				await loadI18nUniversal(mockI18n, data);

				expect(mockI18n.clientLoad).toHaveBeenCalledWith({ skipLocaleRestore: true });
			});

			it('should restore locale from localStorage', async () => {
				localStorageData['i18n-locale'] = 'ja';
				const data = { locale: 'zh' };

				await loadI18nUniversal(mockI18n, data);

				expect(mockI18n.setLocale).toHaveBeenCalledWith('ja');
			});

			it('should mark locale as restored after setting from localStorage', async () => {
				localStorageData['i18n-locale'] = 'zh';
				const data = {};

				await loadI18nUniversal(mockI18n, data);

				expect(mockI18n.localeRestored).toBe(true);
			});

			it('should use server locale when no stored locale', async () => {
				const data = { locale: 'zh' };

				await loadI18nUniversal(mockI18n, data);

				expect(mockI18n.setLocale).toHaveBeenCalledWith('zh');
			});

			it('should keep current locale when no stored or server locale', async () => {
				mockI18n.locale = 'en';
				const data = {};

				await loadI18nUniversal(mockI18n, data);

				expect(mockI18n.setLocale).not.toHaveBeenCalled();
				expect(mockI18n.localeRestored).toBe(true);
			});

			it('should handle clientLoad errors gracefully', async () => {
				mockI18n.clientLoad = vi.fn().mockRejectedValue(new Error('Load failed'));
				const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
				const data = {};

				await loadI18nUniversal(mockI18n, data);

				expect(consoleSpy).toHaveBeenCalledWith(
					'[loadI18nUniversal] clientLoad failed:',
					expect.any(Error)
				);
				consoleSpy.mockRestore();
			});

			it('should handle localStorage errors gracefully', async () => {
				global.localStorage.getItem = vi.fn(() => {
					throw new Error('Storage error');
				});
				const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
				const data = { locale: 'zh' };

				await loadI18nUniversal(mockI18n, data);

				// Should fall back to server locale
				expect(mockI18n.setLocale).toHaveBeenCalledWith('zh');
				expect(consoleSpy).toHaveBeenCalled();
				consoleSpy.mockRestore();
			});

			it('should use custom storage key', async () => {
				localStorageData['custom-key'] = 'ja';
				const data = {};
				const options = { storageKey: 'custom-key' };

				await loadI18nUniversal(mockI18n, data, undefined, options);

				expect(mockI18n.setLocale).toHaveBeenCalledWith('ja');
			});

			it('should wait for async operations to complete', async () => {
				localStorageData['i18n-locale'] = 'zh';
				const data = {};

				// Add delay to simulate async operation
				let resolveLater: any;
				const delayedPromise = new Promise((resolve) => {
					resolveLater = resolve;
				});

				mockI18n.setLocale = vi.fn((locale: string) => {
					mockI18n.locale = locale;
					setTimeout(() => resolveLater(), 5);
					return delayedPromise;
				});

				await loadI18nUniversal(mockI18n, data);

				expect(mockI18n.setLocale).toHaveBeenCalledWith('zh');
			});

			it('should not call setLocale if locale matches current', async () => {
				mockI18n.locale = 'zh';
				const data = { locale: 'zh' };

				await loadI18nUniversal(mockI18n, data);

				// Should not call setLocale since locale is already correct
				expect(mockI18n.setLocale).not.toHaveBeenCalled();
			});

			it('should handle missing clientLoad method', async () => {
				delete mockI18n.clientLoad;
				const data = { locale: 'zh' };

				await loadI18nUniversal(mockI18n, data);

				// Should still try to set locale
				expect(mockI18n.setLocale).toHaveBeenCalledWith('zh');
			});
		});

		describe('Server-side behavior', () => {
			beforeEach(() => {
				mockBrowser = false;
			});

			it('should use server data locale on SSR', async () => {
				mockI18n.locales = ['en', 'zh'];
				const data = { locale: 'zh' };

				await loadI18nUniversal(mockI18n, data);

				expect(mockI18n.setLocale).toHaveBeenCalledWith('zh');
			});

			it('should not call clientLoad on server', async () => {
				const data = { locale: 'zh' };

				await loadI18nUniversal(mockI18n, data);

				expect(mockI18n.clientLoad).not.toHaveBeenCalled();
			});

			it('should not access localStorage on server', async () => {
				const data = { locale: 'zh' };

				await loadI18nUniversal(mockI18n, data);

				expect(localStorage.getItem).not.toHaveBeenCalled();
			});

			it('should skip setLocale if locale not in locales', async () => {
				mockI18n.locales = ['en', 'ja'];
				const data = { locale: 'ko' };

				await loadI18nUniversal(mockI18n, data);

				expect(mockI18n.setLocale).not.toHaveBeenCalled();
			});
		});

		describe('Return value', () => {
			it('should return combined data with locale info', async () => {
				const data = {
					locale: 'zh',
					locales: ['en', 'zh'],
					customProp: 'test'
				};

				const result = await loadI18nUniversal(mockI18n, data);

				expect(result).toEqual({
					locale: 'zh', // Should be 'zh' after setLocale is called
					locales: ['en', 'zh'],
					i18nReady: true,
					customProp: 'test'
				});
			});

			it('should use i18n locales when data locales not provided', async () => {
				const data = { locale: 'zh' };

				const result = await loadI18nUniversal(mockI18n, data);

				expect(result.locales).toEqual(['en', 'zh', 'ja']);
			});

			it('should handle empty data', async () => {
				const result = await loadI18nUniversal(mockI18n, null);

				expect(result).toEqual({
					locale: 'en',
					locales: ['en', 'zh', 'ja'],
					i18nReady: true
				});
			});
		});

		describe('URL parameter', () => {
			it('should accept URL object', async () => {
				const url = new URL('http://localhost:3000/zh/page');
				const data = {};

				await loadI18nUniversal(mockI18n, data, url);

				// The URL is passed but not used in the current implementation
				expect(mockI18n.clientLoad).toHaveBeenCalled();
			});

			it('should accept pathname object', async () => {
				const url = { pathname: '/zh/page' };
				const data = {};

				await loadI18nUniversal(mockI18n, data, url);

				expect(mockI18n.clientLoad).toHaveBeenCalled();
			});
		});
	});

	describe('i18nUniversalLoad (deprecated)', () => {
		it('should delegate to loadI18nUniversal', async () => {
			const data = { locale: 'zh' };
			const options = { storageKey: 'custom-key' };

			const result = await i18nUniversalLoad(mockI18n, data, true, options);

			expect(mockI18n.clientLoad).toHaveBeenCalled();
			expect(result).toEqual({
				locales: ['en', 'zh', 'ja'],
				i18nReady: true,
				...data
			});
		});

		it('should handle browser flag false', async () => {
			const data = { locale: 'zh' };

			// Note: The browser parameter in i18nUniversalLoad doesn't affect behavior
			// since it uses the actual browser detection from $app/environment
			await i18nUniversalLoad(mockI18n, data, false);

			// Still runs client code since actual browser is true
			expect(mockI18n.clientLoad).toHaveBeenCalled();
		});
	});
});
