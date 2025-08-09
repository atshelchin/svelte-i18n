import { setupI18n } from '../store.svelte.js';
import type { I18nInstance, TranslationFile } from '../types.js';
import validationPopupEn from './translations/validation-popup-en.json' with { type: 'json' };
import validationPopupZh from './translations/validation-popup-zh.json' with { type: 'json' };

let validationPopupI18n: I18nInstance | null = null;

/**
 * Get or create the namespaced i18n instance for ValidationPopup component
 * With auto-discovery enabled, it will automatically load translations from:
 * - /translations/svelte-i18n-validation.{locale}.json
 * - /translations/validation-popup.{locale}.json
 * - /translations/components/validation-popup.{locale}.json
 */
export async function getValidationPopupI18n(): Promise<I18nInstance> {
	if (!validationPopupI18n) {
		// Create a namespaced i18n instance with auto-discovery enabled
		validationPopupI18n = setupI18n({
			defaultLocale: 'en',
			fallbackLocale: 'en',
			namespace: 'svelte-i18n-validation', // Unique namespace for this component
			autoDiscovery: {
				baseUrl: '/translations',
				patterns: [
					'validation-popup.{locale}.json',
					'{namespace}.{locale}.json',
					'components/validation-popup.{locale}.json'
				],
				debug: import.meta.env?.DEV ?? false
			}
		});

		// Strategy:
		// 1. First load built-in translations as the base
		// 2. Auto-discovery will attempt to load user overrides from static
		// 3. User translations will merge with and override built-in ones

		// Load the built-in translations first (these are bundled with the package)
		await validationPopupI18n.loadLanguage('en', validationPopupEn);
		await validationPopupI18n.loadLanguage('zh', validationPopupZh);

		// Auto-discovery will run automatically when locale changes
		// If user has placed custom translations in static/translations/,
		// they will be loaded and merged, overriding the built-in ones

		if (import.meta.env?.DEV) {
			console.info('ValidationPopup i18n initialized with built-in translations.');
			console.info(
				'User can override by placing files in static/translations/validation-popup.{locale}.json'
			);
		}
	}

	return validationPopupI18n;
}

/**
 * Load additional language for ValidationPopup
 */
export async function loadValidationPopupLanguage(
	locale: string,
	translations: TranslationFile
): Promise<void> {
	const i18n = await getValidationPopupI18n();
	await i18n.loadLanguage(locale, translations);
}
