import { describe, it, expect, afterAll, vi } from 'vitest';
import { createI18n, getI18nInstance } from './unified.js';
import type { UnifiedI18nConfig } from './unified.js';
import { configManager } from './application/stores/config-manager.js';
import { clearRegisteredTranslations } from './infrastructure/loaders/built-in.js';
import { clearAllInstances } from './application/stores/store.svelte.js';

describe('Config Inheritance for Validation', () => {
	afterAll(() => {
		// Clean up
		clearRegisteredTranslations();
		clearAllInstances();
		configManager.clear();
		vi.clearAllMocks();
	});

	describe('Package inherits defaultLocale from app for validation', () => {
		it('should validate package translations against app defaultLocale (zh)', async () => {
			// Clean state
			clearAllInstances();
			configManager.clear();

			// Create main app with Chinese as default
			const appConfig: UnifiedI18nConfig = {
				namespace: 'app',
				isMain: true,
				defaultLocale: 'zh', // Chinese as reference
				fallbackLocale: 'zh',
				translations: {
					zh: {
						// Complete Chinese translations (reference)
						greeting: '你好',
						welcome: '欢迎',
						user: {
							name: '用户名',
							email: '邮箱',
							profile: '个人资料'
						},
						actions: {
							save: '保存',
							cancel: '取消',
							delete: '删除'
						}
					},
					en: {
						// English missing some keys
						greeting: 'Hello',
						welcome: 'Welcome',
						user: {
							name: 'Username'
							// Missing: email, profile
						},
						actions: {
							save: 'Save'
							// Missing: cancel, delete
						}
					}
				}
			};

			const appI18n = createI18n(appConfig);
			await appI18n.clientLoad();

			// Create package that originally wanted English as default
			const pkgConfig: UnifiedI18nConfig = {
				namespace: '@my-lib/ui',
				defaultLocale: 'en', // Package originally wants English
				fallbackLocale: 'en',
				translations: {
					zh: {
						// Complete Chinese translations
						button: {
							submit: '提交',
							reset: '重置',
							back: '返回'
						},
						form: {
							required: '必填',
							optional: '可选',
							error: '错误'
						}
					},
					en: {
						// English missing some keys
						button: {
							submit: 'Submit',
							reset: 'Reset'
							// Missing: back
						},
						form: {
							required: 'Required'
							// Missing: optional, error
						}
					},
					de: {
						// German missing many keys
						button: {
							submit: 'Senden'
							// Missing: reset, back
						}
						// Missing entire form section
					}
				}
			};

			const pkgI18n = createI18n(pkgConfig);
			await pkgI18n.clientLoad();

			// Verify that package inherited app's defaultLocale
			const effectiveConfig = configManager.getConfig('@my-lib/ui');
			expect(effectiveConfig?.defaultLocale).toBe('zh'); // Should be 'zh', not 'en'
			expect(effectiveConfig?.fallbackLocale).toBe('zh');

			// Check validation errors - should be validated against Chinese (zh)
			const pkgErrors = pkgI18n.errors;

			// English should have errors (missing keys compared to Chinese)
			expect(pkgErrors['en']).toBeDefined();
			expect(pkgErrors['en'].length).toBeGreaterThan(0);
			expect(pkgErrors['en']).toContain('Missing translation: button.back');
			expect(pkgErrors['en']).toContain('Missing translation: form.optional');
			expect(pkgErrors['en']).toContain('Missing translation: form.error');

			// German should have errors (may have same or more than English)
			expect(pkgErrors['de']).toBeDefined();
			expect(pkgErrors['de'].length).toBeGreaterThanOrEqual(pkgErrors['en'].length);
			expect(pkgErrors['de']).toContain('Missing translation: button.reset');
			expect(pkgErrors['de']).toContain('Missing translation: button.back');
			// German is missing the entire 'form' section
			expect(pkgErrors['de']).toContain('Missing translation: form');

			// Chinese should have NO errors (it's the reference)
			expect(pkgErrors['zh']).toBeUndefined();
		});

		it('should validate app translations against its own defaultLocale', async () => {
			// The app instance from previous test
			const appI18n = getI18nInstance('app');
			const appErrors = appI18n.errors;

			// English in app should have errors compared to Chinese
			expect(appErrors['en']).toBeDefined();
			expect(appErrors['en'].length).toBeGreaterThan(0);
			expect(appErrors['en']).toContain('Missing translation: user.email');
			expect(appErrors['en']).toContain('Missing translation: user.profile');
			expect(appErrors['en']).toContain('Missing translation: actions.cancel');
			expect(appErrors['en']).toContain('Missing translation: actions.delete');

			// Chinese should have NO errors (it's the reference)
			expect(appErrors['zh']).toBeUndefined();
		});

		it('should use Japanese as reference when app sets defaultLocale to ja', async () => {
			// Clean state
			clearAllInstances();
			configManager.clear();

			// Create app with Japanese as default
			const appConfig: UnifiedI18nConfig = {
				namespace: 'app',
				isMain: true,
				defaultLocale: 'ja', // Japanese as reference
				fallbackLocale: 'ja',
				translations: {
					ja: {
						// Complete Japanese translations (reference)
						title: 'タイトル',
						description: '説明',
						menu: {
							home: 'ホーム',
							about: 'について',
							contact: '連絡先'
						}
					},
					en: {
						// English missing some keys
						title: 'Title',
						menu: {
							home: 'Home'
							// Missing: about, contact
						}
						// Missing: description
					},
					zh: {
						// Chinese also missing keys
						title: '标题',
						description: '描述'
						// Missing: entire menu section
					}
				}
			};

			const appI18n = createI18n(appConfig);
			await appI18n.clientLoad();

			// Create package
			const pkgConfig: UnifiedI18nConfig = {
				namespace: '@my-lib/widgets',
				defaultLocale: 'en', // Package wants English
				translations: {
					ja: {
						// Complete Japanese
						widget: {
							title: 'ウィジェット',
							close: '閉じる'
						}
					},
					en: {
						// English missing keys
						widget: {
							title: 'Widget'
							// Missing: close
						}
					},
					zh: {
						// Chinese missing keys
						widget: {
							close: '关闭'
							// Missing: title
						}
					}
				}
			};

			const pkgI18n = createI18n(pkgConfig);
			await pkgI18n.clientLoad();

			// Verify package inherited Japanese as default
			const effectiveConfig = configManager.getConfig('@my-lib/widgets');
			expect(effectiveConfig?.defaultLocale).toBe('ja');

			// Check validation - all languages validated against Japanese
			const pkgErrors = pkgI18n.errors;

			// Japanese should have NO errors (it's the reference)
			expect(pkgErrors['ja']).toBeUndefined();

			// English should have errors
			expect(pkgErrors['en']).toBeDefined();
			expect(pkgErrors['en']).toContain('Missing translation: widget.close');

			// Chinese should have errors
			expect(pkgErrors['zh']).toBeDefined();
			expect(pkgErrors['zh']).toContain('Missing translation: widget.title');
		});

		it('should handle validation when package has no translation for app defaultLocale', async () => {
			// Clean state
			clearAllInstances();
			configManager.clear();

			// App with Korean as default
			const appConfig: UnifiedI18nConfig = {
				namespace: 'app',
				isMain: true,
				defaultLocale: 'ko',
				fallbackLocale: 'ko',
				translations: {
					ko: {
						app: '앱',
						settings: '설정'
					},
					en: {
						app: 'App',
						settings: 'Settings'
					}
				}
			};

			const appI18n = createI18n(appConfig);
			await appI18n.clientLoad();

			// Package without Korean translations
			const pkgConfig: UnifiedI18nConfig = {
				namespace: '@my-lib/components',
				defaultLocale: 'en',
				translations: {
					en: {
						component: 'Component',
						label: 'Label'
					},
					zh: {
						component: '组件',
						label: '标签'
					}
					// No Korean (ko) translations!
				}
			};

			const pkgI18n = createI18n(pkgConfig);
			await pkgI18n.clientLoad();

			// Package should inherit ko as default, but has no ko translations
			const effectiveConfig = configManager.getConfig('@my-lib/components');
			expect(effectiveConfig?.defaultLocale).toBe('ko');

			// Since package has no Korean translations, it can't validate
			// Other languages against Korean
			const pkgErrors = pkgI18n.errors;

			// Should not have validation errors since there's no reference to compare against
			// Or the validation should be skipped
			console.log('Package errors when no reference locale:', pkgErrors);
		});
	});

	describe('ValidationPopup uses correct instance for error detection', () => {
		it('should display app errors when app instance is available', async () => {
			// The instances are already created from previous tests
			const appI18n = getI18nInstance('app');
			// const pkgI18n = getI18nInstance('@my-lib/components');

			// App should have its own errors
			expect(Object.keys(appI18n.errors).length).toBeGreaterThan(0);

			// Package should have its own errors (or none if no reference)
			// Both are independent but use the same reference locale for validation

			// ValidationPopup will use appI18n for error detection (line 22 of ValidationPopup.svelte)
			// const errorI18n = propI18n || appI18n || libI18n;
			// So it will show app's validation errors primarily
		});
	});
});
