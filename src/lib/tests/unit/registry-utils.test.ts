/**
 * Unit tests for registry-utils.ts
 */

import { describe, it, expect } from 'vitest';
import {
	getAvailableLocales,
	getTranslation,
	getMergedTranslations,
	isLocaleAvailable,
	getNamespaces,
	getNamespaceLocales
} from '$lib/utils/registry-utils.js';
import type { TranslationRegistry } from '$lib/services/built-in-loader.js';

describe('Registry Utils', () => {
	const sampleRegistry: TranslationRegistry = {
		app: {
			en: { welcome: 'Welcome', common: 'Common' },
			zh: { welcome: '欢迎', common: '通用' },
			ja: { welcome: 'ようこそ' }
		},
		'my-package': {
			en: { library: 'Library', feature: 'Feature' },
			zh: { library: '库', feature: '功能' }
		},
		'other-package': {
			en: { other: 'Other' },
			fr: { other: 'Autre' }
		}
	};

	describe('getAvailableLocales', () => {
		it('should return all unique locales from registry', () => {
			const locales = getAvailableLocales(sampleRegistry);

			expect(locales).toContain('en');
			expect(locales).toContain('zh');
			expect(locales).toContain('ja');
			expect(locales).toContain('fr');
			expect(locales).toHaveLength(4);
		});

		it('should return empty array for empty registry', () => {
			const locales = getAvailableLocales({});
			expect(locales).toEqual([]);
		});

		it('should handle single namespace', () => {
			const registry: TranslationRegistry = {
				app: {
					en: { test: 'Test' },
					zh: { test: '测试' }
				}
			};

			const locales = getAvailableLocales(registry);
			expect(locales).toEqual(['en', 'zh']);
		});

		it('should deduplicate locales across namespaces', () => {
			const registry: TranslationRegistry = {
				app: { en: { a: 'A' } },
				pkg1: { en: { b: 'B' } },
				pkg2: { en: { c: 'C' } }
			};

			const locales = getAvailableLocales(registry);
			expect(locales).toEqual(['en']);
		});
	});

	describe('getTranslation', () => {
		it('should get translation for namespace and locale', () => {
			const translation = getTranslation(sampleRegistry, 'app', 'en');
			expect(translation).toEqual({ welcome: 'Welcome', common: 'Common' });
		});

		it('should get translation for package namespace', () => {
			const translation = getTranslation(sampleRegistry, 'my-package', 'zh');
			expect(translation).toEqual({ library: '库', feature: '功能' });
		});

		it('should return undefined for non-existent namespace', () => {
			const translation = getTranslation(sampleRegistry, 'non-existent', 'en');
			expect(translation).toBeUndefined();
		});

		it('should return undefined for non-existent locale', () => {
			const translation = getTranslation(sampleRegistry, 'app', 'ko');
			expect(translation).toBeUndefined();
		});

		it('should handle empty registry', () => {
			const translation = getTranslation({}, 'app', 'en');
			expect(translation).toBeUndefined();
		});
	});

	describe('getMergedTranslations', () => {
		it('should merge app translations without prefix', () => {
			const merged = getMergedTranslations(sampleRegistry, 'en');

			expect(merged.welcome).toBe('Welcome');
			expect(merged.common).toBe('Common');
		});

		it('should add namespace prefix for package translations', () => {
			const merged = getMergedTranslations(sampleRegistry, 'en');

			expect(merged['my-package.library']).toBe('Library');
			expect(merged['my-package.feature']).toBe('Feature');
			expect(merged['other-package.other']).toBe('Other');
		});

		it('should handle locale with partial coverage', () => {
			const merged = getMergedTranslations(sampleRegistry, 'ja');

			expect(merged).toEqual({ welcome: 'ようこそ' });
		});

		it('should handle non-existent locale', () => {
			const merged = getMergedTranslations(sampleRegistry, 'ko');
			expect(merged).toEqual({});
		});

		it('should handle empty registry', () => {
			const merged = getMergedTranslations({}, 'en');
			expect(merged).toEqual({});
		});

		it('should handle registry without app namespace', () => {
			const registry: TranslationRegistry = {
				'my-package': {
					en: { test: 'Test' }
				}
			};

			const merged = getMergedTranslations(registry, 'en');
			expect(merged).toEqual({ 'my-package.test': 'Test' });
		});

		it('should not override app translations with namespaced ones', () => {
			const registry: TranslationRegistry = {
				app: {
					en: { test: 'App Test' }
				},
				'my-package': {
					en: { test: 'Package Test' }
				}
			};

			const merged = getMergedTranslations(registry, 'en');
			expect(merged.test).toBe('App Test');
			expect(merged['my-package.test']).toBe('Package Test');
		});
	});

	describe('isLocaleAvailable', () => {
		it('should return true for available locale', () => {
			expect(isLocaleAvailable(sampleRegistry, 'en')).toBe(true);
			expect(isLocaleAvailable(sampleRegistry, 'zh')).toBe(true);
			expect(isLocaleAvailable(sampleRegistry, 'ja')).toBe(true);
			expect(isLocaleAvailable(sampleRegistry, 'fr')).toBe(true);
		});

		it('should return false for unavailable locale', () => {
			expect(isLocaleAvailable(sampleRegistry, 'ko')).toBe(false);
			expect(isLocaleAvailable(sampleRegistry, 'es')).toBe(false);
		});

		it('should return false for empty registry', () => {
			expect(isLocaleAvailable({}, 'en')).toBe(false);
		});

		it('should check across all namespaces', () => {
			const registry: TranslationRegistry = {
				app: { en: { test: 'Test' } },
				pkg: { zh: { test: '测试' } }
			};

			expect(isLocaleAvailable(registry, 'en')).toBe(true);
			expect(isLocaleAvailable(registry, 'zh')).toBe(true);
		});
	});

	describe('getNamespaces', () => {
		it('should return all namespace names', () => {
			const namespaces = getNamespaces(sampleRegistry);

			expect(namespaces).toContain('app');
			expect(namespaces).toContain('my-package');
			expect(namespaces).toContain('other-package');
			expect(namespaces).toHaveLength(3);
		});

		it('should return empty array for empty registry', () => {
			const namespaces = getNamespaces({});
			expect(namespaces).toEqual([]);
		});

		it('should handle single namespace', () => {
			const registry: TranslationRegistry = {
				app: { en: { test: 'Test' } }
			};

			const namespaces = getNamespaces(registry);
			expect(namespaces).toEqual(['app']);
		});
	});

	describe('getNamespaceLocales', () => {
		it('should return locales for app namespace', () => {
			const locales = getNamespaceLocales(sampleRegistry, 'app');

			expect(locales).toContain('en');
			expect(locales).toContain('zh');
			expect(locales).toContain('ja');
			expect(locales).toHaveLength(3);
		});

		it('should return locales for package namespace', () => {
			const locales = getNamespaceLocales(sampleRegistry, 'my-package');

			expect(locales).toContain('en');
			expect(locales).toContain('zh');
			expect(locales).toHaveLength(2);
		});

		it('should return empty array for non-existent namespace', () => {
			const locales = getNamespaceLocales(sampleRegistry, 'non-existent');
			expect(locales).toEqual([]);
		});

		it('should return empty array for empty registry', () => {
			const locales = getNamespaceLocales({}, 'app');
			expect(locales).toEqual([]);
		});
	});
});
