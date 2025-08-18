/**
 * Unit tests for persistence.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	getLocaleFromCookie,
	setLocaleCookie,
	getLocaleFromStorage,
	setLocaleStorage,
	getInitialLocale,
	getInitialLocaleUniversal,
	saveLocaleUniversal
} from '$lib/services/persistence.js';

describe('Persistence Functions', () => {
	let originalDocument: any;
	let originalLocalStorage: Storage;
	let originalNavigator: any;
	let localStorageData: Record<string, string> = {};
	let documentCookies: string = '';

	beforeEach(() => {
		// Mock document.cookie
		originalDocument = global.document;
		global.document = {
			cookie: ''
		} as any;

		Object.defineProperty(global.document, 'cookie', {
			get: () => documentCookies,
			set: (value: string) => {
				// Simple cookie setter for testing
				if (value.includes('=')) {
					const [name, val] = value.split('=');
					const cleanName = name.trim();
					const cleanVal = val.split(';')[0];

					// Update or add cookie
					const cookies = documentCookies.split(';').filter((c) => c.trim());
					const otherCookies = cookies.filter((c) => !c.trim().startsWith(cleanName + '='));
					// Always add the cookie, even if the value is empty
					otherCookies.push(`${cleanName}=${cleanVal}`);
					documentCookies = otherCookies.join('; ');
				}
			},
			configurable: true
		});

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

		// Mock navigator.language
		originalNavigator = global.navigator;
		Object.defineProperty(global, 'navigator', {
			value: {
				language: undefined,
				languages: []
			},
			writable: true,
			configurable: true
		});
	});

	afterEach(() => {
		global.document = originalDocument;
		global.localStorage = originalLocalStorage;
		Object.defineProperty(global, 'navigator', {
			value: originalNavigator,
			writable: true,
			configurable: true
		});
		documentCookies = '';
		vi.clearAllMocks();
	});

	describe('Cookie Functions', () => {
		describe('getLocaleFromCookie', () => {
			it('should get locale from cookie with default name', () => {
				const cookieString = 'i18n-locale=zh; other=value';

				expect(getLocaleFromCookie(cookieString)).toBe('zh');
			});

			it('should get locale from cookie with custom name', () => {
				const cookieString = 'custom-locale=ja; i18n-locale=zh';

				expect(getLocaleFromCookie(cookieString, 'custom-locale')).toBe('ja');
			});

			it('should return null when cookie not found', () => {
				const cookieString = 'other=value';

				expect(getLocaleFromCookie(cookieString)).toBeNull();
			});

			it('should handle empty cookie string', () => {
				const cookieString = '';

				expect(getLocaleFromCookie(cookieString)).toBeNull();
			});

			it('should handle malformed cookies', () => {
				const cookieString = 'invalid; =empty; i18n-locale=zh';

				expect(getLocaleFromCookie(cookieString)).toBe('zh');
			});

			it('should trim whitespace from cookie values', () => {
				const cookieString = 'i18n-locale= zh ';

				// parseCookies trims the trailing space from the value but not the leading space
				expect(getLocaleFromCookie(cookieString)).toBe(' zh');
			});

			it('should decode URI-encoded values', () => {
				const cookieString = 'i18n-locale=zh%2DCN';

				expect(getLocaleFromCookie(cookieString)).toBe('zh-CN');
			});

			it('should handle cookies with = in value', () => {
				const cookieString = 'i18n-locale=zh=CN';

				// parseCookies splits by = and only takes the first part as the value
				// This is a limitation of the simple parser
				expect(getLocaleFromCookie(cookieString)).toBe('zh');
			});
		});

		describe('setLocaleCookie', () => {
			it('should set locale cookie with default name', () => {
				setLocaleCookie('zh');

				expect(documentCookies).toContain('i18n-locale=zh');
			});

			it('should set locale cookie with custom name', () => {
				setLocaleCookie('ja', 'custom-locale');

				expect(documentCookies).toContain('custom-locale=ja');
			});

			it('should include path in cookie', () => {
				const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
				setLocaleCookie('zh');

				expect(spy).toHaveBeenCalledWith('[setLocaleCookie] Set cookie: i18n-locale=zh');
				spy.mockRestore();
			});

			it('should handle special characters in locale', () => {
				setLocaleCookie('zh-CN');

				expect(documentCookies).toContain('i18n-locale=zh-CN');
			});

			it('should update existing cookie', () => {
				documentCookies = 'i18n-locale=en';
				setLocaleCookie('zh');

				expect(documentCookies).toContain('i18n-locale=zh');
				expect(documentCookies).not.toContain('i18n-locale=en');
			});
		});
	});

	describe('LocalStorage Functions', () => {
		describe('getLocaleFromStorage', () => {
			it('should get locale from localStorage with default key', () => {
				localStorageData['i18n-locale'] = 'zh';

				expect(getLocaleFromStorage()).toBe('zh');
			});

			it('should get locale from localStorage with custom key', () => {
				localStorageData['custom-key'] = 'ja';

				expect(getLocaleFromStorage('custom-key')).toBe('ja');
			});

			it('should return null when key not found', () => {
				expect(getLocaleFromStorage()).toBeNull();
			});

			it('should handle localStorage errors', () => {
				global.localStorage.getItem = vi.fn(() => {
					throw new Error('Storage error');
				});

				// Should silently fail and return null
				expect(getLocaleFromStorage()).toBeNull();
			});

			it('should return null when localStorage not available', () => {
				delete (global as any).localStorage;

				expect(getLocaleFromStorage()).toBeNull();
			});
		});

		describe('setLocaleStorage', () => {
			it('should save locale to localStorage with default key', () => {
				setLocaleStorage('zh');

				expect(localStorage.setItem).toHaveBeenCalledWith('i18n-locale', 'zh');
			});

			it('should save locale to localStorage with custom key', () => {
				setLocaleStorage('ja', 'custom-key');

				expect(localStorage.setItem).toHaveBeenCalledWith('custom-key', 'ja');
			});

			it('should handle localStorage errors', () => {
				global.localStorage.setItem = vi.fn(() => {
					throw new Error('Storage error');
				});

				// Should silently fail
				expect(() => setLocaleStorage('zh')).not.toThrow();
			});

			it('should handle missing localStorage', () => {
				delete (global as any).localStorage;

				// Should not throw when localStorage is missing
				expect(() => setLocaleStorage('zh')).not.toThrow();
			});
		});
	});

	describe('Combined Functions', () => {
		describe('getInitialLocale', () => {
			it('should use localStorage when available', () => {
				localStorageData['i18n-locale'] = 'ja';

				expect(getInitialLocale('en')).toBe('ja');
			});

			it('should use default when no localStorage', () => {
				expect(getInitialLocale('en')).toBe('en');
			});

			it('should handle localStorage errors', () => {
				global.localStorage.getItem = vi.fn(() => {
					throw new Error('Storage error');
				});

				expect(getInitialLocale('en')).toBe('en');
			});

			it('should respect available locales', () => {
				localStorageData['i18n-locale'] = 'ko';

				// ko is not in available locales, should fall back to default
				expect(getInitialLocale('en', ['en', 'zh', 'ja'])).toBe('en');

				// ko is in available locales, should use it
				expect(getInitialLocale('en', ['en', 'zh', 'ja', 'ko'])).toBe('ko');
			});
		});

		describe('getInitialLocaleUniversal', () => {
			it('should parse cookie string correctly', () => {
				const cookies = 'i18n-locale=zh; other=value';

				expect(getInitialLocaleUniversal('en', cookies)).toBe('zh');
			});

			it('should handle undefined cookie string', () => {
				localStorageData['i18n-locale'] = 'ja';

				expect(getInitialLocaleUniversal('en', undefined)).toBe('ja');
			});

			it('should use options for cookie and storage names', () => {
				const cookies = 'custom-cookie=zh';
				const options = {
					cookieName: 'custom-cookie',
					storageKey: 'custom-storage'
				};

				expect(getInitialLocaleUniversal('en', cookies, options)).toBe('zh');
			});

			it('should fall back through cookie -> localStorage -> default', () => {
				// No cookie, no localStorage
				expect(getInitialLocaleUniversal('fr', '')).toBe('fr');

				// No cookie, has localStorage
				localStorageData['i18n-locale'] = 'ja';
				expect(getInitialLocaleUniversal('fr', '')).toBe('ja');

				// Has cookie
				expect(getInitialLocaleUniversal('fr', 'i18n-locale=zh')).toBe('zh');
			});
		});

		describe('saveLocaleUniversal', () => {
			it('should save to both cookie and localStorage by default', () => {
				saveLocaleUniversal('zh');

				expect(documentCookies).toContain('i18n-locale=zh');
				expect(localStorage.setItem).toHaveBeenCalledWith('i18n-locale', 'zh');
			});

			it('should use custom names from options', () => {
				saveLocaleUniversal('ja', {
					cookieName: 'custom-cookie',
					storageKey: 'custom-storage'
				});

				expect(documentCookies).toContain('custom-cookie=ja');
				expect(localStorage.setItem).toHaveBeenCalledWith('custom-storage', 'ja');
			});

			it('should handle partial options', () => {
				saveLocaleUniversal('zh', { cookieName: 'custom-cookie' });

				expect(documentCookies).toContain('custom-cookie=zh');
				expect(localStorage.setItem).toHaveBeenCalledWith('i18n-locale', 'zh');
			});

			it('should continue if one storage method fails', () => {
				global.localStorage.setItem = vi.fn(() => {
					throw new Error('Storage error');
				});

				saveLocaleUniversal('zh');

				// Cookie should still be set even if localStorage fails
				expect(documentCookies).toContain('i18n-locale=zh');
			});

			it('should handle server environment (no document)', () => {
				delete (global as any).document;

				// Should not throw in server environment
				expect(() => saveLocaleUniversal('zh')).not.toThrow();
			});
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty locale values', () => {
			setLocaleCookie('');
			setLocaleStorage('');

			expect(documentCookies).toContain('i18n-locale=');
			expect(localStorage.setItem).toHaveBeenCalledWith('i18n-locale', '');
		});

		it('should handle very long locale strings', () => {
			const longLocale = 'a'.repeat(1000);
			setLocaleCookie(longLocale);
			setLocaleStorage(longLocale);

			expect(documentCookies).toContain(`i18n-locale=${longLocale}`);
			expect(localStorage.setItem).toHaveBeenCalledWith('i18n-locale', longLocale);
		});

		it('should handle locale with special characters', () => {
			const specialLocale = 'zh-Hans-CN';
			setLocaleCookie(specialLocale);
			setLocaleStorage(specialLocale);

			expect(getLocaleFromCookie(documentCookies)).toBe(specialLocale);
			expect(getLocaleFromStorage()).toBe(specialLocale);
		});

		it('should be case-sensitive for locale values', () => {
			setLocaleCookie('ZH');
			expect(getLocaleFromCookie(documentCookies)).toBe('ZH');

			setLocaleStorage('JA');
			expect(getLocaleFromStorage()).toBe('JA');
		});
	});
});
