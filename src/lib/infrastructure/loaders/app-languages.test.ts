import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAppSupportedLanguages, isAppLanguageSupported } from './app-languages.js';
import type { I18nInstance } from '../../domain/models/types.js';

// Mock the auto-discovery loader
vi.mock('./auto-discovery-v2.js', () => ({
	loadAutoDiscoveryConfig: vi.fn()
}));

import { loadAutoDiscoveryConfig } from './auto-discovery-v2.js';

describe('App Languages', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Clear globalThis
		(globalThis as any).__i18n_instances = undefined;
	});

	describe('getAppSupportedLanguages', () => {
		it('should return built-in languages when no auto-discovery is available', async () => {
			// Mock i18n instance with built-in languages
			const mockI18n = {
				locales: ['en', 'zh', 'ja', 'fr', 'de']
			} as I18nInstance;

			// Mock auto-discovery to fail (no index.json)
			vi.mocked(loadAutoDiscoveryConfig).mockRejectedValue(new Error('Not found'));

			const result = await getAppSupportedLanguages(mockI18n);

			// Should return all built-in languages sorted
			expect(result).toEqual(['de', 'en', 'fr', 'ja', 'zh']);
		});

		it('should combine built-in and auto-discovered languages', async () => {
			// Mock i18n instance with built-in languages
			const mockI18n = {
				locales: ['en', 'zh', 'ja']
			} as I18nInstance;

			// Mock auto-discovery config
			vi.mocked(loadAutoDiscoveryConfig).mockResolvedValue({
				autoDiscovery: {
					app: ['fr', 'de', 'es', 'en'] // 'en' is duplicate, should be deduped
				}
			} as any);

			const result = await getAppSupportedLanguages(mockI18n);

			// Should combine and deduplicate, then sort
			expect(result).toEqual(['de', 'en', 'es', 'fr', 'ja', 'zh']);
		});

		it('should use main app instance when available', async () => {
			// Setup library i18n instance
			const libI18n = {
				locales: ['en', 'zh'] // Library only has 2 languages
			} as I18nInstance;

			// Setup main app i18n instance with more languages
			const appI18n = {
				locales: ['en', 'zh', 'ja', 'fr', 'de', 'ar', 'zh-TW']
			} as I18nInstance;

			// Mock globalThis to have app instance
			(globalThis as any).__i18n_instances = new Map([['app', appI18n]]);

			// Mock auto-discovery to add more languages
			vi.mocked(loadAutoDiscoveryConfig).mockResolvedValue({
				autoDiscovery: {
					app: ['es', 'pt']
				}
			} as any);

			// Call with library instance but should use app instance
			const result = await getAppSupportedLanguages(libI18n);

			// Should get languages from app instance + auto-discovered
			expect(result).toEqual(['ar', 'de', 'en', 'es', 'fr', 'ja', 'pt', 'zh', 'zh-TW']);
		});

		it('should exclude package languages from auto-discovery', async () => {
			const mockI18n = {
				locales: ['en', 'zh']
			} as I18nInstance;

			// Mock auto-discovery with both app and package languages
			vi.mocked(loadAutoDiscoveryConfig).mockResolvedValue({
				autoDiscovery: {
					app: ['fr', 'de'],
					packages: {
						'@some/package': ['es', 'pt'] // These should be ignored
					}
				}
			} as any);

			const result = await getAppSupportedLanguages(mockI18n);

			// Should only include app languages, not package languages
			expect(result).toEqual(['de', 'en', 'fr', 'zh']);
		});

		it('should handle empty auto-discovery gracefully', async () => {
			const mockI18n = {
				locales: ['en', 'zh', 'ja']
			} as I18nInstance;

			// Mock empty auto-discovery
			vi.mocked(loadAutoDiscoveryConfig).mockResolvedValue({
				autoDiscovery: {
					app: []
				}
			} as any);

			const result = await getAppSupportedLanguages(mockI18n);

			// Should return only built-in languages
			expect(result).toEqual(['en', 'ja', 'zh']);
		});
	});

	describe('isAppLanguageSupported', () => {
		it('should return true for supported languages', async () => {
			const mockI18n = {
				locales: ['en', 'zh', 'ja']
			} as I18nInstance;

			vi.mocked(loadAutoDiscoveryConfig).mockResolvedValue({
				autoDiscovery: {
					app: ['fr']
				}
			} as any);

			// Test built-in language
			expect(await isAppLanguageSupported(mockI18n, 'en')).toBe(true);

			// Test auto-discovered language
			expect(await isAppLanguageSupported(mockI18n, 'fr')).toBe(true);
		});

		it('should return false for unsupported languages', async () => {
			const mockI18n = {
				locales: ['en', 'zh']
			} as I18nInstance;

			vi.mocked(loadAutoDiscoveryConfig).mockResolvedValue({
				autoDiscovery: {
					app: []
				}
			} as any);

			expect(await isAppLanguageSupported(mockI18n, 'de')).toBe(false);
			expect(await isAppLanguageSupported(mockI18n, 'es')).toBe(false);
		});
	});

	describe('Integration with real i18n instances', () => {
		it('should properly detect app languages when library component calls it', async () => {
			// Simulate library i18n with limited languages
			const libI18n = {
				locales: ['en', 'zh', 'ja'],
				namespace: '@shelchin/svelte-i18n'
			} as I18nInstance;

			// Simulate app i18n with full language set
			const appI18n = {
				locales: ['en', 'zh', 'ja', 'fr', 'de', 'ar', 'zh-TW'],
				namespace: 'app'
			} as I18nInstance;

			// Setup global instances map as the unified system does
			(globalThis as any).__i18n_instances = new Map([
				['app', appI18n],
				['@shelchin/svelte-i18n', libI18n]
			]);

			// Mock no auto-discovery
			vi.mocked(loadAutoDiscoveryConfig).mockRejectedValue(new Error('Not found'));

			// When library component calls this function
			const result = await getAppSupportedLanguages(libI18n);

			// Should get the app's full language list, not library's limited list
			expect(result).toEqual(['ar', 'de', 'en', 'fr', 'ja', 'zh', 'zh-TW']);
			expect(result.length).toBe(7); // All 7 app languages
			expect(result).not.toEqual(['en', 'ja', 'zh']); // Not just the 3 library languages
		});
	});
});
