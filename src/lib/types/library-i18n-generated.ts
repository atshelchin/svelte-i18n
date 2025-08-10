/**
 * Auto-generated i18n type definitions for @shelchin/svelte-i18n
 * DO NOT EDIT MANUALLY
 *
 * Generated from: src/translations/@shelchin/svelte-i18n/en.json
 * Generated at: 2025-08-10T08:40:04.081Z
 */

// Helper type for parameters
type ParamsKey<T> = { key: string; params: T };

// Main translation structure
export interface I18nKeys {
	validationPopup: {
		header: {
			title: string;
			issues: ParamsKey<{ count: string | number }>;
			languages: ParamsKey<{ count: string | number }>;
			close: string;
		};
		controls: {
			languageLabel: string;
			languageOption: ParamsKey<{
				flag: string | number;
				name: string | number;
				count: string | number;
			}>;
			export: string;
		};
		exportMenu: {
			downloadJSON: string;
			downloadText: string;
			copyJSON: string;
			copied: string;
		};
		pagination: {
			page: ParamsKey<{ current: string | number; total: string | number }>;
			previous: string;
			next: string;
		};
		emptyState: {
			selectLanguage: string;
			noErrors: string;
		};
		floatingIndicator: {
			translationIssues: string;
		};
		report: {
			title: string;
			language: ParamsKey<{ name: string | number; code: string | number }>;
			totalMissing: ParamsKey<{ count: string | number }>;
			details: string;
			generatedAt: ParamsKey<{ date: string | number }>;
			todoTranslate: ParamsKey<{ language: string | number }>;
		};
	};
}

// All translation paths
export type I18nPath =
	| 'validationPopup.header'
	| 'validationPopup.header.title'
	| 'validationPopup.header.issues'
	| 'validationPopup.header.languages'
	| 'validationPopup.header.close'
	| 'validationPopup.controls'
	| 'validationPopup.controls.languageLabel'
	| 'validationPopup.controls.languageOption'
	| 'validationPopup.controls.export'
	| 'validationPopup.exportMenu'
	| 'validationPopup.exportMenu.downloadJSON'
	| 'validationPopup.exportMenu.downloadText'
	| 'validationPopup.exportMenu.copyJSON'
	| 'validationPopup.exportMenu.copied'
	| 'validationPopup.pagination'
	| 'validationPopup.pagination.page'
	| 'validationPopup.pagination.previous'
	| 'validationPopup.pagination.next'
	| 'validationPopup.emptyState'
	| 'validationPopup.emptyState.selectLanguage'
	| 'validationPopup.emptyState.noErrors'
	| 'validationPopup.floatingIndicator'
	| 'validationPopup.floatingIndicator.translationIssues'
	| 'validationPopup.report'
	| 'validationPopup.report.title'
	| 'validationPopup.report.language'
	| 'validationPopup.report.totalMissing'
	| 'validationPopup.report.details'
	| 'validationPopup.report.generatedAt'
	| 'validationPopup.report.todoTranslate';

// Get value type for a path
type GetValue<T, P extends string> = P extends keyof T
	? T[P]
	: P extends `${infer K}.${infer R}`
		? K extends keyof T
			? T[K] extends Record<string, unknown>
				? GetValue<T[K], R>
				: never
			: never
		: never;

// Extract params from value
type ExtractParams<V> = V extends ParamsKey<infer P> ? P : never;

// Type-safe translation function
export interface TypedI18n {
	<P extends I18nPath>(
		key: P,
		...params: ExtractParams<GetValue<I18nKeys, P>> extends never
			? []
			: [ExtractParams<GetValue<I18nKeys, P>>]
	): string;
}

// Create typed i18n instance
export function createTypedI18n(
	t: (key: string, params?: Record<string, unknown>) => string
): TypedI18n {
	return ((key: string, params?: Record<string, unknown>) => t(key, params)) as TypedI18n;
}

// Export all paths for runtime validation
export const I18N_PATHS = [
	'validationPopup.header',
	'validationPopup.header.title',
	'validationPopup.header.issues',
	'validationPopup.header.languages',
	'validationPopup.header.close',
	'validationPopup.controls',
	'validationPopup.controls.languageLabel',
	'validationPopup.controls.languageOption',
	'validationPopup.controls.export',
	'validationPopup.exportMenu',
	'validationPopup.exportMenu.downloadJSON',
	'validationPopup.exportMenu.downloadText',
	'validationPopup.exportMenu.copyJSON',
	'validationPopup.exportMenu.copied',
	'validationPopup.pagination',
	'validationPopup.pagination.page',
	'validationPopup.pagination.previous',
	'validationPopup.pagination.next',
	'validationPopup.emptyState',
	'validationPopup.emptyState.selectLanguage',
	'validationPopup.emptyState.noErrors',
	'validationPopup.floatingIndicator',
	'validationPopup.floatingIndicator.translationIssues',
	'validationPopup.report',
	'validationPopup.report.title',
	'validationPopup.report.language',
	'validationPopup.report.totalMissing',
	'validationPopup.report.details',
	'validationPopup.report.generatedAt',
	'validationPopup.report.todoTranslate'
] as const;
