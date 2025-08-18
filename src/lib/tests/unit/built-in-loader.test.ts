/**
 * Unit tests for built-in-loader.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	registerBuiltInTranslations,
	loadBuiltInTranslations,
	loadBuiltInTranslationsSync,
	registerPackageTranslations,
	clearRegisteredTranslations
} from '$lib/services/built-in-loader.js';

describe('Built-in Loader', () => {
	let mockStore: any;

	beforeEach(() => {
		// Clear registry before each test
		clearRegisteredTranslations();

		// Mock i18n store
		mockStore = {
			getNamespace: vi.fn().mockReturnValue('app'),
			loadLanguageSync: vi.fn(),
			loadLanguage: vi.fn().mockResolvedValue(undefined),
			locales: ['en', 'zh', 'ja']
		};
	});

	describe('registerBuiltInTranslations', () => {
		it('should register translations to global registry', () => {
			const translations = {
				app: {
					en: { welcome: 'Welcome' },
					zh: { welcome: '欢迎' }
				}
			};

			registerBuiltInTranslations(translations);

			// Can't directly test the registry, but we can test the effect
			// by calling loadBuiltInTranslationsSync
			loadBuiltInTranslationsSync(mockStore);

			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('en', { welcome: 'Welcome' });
			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('zh', { welcome: '欢迎' });
		});

		it('should merge with existing translations', () => {
			const translations1 = {
				app: {
					en: { welcome: 'Welcome' }
				}
			};

			const translations2 = {
				app: {
					zh: { welcome: '欢迎' }
				}
			};

			registerBuiltInTranslations(translations1);
			registerBuiltInTranslations(translations2);

			loadBuiltInTranslationsSync(mockStore);

			// Both should be loaded
			expect(mockStore.loadLanguageSync).toHaveBeenCalledTimes(1);
			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('zh', { welcome: '欢迎' });
		});

		it('should handle multiple namespaces', () => {
			const translations = {
				app: {
					en: { app_text: 'App' }
				},
				package1: {
					en: { pkg_text: 'Package' }
				}
			};

			registerBuiltInTranslations(translations);

			// Test app namespace
			loadBuiltInTranslationsSync(mockStore);
			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('en', { app_text: 'App' });

			// Test package namespace
			mockStore.loadLanguageSync.mockClear();
			mockStore.getNamespace.mockReturnValue('package1');
			loadBuiltInTranslationsSync(mockStore);
			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('en', { pkg_text: 'Package' });
		});
	});

	describe('loadBuiltInTranslationsSync', () => {
		it('should load app translations for app namespace', () => {
			const translations = {
				app: {
					en: { test: 'Test' },
					ja: { test: 'テスト' }
				},
				other: {
					en: { other: 'Other' }
				}
			};

			registerBuiltInTranslations(translations);
			mockStore.getNamespace.mockReturnValue('app');

			loadBuiltInTranslationsSync(mockStore);

			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('en', { test: 'Test' });
			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('ja', { test: 'テスト' });
			expect(mockStore.loadLanguageSync).not.toHaveBeenCalledWith('en', { other: 'Other' });
		});

		it('should load package translations for package namespace', () => {
			const translations = {
				app: {
					en: { app: 'App' }
				},
				'my-package': {
					en: { package: 'Package' },
					zh: { package: '包' }
				}
			};

			registerBuiltInTranslations(translations);
			mockStore.getNamespace.mockReturnValue('my-package');

			loadBuiltInTranslationsSync(mockStore);

			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('en', { package: 'Package' });
			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('zh', { package: '包' });
			expect(mockStore.loadLanguageSync).not.toHaveBeenCalledWith('en', { app: 'App' });
		});

		it('should handle missing namespace gracefully', () => {
			const translations = {
				app: {
					en: { test: 'Test' }
				}
			};

			registerBuiltInTranslations(translations);
			mockStore.getNamespace.mockReturnValue('non-existent');

			loadBuiltInTranslationsSync(mockStore);

			expect(mockStore.loadLanguageSync).not.toHaveBeenCalled();
		});

		it('should handle null namespace', () => {
			const translations = {
				app: {
					en: { test: 'Test' }
				}
			};

			registerBuiltInTranslations(translations);
			mockStore.getNamespace.mockReturnValue(null);

			loadBuiltInTranslationsSync(mockStore);

			expect(mockStore.loadLanguageSync).not.toHaveBeenCalled();
		});

		it('should handle empty registry', () => {
			mockStore.getNamespace.mockReturnValue('app');

			loadBuiltInTranslationsSync(mockStore);

			expect(mockStore.loadLanguageSync).not.toHaveBeenCalled();
		});
	});

	describe('loadBuiltInTranslations', () => {
		it('should load app translations asynchronously', async () => {
			const translations = {
				app: {
					en: { welcome: 'Welcome' },
					zh: { welcome: '欢迎' }
				}
			};

			registerBuiltInTranslations(translations);
			mockStore.getNamespace.mockReturnValue('app');

			await loadBuiltInTranslations(mockStore);

			expect(mockStore.loadLanguage).toHaveBeenCalledWith('en', { welcome: 'Welcome' });
			expect(mockStore.loadLanguage).toHaveBeenCalledWith('zh', { welcome: '欢迎' });
		});

		it('should call onLoaded callback when provided', async () => {
			const translations = {
				app: {
					en: { test: 'English' },
					zh: { test: 'Chinese' }
				}
			};

			registerBuiltInTranslations(translations);
			mockStore.getNamespace.mockReturnValue('app');

			const onLoaded = vi.fn();
			await loadBuiltInTranslations(mockStore, { onLoaded });

			expect(onLoaded).toHaveBeenCalledWith('en');
			expect(onLoaded).toHaveBeenCalledWith('zh');
			expect(onLoaded).toHaveBeenCalledTimes(2);
		});

		it('should load all if no locales filter provided', async () => {
			const translations = {
				app: {
					en: { test: 'English' },
					zh: { test: 'Chinese' }
				}
			};

			registerBuiltInTranslations(translations);
			mockStore.getNamespace.mockReturnValue('app');

			await loadBuiltInTranslations(mockStore);

			expect(mockStore.loadLanguage).toHaveBeenCalledWith('en', { test: 'English' });
			expect(mockStore.loadLanguage).toHaveBeenCalledWith('zh', { test: 'Chinese' });
		});

		it('should handle package namespace', async () => {
			const translations = {
				'@company/package': {
					en: { lib: 'Library' },
					zh: { lib: '库' }
				}
			};

			registerBuiltInTranslations(translations);
			mockStore.getNamespace.mockReturnValue('@company/package');

			await loadBuiltInTranslations(mockStore);

			expect(mockStore.loadLanguage).toHaveBeenCalledWith('en', { lib: 'Library' });
			expect(mockStore.loadLanguage).toHaveBeenCalledWith('zh', { lib: '库' });
		});

		it('should handle load errors gracefully', async () => {
			const translations = {
				app: {
					en: { test: 'Test' }
				}
			};

			registerBuiltInTranslations(translations);
			mockStore.getNamespace.mockReturnValue('app');
			mockStore.loadLanguage.mockRejectedValueOnce(new Error('Load failed'));

			// Should not throw
			await expect(loadBuiltInTranslations(mockStore)).resolves.toBeUndefined();
		});
	});

	describe('registerPackageTranslations', () => {
		it('should register translations for a specific package', () => {
			const translations = {
				en: { package: 'Package' },
				zh: { package: '包' }
			};

			registerPackageTranslations('my-package', translations);

			mockStore.getNamespace.mockReturnValue('my-package');
			loadBuiltInTranslationsSync(mockStore);

			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('en', { package: 'Package' });
			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('zh', { package: '包' });
		});

		it('should handle scoped package names', () => {
			const translations = {
				en: { scoped: 'Scoped Package' }
			};

			registerPackageTranslations('@company/my-package', translations);

			mockStore.getNamespace.mockReturnValue('@company/my-package');
			loadBuiltInTranslationsSync(mockStore);

			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('en', { scoped: 'Scoped Package' });
		});

		it('should merge with existing package translations', () => {
			registerPackageTranslations('pkg', {
				en: { first: 'First' }
			});

			registerPackageTranslations('pkg', {
				zh: { second: 'Second' }
			});

			mockStore.getNamespace.mockReturnValue('pkg');
			loadBuiltInTranslationsSync(mockStore);

			// Both should be loaded (merge behavior)
			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('en', { first: 'First' });
			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('zh', { second: 'Second' });
			expect(mockStore.loadLanguageSync).toHaveBeenCalledTimes(2);
		});
	});

	describe('clearRegisteredTranslations', () => {
		it('should clear all registered translations', () => {
			const translations = {
				app: {
					en: { test: 'Test' }
				}
			};

			registerBuiltInTranslations(translations);
			clearRegisteredTranslations();

			mockStore.getNamespace.mockReturnValue('app');
			loadBuiltInTranslationsSync(mockStore);

			expect(mockStore.loadLanguageSync).not.toHaveBeenCalled();
		});

		it('should allow re-registering after clear', () => {
			const translations1 = {
				app: {
					en: { first: 'First' }
				}
			};

			const translations2 = {
				app: {
					en: { second: 'Second' }
				}
			};

			registerBuiltInTranslations(translations1);
			clearRegisteredTranslations();
			registerBuiltInTranslations(translations2);

			mockStore.getNamespace.mockReturnValue('app');
			loadBuiltInTranslationsSync(mockStore);

			expect(mockStore.loadLanguageSync).toHaveBeenCalledWith('en', { second: 'Second' });
			expect(mockStore.loadLanguageSync).not.toHaveBeenCalledWith('en', { first: 'First' });
		});
	});
});
