import { DEV } from '../../utils/env.js';
import { setupI18n } from '../../application/stores/store.svelte.js';
import type { I18nInstance, TranslationFile } from '../../domain/models/types.js';
import { registerPackageTranslations } from '../../infrastructure/loaders/built-in.js';

// Import package translations directly (only built-in ones)
import en from '../../../translations/@shelchin/svelte-i18n/en.json' with { type: 'json' };
import zh from '../../../translations/@shelchin/svelte-i18n/zh.json' with { type: 'json' };
import ja from '../../../translations/@shelchin/svelte-i18n/ja.json' with { type: 'json' };
// Note: fr.json is configured for auto-discovery in index.json, not built-in

const packageTranslations = { en, zh, ja };

let validationPopupI18n: I18nInstance | null = null;

/**
 * Get or create the namespaced i18n instance for ValidationPopup component
 * All translations are built-in and bundled with the package
 */
export async function getValidationPopupI18n(): Promise<I18nInstance> {
	if (!validationPopupI18n) {
		// Register package translations globally first (before creating instance)
		// This ensures they're available for the built-in loader
		registerPackageTranslations('@shelchin/svelte-i18n', packageTranslations);

		// Create a namespaced i18n instance with optional auto-discovery
		// Built-in translations are loaded first, then auto-discovery can add more
		validationPopupI18n = setupI18n({
			defaultLocale: 'en',
			fallbackLocale: 'en',
			namespace: '@shelchin/svelte-i18n', // Use scoped package name
			autoDiscovery: {
				baseUrl: '/translations',
				patterns: [
					'{namespace}/{locale}.json', // @shelchin/svelte-i18n/en.json
					'{namespace}.{locale}.json' // @shelchin/svelte-i18n.en.json
				],
				debug: DEV
				// Only show debug logs in dev mode
			}
		});

		// Use clientLoad to load both built-in and auto-discovered translations
		// This will:
		// 1. Load built-in translations (en, zh, ja) from the global registry
		// 2. Load auto-discovered translations (fr, zh) from index.json
		if (typeof window !== 'undefined') {
			await validationPopupI18n.clientLoad();
		} else {
			// Server-side: only load built-in translations
			for (const [locale, translations] of Object.entries(packageTranslations)) {
				await validationPopupI18n.loadLanguage(locale, translations as TranslationFile);
			}
		}

		if (DEV) {
			console.info('ValidationPopup i18n initialized with translations.');
			console.info('Loaded locales:', validationPopupI18n.locales);
			console.info('Current locale:', validationPopupI18n.locale);
			console.info(
				'Users can add translations in /translations/@shelchin/svelte-i18n/{locale}.json'
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
