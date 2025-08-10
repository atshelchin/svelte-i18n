import { setupI18n } from '../../application/stores/store.svelte.js';
import type { I18nInstance, TranslationFile } from '../../domain/models/types.js';
import { registerPackageTranslations } from '../../infrastructure/loaders/built-in.js';

// Import package translations directly
import en from '../../../translations/@shelchin/svelte-i18n/en.json' with { type: 'json' };
import zh from '../../../translations/@shelchin/svelte-i18n/zh.json' with { type: 'json' };
import ja from '../../../translations/@shelchin/svelte-i18n/ja.json' with { type: 'json' };
import fr from '../../../translations/@shelchin/svelte-i18n/fr.json' with { type: 'json' };

const packageTranslations = { en, zh, ja, fr };

let validationPopupI18n: I18nInstance | null = null;

/**
 * Get or create the namespaced i18n instance for ValidationPopup component
 * With auto-discovery enabled, it will automatically load translations from:
 * - /translations/@shelchin/svelte-i18n.{locale}.json
 * - /translations/@shelchin/svelte-i18n/{locale}.json
 */
export async function getValidationPopupI18n(): Promise<I18nInstance> {
	if (!validationPopupI18n) {
		// Create a namespaced i18n instance with auto-discovery enabled
		// Using the scoped package name as namespace
		validationPopupI18n = setupI18n({
			defaultLocale: 'en',
			fallbackLocale: 'en',
			namespace: '@shelchin/svelte-i18n', // Use scoped package name
			autoDiscovery: {
				baseUrl: '/translations',
				patterns: [
					'{namespace}.{locale}.json', // @shelchin/svelte-i18n.en.json
					'{namespace}/{locale}.json' // @shelchin/svelte-i18n/en.json
				],
				debug: import.meta.env?.DEV ?? false
			}
		});

		// Strategy:
		// 1. First load built-in translations as the base
		// 2. Auto-discovery will attempt to load user overrides from static
		// 3. User translations will merge with and override built-in ones

		// Register package translations globally
		registerPackageTranslations('@shelchin/svelte-i18n', packageTranslations);
		
		// Load the built-in translations first (these are bundled with the package)
		for (const [locale, translations] of Object.entries(packageTranslations)) {
			await validationPopupI18n.loadLanguage(locale, translations as TranslationFile);
		}

		// Auto-discovery will run automatically when locale changes
		// If user has placed custom translations in static/translations/,
		// they will be loaded and merged, overriding the built-in ones

		if (import.meta.env?.DEV) {
			console.info('ValidationPopup i18n initialized with built-in translations.');
			console.info('Loaded locales:', validationPopupI18n.locales);
			console.info('Current locale:', validationPopupI18n.locale);
			console.info(
				'User can override by placing files in static/translations/@shelchin/svelte-i18n.{locale}.json'
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
