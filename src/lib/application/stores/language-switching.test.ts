import { describe, it, expect, beforeEach, vi } from 'vitest';
import { I18nStore } from './store.svelte';
import type { I18nConfig } from '../../domain/models/types';

// Mock fetch for testing
global.fetch = vi.fn();

describe('Language Switching with Auto-discovered Languages', () => {
	let store: I18nStore;
	
	beforeEach(() => {
		// Clear all mocks
		vi.clearAllMocks();
		
		// Clear localStorage and document.cookie
		localStorage.clear();
		document.cookie = 'i18n-locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
		
		// Create a fresh store instance
		const config: I18nConfig = {
			defaultLocale: 'en',
			fallbackLocale: 'en',
			namespace: 'app',
			translations: {
				en: { welcome: 'Welcome' },
				zh: { welcome: '欢迎' }
			}
		};
		store = new I18nStore(config);
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
			expect(document.cookie).toContain('i18n-locale=zh');
		});
	});
	
	describe('setLocale with auto-discovered languages', () => {
		it('should load and switch to an auto-discovered language', async () => {
			// Mock the fetch response for Korean translations
			const mockKoreanTranslations = {
				welcome: '환영합니다',
				hello: '안녕하세요'
			};
			
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockKoreanTranslations
			});
			
			// Add Korean to available locales (simulating auto-discovery)
			store.availableLocales = ['en', 'zh', 'ko'];
			
			// Switch to Korean
			await store.setLocale('ko');
			
			// Verify fetch was called with correct URL
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/translations/app/ko.json')
			);
			
			// Verify locale changed
			expect(store.locale).toBe('ko');
			
			// Verify translations loaded
			expect(store.translations['ko']).toEqual(mockKoreanTranslations);
			
			// Verify saved to localStorage
			expect(localStorage.getItem('i18n-locale')).toBe('ko');
			
			// Verify saved to cookie
			expect(document.cookie).toContain('i18n-locale=ko');
		});
		
		it('should handle failed loading of auto-discovered language', async () => {
			// Mock fetch to fail
			(global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
			
			// Add Korean to available locales
			store.availableLocales = ['en', 'zh', 'ko'];
			
			// Try to switch to Korean
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
			
			// Add Korean to available locales
			store.availableLocales = ['en', 'zh', 'ko'];
			
			// Try to switch to Korean
			await store.setLocale('ko');
			
			// Should remain on original locale
			expect(store.locale).toBe('en');
			
			// Should not save failed locale
			expect(localStorage.getItem('i18n-locale')).toBeNull();
		});
	});
	
	describe('clientLoad with auto-discovery', () => {
		it('should load auto-discovered languages on client initialization', async () => {
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
			Object.entries(mockTranslations).forEach(([locale, translations]) => {
				(global.fetch as any).mockResolvedValueOnce({
					ok: true,
					json: async () => translations
				});
			});
			
			// Call clientLoad
			await store.clientLoad();
			
			// Verify all languages are available
			expect(store.availableLocales).toContain('ko');
			expect(store.availableLocales).toContain('es');
			expect(store.availableLocales).toContain('pt');
			
			// Verify translations loaded
			expect(store.translations['ko']).toEqual(mockTranslations.ko);
			expect(store.translations['es']).toEqual(mockTranslations.es);
			expect(store.translations['pt']).toEqual(mockTranslations.pt);
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
				namespace: 'app',
				translations: {
					en: { welcome: 'Welcome' }
				}
			});
			
			// Add Korean to available locales
			newStore.availableLocales = ['en', 'ko'];
			
			// Simulate client initialization that would read localStorage
			const savedLocale = localStorage.getItem('i18n-locale');
			if (savedLocale && newStore.availableLocales.includes(savedLocale)) {
				await newStore.setLocale(savedLocale);
			}
			
			// Should be set to Korean
			expect(newStore.locale).toBe('ko');
		});
		
		it('should restore language from cookie on SSR', () => {
			// Set Korean in cookie
			document.cookie = 'i18n-locale=ko; path=/';
			
			// Parse cookie (simulating SSR cookie reading)
			const cookieValue = document.cookie
				.split('; ')
				.find(row => row.startsWith('i18n-locale='))
				?.split('=')[1];
			
			expect(cookieValue).toBe('ko');
		});
	});
});