/**
 * Example generated types for demonstration
 * In a real app, these would be generated from your translation files
 */

export interface I18nKeys {
	app: {
		title: string;
		welcome: string;
		nonExistentKey?: never; // This would cause an error if used
	};
}

export type I18nPath = 'app.title' | 'app.welcome';
