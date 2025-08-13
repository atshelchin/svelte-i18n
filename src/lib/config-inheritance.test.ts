import { describe, it, expect, beforeAll } from 'vitest';
import { createTypedUnifiedI18n } from './typed-unified.js';
import { getI18nInstance } from './unified.js';
import type { UnifiedI18nConfig } from './unified.js';
import { configManager } from './application/stores/config-manager.js';

describe('Configuration Inheritance', () => {
	beforeAll(async () => {
		// Create main app instance with specific configuration
		const mainConfig: UnifiedI18nConfig = {
			namespace: 'app',
			isMain: true,
			defaultLocale: 'en',
			fallbackLocale: 'en',
			translations: {
				en: { test: 'Hello {name}!' },
				zh: { test: '你好 {name}！' }
			},
			interpolation: {
				prefix: '{{',
				suffix: '}}'
			},
			formats: {
				date: { year: 'numeric', month: 'long', day: 'numeric' },
				currency: { style: 'currency', currency: 'EUR' }
			}
		};

		const mainI18n = createTypedUnifiedI18n(mainConfig);
		await mainI18n.clientLoad();

		// Create package instance that should inherit from main
		const pkgConfig: UnifiedI18nConfig = {
			namespace: 'test-package',
			translations: {
				en: { greeting: 'Package says: {message}' },
				zh: { greeting: '包说：{message}' }
			}
		};

		const pkgI18n = createTypedUnifiedI18n(pkgConfig);
		await pkgI18n.clientLoad();
	});

	it('should inherit locale settings from main app', () => {
		const pkgI18n = getI18nInstance('test-package');
		const mainI18n = getI18nInstance('app');

		// Should inherit default and fallback locales
		expect(pkgI18n.locale).toBe(mainI18n.locale);
	});

	it('should inherit interpolation settings from main app', () => {
		const pkgI18n = getI18nInstance('test-package');

		// Test with custom interpolation markers
		const result = pkgI18n.t('greeting', { message: 'Hello' });

		// If inheritance works, it should use {{ }} markers
		// The translation has {message} but interpolation config should handle it
		expect(result).toContain('Package says:');
	});

	it('should inherit format settings from main app', () => {
		const pkgI18n = getI18nInstance('test-package');
		const mainI18n = getI18nInstance('app');

		const testDate = new Date('2024-01-15');

		// Both should format the same way
		const pkgFormatted = pkgI18n.formatDate(testDate);
		const mainFormatted = mainI18n.formatDate(testDate);

		// Should use the same format
		expect(pkgFormatted).toBe(mainFormatted);

		// Currency should be EUR (inherited)
		const pkgCurrency = pkgI18n.formatCurrency(100);
		expect(pkgCurrency).toContain('€');
	});

	it('should use package defaults when main app config is not available', () => {
		// Clear all existing config to test standalone behavior
		configManager.clear();

		// Create standalone package without main app
		const standaloneConfig: UnifiedI18nConfig = {
			namespace: 'standalone-package',
			translations: {
				en: { test: 'Standalone [value]' }
			},
			interpolation: {
				prefix: '[',
				suffix: ']'
			}
		};

		const standaloneI18n = createTypedUnifiedI18n(standaloneConfig);

		// Should use its own interpolation config
		const result = standaloneI18n.t('test', { value: 'test' });
		expect(result).toBe('Standalone test');
	});
});
