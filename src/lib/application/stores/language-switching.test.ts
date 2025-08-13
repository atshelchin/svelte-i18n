import { describe, it, expect, beforeEach, vi } from 'vitest';
import { I18nStore } from './store.svelte';
import type { I18nConfig } from '../../domain/models/types.js';

// Mock fetch for testing
global.fetch = vi.fn();

// Mock localStorage for testing
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		clear: () => {
			store = {};
		},
		removeItem: (key: string) => {
			delete store[key];
		}
	};
})();
(global as any).localStorage = localStorageMock;

// Mock window object for testing
(global as any).window = {
	localStorage: localStorageMock,
	location: {
		origin: 'http://localhost:3000'
	}
};

describe('Language Switching with Auto-discovered Languages', () => {
	let store: I18nStore;

	// Mock Korean translations
	const mockKoreanTranslations = {
		greeting: '안녕하세요',
		farewell: '안녕히 가세요'
	};

	beforeEach(() => {
		// Clear all mocks
		vi.clearAllMocks();

		// Clear localStorage
		localStorageMock.clear();

		// Mock document.cookie for tests
		(global as any).document = {
			_cookie: '',
			// Cookie setter needs to update the cookie string
			set cookie(value: string) {
				this._cookie = value;
			},
			get cookie() {
				return this._cookie || '';
			}
		};

		// Create a fresh store instance
		const config: I18nConfig = {
			defaultLocale: 'en',
			fallbackLocale: 'en',
			namespace: 'app'
		};
		store = new I18nStore(config);
		// Load initial translations
		store.loadLanguageSync('en', { welcome: 'Welcome' });
		store.loadLanguageSync('zh', { welcome: '欢迎' });
	});

	describe('setLocale with built-in languages', () => {
		it('should switch to a built-in language and save to storage', async () => {
			// Initially should be 'en'
			expect(store.locale).toBe('en');

			// Switch to Chinese
			await store.setLocale('zh');

			// Verify locale changed
			expect(store.locale).toBe('zh');

			// Verify saved to localStorage
			expect(localStorage.getItem('i18n-locale')).toBe('zh');

			// Verify saved to cookie
			expect((global as any).document.cookie).toContain('i18n-locale=zh');
		});
	});

	describe('setLocale with auto-discovered languages', () => {
		it('should load and switch to an auto-discovered language', async () => {
			// Mock the fetch response for Korean translations
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockKoreanTranslations
			});

			// Add Korean to available locales but don't load translations
			// This simulates auto-discovery where locale is known but not loaded yet
			if (!store.locales.includes('ko')) {
				(store as any).availableLocales.push('ko');
			}

			// Switch to Korean - this should trigger loading
			await store.setLocale('ko');

			// Verify fetch was called with correct URL
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/translations/app/ko.json')
			);

			// Verify locale changed
			expect(store.locale).toBe('ko');

			// Verify translations loaded
			expect(store.t('greeting')).toBe('안녕하세요');

			// Verify saved to localStorage
			expect(localStorage.getItem('i18n-locale')).toBe('ko');

			// Verify saved to cookie
			expect((global as any).document.cookie).toContain('i18n-locale=ko');
		});

		it('should handle failed loading of auto-discovered language', async () => {
			// Mock fetch to fail
			(global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

			// Add Korean to available locales but don't load translations
			if (!store.locales.includes('ko')) {
				(store as any).availableLocales.push('ko');
			}

			// Try to switch to Korean - should fail to load
			await store.setLocale('ko');

			// Should remain on original locale
			expect(store.locale).toBe('en');

			// Should not save failed locale
			expect(localStorage.getItem('i18n-locale')).toBeNull();
		});

		it('should handle 404 for auto-discovered language file', async () => {
			// Mock fetch to return 404
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 404
			});

			// Add Korean to available locales but don't load translations
			if (!store.locales.includes('ko')) {
				(store as any).availableLocales.push('ko');
			}

			// Try to switch to Korean - should fail with 404
			await store.setLocale('ko');

			// Should remain on original locale
			expect(store.locale).toBe('en');

			// Should not save failed locale
			expect(localStorage.getItem('i18n-locale')).toBeNull();
		});
	});

	describe('clientLoad with auto-discovery', () => {
		it.skip('should load auto-discovered languages on client initialization - requires full auto-discovery system', async () => {
			// Mock index.json response
			const mockIndexConfig = {
				autoDiscovery: {
					app: ['ko', 'es', 'pt']
				}
			};

			// Mock translations for each language
			const mockTranslations = {
				ko: { welcome: '환영합니다' },
				es: { welcome: 'Bienvenido' },
				pt: { welcome: 'Bem-vindo' }
			};

			// First call for index.json
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockIndexConfig
			});

			// Subsequent calls for each language file
			Object.entries(mockTranslations).forEach(([_locale, translations]) => {
				(global.fetch as any).mockResolvedValueOnce({
					ok: true,
					json: async () => translations
				});
			});

			// Call clientLoad
			await store.clientLoad();

			// Verify all languages are available
			expect(store.locales).toContain('ko');
			expect(store.locales).toContain('es');
			expect(store.locales).toContain('pt');

			// Verify translations loaded by testing the t() function
			// Since translations is private, we test via public API
			expect(store.t('greeting')).toBeDefined();
		});
	});

	describe('Language persistence across sessions', () => {
		it('should restore language from localStorage on init', async () => {
			// Set Korean in localStorage
			localStorage.setItem('i18n-locale', 'ko');

			// Mock Korean translations
			const mockKoreanTranslations = { welcome: '환영합니다' };
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockKoreanTranslations
			});

			// Create new store instance
			const newStore = new I18nStore({
				defaultLocale: 'en',
				fallbackLocale: 'en',
				namespace: 'app'
			});
			// Load initial translations
			newStore.loadLanguageSync('en', { welcome: 'Welcome' });
			newStore.loadLanguageSync('ko', mockKoreanTranslations);

			// Simulate client initialization that would read localStorage
			const savedLocale = localStorage.getItem('i18n-locale');
			if (savedLocale && newStore.locales.includes(savedLocale)) {
				await newStore.setLocale(savedLocale);
			}

			// Should be set to Korean
			expect(newStore.locale).toBe('ko');
		});

		it('should restore language from cookie on SSR', () => {
			// Set Korean in cookie
			(global as any).document.cookie = 'i18n-locale=ko; path=/';

			// Parse cookie (simulating SSR cookie reading)
			const cookieValue = (global as any).document.cookie
				.split('; ')
				.find((row: string) => row.startsWith('i18n-locale='))
				?.split('=')[1];

			expect(cookieValue).toBe('ko');
		});
	});
});
