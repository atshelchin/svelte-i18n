import type { I18nInstance } from '../../domain/models/types.js';
import { getAppBasePath } from './base-path.js';

export interface AutoLoadOptions {
	translationsPath?: string;
	indexFile?: string;
	defaultLocale?: string;
	onError?: (locale: string, error: Error) => void;
	onLoaded?: (locale: string) => void;
}

interface AutoDiscoveryConfig {
	enabled: boolean;
	app?: {
		languages: string[];
	};
	packages?: {
		[packageName: string]: {
			languages: string[];
		};
	};
}

/**
 * Automatically discovers and loads all available language files
 */
export async function autoLoadLanguages(
	i18n: I18nInstance,
	options: AutoLoadOptions = {}
): Promise<void> {
	// Get base path for the application
	const basePath = getAppBasePath();

	const {
		translationsPath = basePath ? `${basePath}/translations` : '/translations',
		indexFile = 'index.json',
		defaultLocale,
		onError = (locale, err) => {
			// Only log errors in development or for server errors
			if (import.meta.env?.DEV) {
				console.error(`Failed to load ${locale}:`, err);
			}
		},
		onLoaded = (locale) => {
			// Only log in development
			if (import.meta.env?.DEV) {
				console.log(`Loaded language: ${locale}`);
			}
		}
	} = options;

	try {
		// index.json has the highest priority - it defines which languages the site supports
		const indexUrl = `${translationsPath}/${indexFile}`;
		// Ensure URL is absolute from the root
		const absoluteIndexUrl =
			typeof window !== 'undefined' && !indexUrl.startsWith('http')
				? new URL(indexUrl, window.location.origin).href
				: indexUrl;
		const indexResponse = await fetch(absoluteIndexUrl);

		let availableLanguages: string[];

		if (indexResponse.ok) {
			// index.json found - use it as the authoritative list
			const index = await indexResponse.json();
			availableLanguages = index.availableLanguages || [];

			if (import.meta.env?.DEV) {
				console.debug(`index.json declares supported languages: ${availableLanguages.join(', ')}`);
			}
		} else {
			// No index.json - no additional languages to load from static/translations
			// Only built-in languages are available
			if (import.meta.env?.DEV) {
				console.debug('No index.json found - only built-in languages available');
			}
			return; // Exit early
		}

		// Load default locale first if specified
		if (defaultLocale && availableLanguages.includes(defaultLocale)) {
			const index = availableLanguages.indexOf(defaultLocale);
			availableLanguages.splice(index, 1);
			availableLanguages.unshift(defaultLocale);
		}

		// Load languages that are declared in index.json but not yet loaded
		// This handles languages from static/translations that aren't built-in
		const loadPromises = availableLanguages.map(async (locale) => {
			// Skip if this locale is already loaded (e.g., from built-in translations)
			if (i18n.locales.includes(locale)) {
				if (import.meta.env?.DEV && import.meta.env?.VITE_I18N_DEBUG === 'true') {
					console.debug(`${locale} - already loaded (built-in)`);
				}
				return;
			}

			try {
				// Try to load from static/translations/{locale}.json
				const url = `${translationsPath}/${locale}.json`;
				const absoluteUrl =
					typeof window !== 'undefined' && !url.startsWith('http')
						? new URL(url, window.location.origin).href
						: url;

				const response = await fetch(absoluteUrl);
				if (response.ok) {
					const translations = await response.json();
					await i18n.loadLanguage(locale, translations);
					onLoaded(locale);
				} else if (response.status === 404) {
					// 404 means this language is declared but has no translation file
					// This is OK - maybe it will be added later
					if (import.meta.env?.DEV && import.meta.env?.VITE_I18N_DEBUG === 'true') {
						console.debug(`${locale} - declared but no translation file found (404)`);
					}
				} else {
					throw new Error(`HTTP ${response.status}`);
				}
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
