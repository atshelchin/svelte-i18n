import type { I18nInstance } from './types.js';

export interface AutoLoadOptions {
	translationsPath?: string;
	indexFile?: string;
	defaultLocale?: string;
	onError?: (locale: string, error: Error) => void;
	onLoaded?: (locale: string) => void;
}

/**
 * Automatically discovers and loads all available language files
 */
export async function autoLoadLanguages(
	i18n: I18nInstance,
	options: AutoLoadOptions = {}
): Promise<void> {
	const {
		translationsPath = '/translations',
		indexFile = 'index.json',
		defaultLocale,
		onError = (locale, err) => console.error(`Failed to load ${locale}:`, err),
		onLoaded = (locale) => console.log(`Loaded language: ${locale}`)
	} = options;

	try {
		// First, try to load the index file that lists available languages
		const indexUrl = `${translationsPath}/${indexFile}`;
		const indexResponse = await fetch(indexUrl);

		let availableLanguages: string[];

		if (indexResponse.ok) {
			const index = await indexResponse.json();
			availableLanguages = index.availableLanguages || [];
		} else {
			// Fallback: try common language codes
			console.warn('No index file found, trying common language codes');
			availableLanguages = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'ru', 'ar'];
		}

		// Load default locale first if specified
		if (defaultLocale && availableLanguages.includes(defaultLocale)) {
			const index = availableLanguages.indexOf(defaultLocale);
			availableLanguages.splice(index, 1);
			availableLanguages.unshift(defaultLocale);
		}

		// Load all available languages
		const loadPromises = availableLanguages.map(async (locale) => {
			try {
				const url = `${translationsPath}/${locale}.json`;
				await i18n.loadLanguage(locale, url);
				onLoaded(locale);
			} catch (error) {
				onError(locale, error as Error);
			}
		});

		await Promise.allSettled(loadPromises);
	} catch (error) {
		console.error('Failed to auto-load languages:', error);
		throw error;
	}
}

/**
 * Watches for new language files and loads them automatically
 * (Only works in development with proper dev server support)
 */
export function watchLanguages(i18n: I18nInstance, options: AutoLoadOptions = {}): () => void {
	if (!import.meta.hot) {
		console.warn('Hot reload not available, language watching disabled');
		return () => {};
	}

	// Re-load languages when files change
	const reload = () => autoLoadLanguages(i18n, options);

	import.meta.hot.on('translations-update', reload);

	return () => {
		import.meta.hot?.off('translations-update', reload);
	};
}
