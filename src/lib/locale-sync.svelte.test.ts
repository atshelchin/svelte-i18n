/**
 * @vitest-environment browser
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { setupI18n, clearAllInstances } from './application/stores/store.svelte.js';
import { registerBuiltInTranslations } from './infrastructure/loaders/built-in.js';
import { tick } from 'svelte';

describe('Global Locale Synchronization (Browser)', () => {
	beforeEach(() => {
		clearAllInstances();
		// Clear global locale manager
		if ((globalThis as any).__i18n_locale_manager) {
			(globalThis as any).__i18n_locale_manager = null;
		}
	});

	it('should sync locale changes from main app to all package instances', async () => {
		// Register translations for testing
		registerBuiltInTranslations({
			app: {
				en: { greeting: 'Hello' },
				fr: { greeting: 'Bonjour' },
				es: { greeting: 'Hola' }
			},
			'package-a': {
				en: { button: 'Click me' },
				fr: { button: 'Cliquez-moi' },
				es: { button: 'Haz clic' }
			},
			'package-b': {
				en: { label: 'Label' },
				fr: { label: 'Étiquette' },
				es: { label: 'Etiqueta' }
			}
		});

		// Create main app instance
		const appI18n = setupI18n({
			defaultLocale: 'en',
			fallbackLocale: 'en'
		});

		// Create package instances
		const packageAI18n = setupI18n({
			namespace: 'package-a',
			defaultLocale: 'en',
			fallbackLocale: 'en'
		});

		const packageBI18n = setupI18n({
			namespace: 'package-b',
			defaultLocale: 'en',
			fallbackLocale: 'en'
		});

		// Load translations
		await appI18n.clientLoad();
		await packageAI18n.clientLoad();
		await packageBI18n.clientLoad();

		// Initial state - all should be 'en'
		expect(appI18n.locale).toBe('en');
		expect(packageAI18n.locale).toBe('en');
		expect(packageBI18n.locale).toBe('en');

		// Change main app locale to French
		await appI18n.setLocale('fr');

		// Wait for effects to run
		await tick();

		// All instances should now be 'fr'
		expect(appI18n.locale).toBe('fr');
		expect(packageAI18n.locale).toBe('fr');
		expect(packageBI18n.locale).toBe('fr');

		// Verify translations are correct
		expect(appI18n.t('greeting')).toBe('Bonjour');
		expect(packageAI18n.t('button')).toBe('Cliquez-moi');
		expect(packageBI18n.t('label')).toBe('Étiquette');

		// Change to Spanish
		await appI18n.setLocale('es');

		// Wait for effects to run
		await tick();

		// All instances should now be 'es'
		expect(appI18n.locale).toBe('es');
		expect(packageAI18n.locale).toBe('es');
		expect(packageBI18n.locale).toBe('es');

		// Verify Spanish translations
		expect(appI18n.t('greeting')).toBe('Hola');
		expect(packageAI18n.t('button')).toBe('Haz clic');
		expect(packageBI18n.t('label')).toBe('Etiqueta');
	});

	it('should handle cases where package does not have the requested locale', async () => {
		// Register translations - package-a doesn't have 'de' locale
		registerBuiltInTranslations({
			app: {
				en: { greeting: 'Hello' },
				de: { greeting: 'Hallo' }
			},
			'package-a': {
				en: { button: 'Click me' }
				// No German translation
			}
		});

		// Create instances
		const appI18n = setupI18n({
			defaultLocale: 'en',
			fallbackLocale: 'en'
		});

		const packageAI18n = setupI18n({
			namespace: 'package-a',
			defaultLocale: 'en',
			fallbackLocale: 'en'
		});

		// Load translations
		await appI18n.clientLoad();
		await packageAI18n.clientLoad();

		// Change to German
		await appI18n.setLocale('de');

		// Wait for effects to run
		await tick();

		// Main app should be 'de'
		expect(appI18n.locale).toBe('de');
		// Package should remain 'en' since it doesn't have 'de'
		expect(packageAI18n.locale).toBe('en');
	});

	it('should allow packages to change locale independently', async () => {
		// Register translations
		registerBuiltInTranslations({
			'package-a': {
				en: { button: 'Click me' },
				fr: { button: 'Cliquez-moi' }
			}
		});

		// Create package instance without main app
		const packageAI18n = setupI18n({
			namespace: 'package-a',
			defaultLocale: 'en',
			fallbackLocale: 'en'
		});

		await packageAI18n.clientLoad();

		// Should work independently when no main app exists
		expect(packageAI18n.locale).toBe('en');
		await packageAI18n.setLocale('fr');
		expect(packageAI18n.locale).toBe('fr');
		expect(packageAI18n.t('button')).toBe('Cliquez-moi');
	});
});
