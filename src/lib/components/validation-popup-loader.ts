import type { I18nInstance } from '../types.js';

/**
 * Auto-discovery of ValidationPopup translations
 *
 * This loader will automatically look for translation files in the application's
 * static/translations directory following the naming convention:
 * - validation-popup.{locale}.json
 * - svelte-i18n-validation.{locale}.json
 *
 * This allows developers to add new language support without modifying the package
 */
export async function autoLoadValidationPopupTranslations(
	i18n: I18nInstance,
	baseUrl: string = '/translations'
): Promise<void> {
	const currentLocale = i18n.locale;

	// Try multiple naming conventions for flexibility
	const possibleFiles = [
		`${baseUrl}/validation-popup.${currentLocale}.json`,
		`${baseUrl}/svelte-i18n-validation.${currentLocale}.json`,
		`${baseUrl}/components/validation-popup.${currentLocale}.json`
	];

	for (const file of possibleFiles) {
		try {
			const response = await fetch(file);
			if (response.ok) {
				const translations = await response.json();

				// Validate that it contains the expected structure
				if (translations.validationPopup) {
					await i18n.loadLanguage(currentLocale, translations);
					console.info(`✅ Loaded ValidationPopup translations for ${currentLocale} from ${file}`);
					return; // Stop after first successful load
				}
			}
		} catch {
			// Silently continue to next possible file
			continue;
		}
	}

	// No custom translations found, which is okay - will use built-in or fallback
	console.debug(`No custom ValidationPopup translations found for ${currentLocale}`);
}

/**
 * Register a global translation loader that works with the main i18n instance
 * This allows ValidationPopup to use translations from the main app
 */
export function registerValidationPopupWithMainI18n(
	mainI18n: I18nInstance,
	validationI18n: I18nInstance
): void {
	// Watch for locale changes in main i18n
	let lastLocale = mainI18n.locale;

	// Create a reactive effect to sync locales
	const syncLocales = () => {
		if (mainI18n.locale !== lastLocale) {
			lastLocale = mainI18n.locale;

			// Check if ValidationPopup i18n has this locale
			if (validationI18n.locales.includes(mainI18n.locale)) {
				validationI18n.setLocale(mainI18n.locale);
			} else {
				// Try to auto-load from static files
				autoLoadValidationPopupTranslations(validationI18n).then(() => {
					if (validationI18n.locales.includes(mainI18n.locale)) {
						validationI18n.setLocale(mainI18n.locale);
					}
				});
			}
		}
	};

	// Run sync on interval (simple approach for demo)
	setInterval(syncLocales, 100);
}

/**
 * Convention-based loader for ValidationPopup translations
 * Looks for files in these locations (in order):
 * 1. /translations/validation-popup.{locale}.json
 * 2. /translations/svelte-i18n-validation.{locale}.json
 * 3. /translations/components/validation-popup.{locale}.json
 */
export async function loadValidationPopupFromStatic(
	i18n: I18nInstance,
	locale: string,
	options: {
		baseUrl?: string;
		fallbackToBuiltIn?: boolean;
	} = {}
): Promise<boolean> {
	const { baseUrl = '/translations', fallbackToBuiltIn = true } = options;

	const files = [
		`validation-popup.${locale}.json`,
		`svelte-i18n-validation.${locale}.json`,
		`components/validation-popup.${locale}.json`
	];

	for (const filename of files) {
		try {
			const url = `${baseUrl}/${filename}`;
			const response = await fetch(url);

			if (response.ok) {
				const data = await response.json();

				// Ensure the data has the correct structure
				if (!data.validationPopup) {
					console.warn(`Invalid structure in ${url}: missing 'validationPopup' key`);
					continue;
				}

				await i18n.loadLanguage(locale, data);
				console.info(`✅ Loaded ValidationPopup translations for '${locale}' from ${url}`);
				return true;
			}
		} catch {
			// Continue to next file
			continue;
		}
	}

	if (fallbackToBuiltIn) {
		console.debug(
			`No custom translations found for ValidationPopup (${locale}), using built-in or fallback`
		);
	}

	return false;
}
