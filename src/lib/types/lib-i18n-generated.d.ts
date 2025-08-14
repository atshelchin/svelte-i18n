/**
 * Auto-generated i18n type definitions
 * Generated from: en.json
 * Generated at: 2025-08-13T13:26:58.770Z
 */

// Type for all translation keys in your library
export type LibI18nPath =
	| '_meta.name'
	| '_meta.englishName'
	| '_meta.direction'
	| '_meta.flag'
	| '_meta.code'
	| 'validationPopup.header.title'
	| 'validationPopup.header.issues'
	| 'validationPopup.header.languages'
	| 'validationPopup.header.close'
	| 'validationPopup.controls.languageLabel'
	| 'validationPopup.controls.languageOption'
	| 'validationPopup.controls.export'
	| 'validationPopup.exportMenu.downloadJSON'
	| 'validationPopup.exportMenu.downloadText'
	| 'validationPopup.exportMenu.copyJSON'
	| 'validationPopup.exportMenu.copied'
	| 'validationPopup.pagination.page'
	| 'validationPopup.pagination.previous'
	| 'validationPopup.pagination.next'
	| 'validationPopup.emptyState.selectLanguage'
	| 'validationPopup.emptyState.noErrors'
	| 'validationPopup.floatingIndicator.translationIssues'
	| 'validationPopup.report.title'
	| 'validationPopup.report.language'
	| 'validationPopup.report.totalMissing'
	| 'validationPopup.report.details'
	| 'validationPopup.report.generatedAt'
	| 'validationPopup.report.todoTranslate'
	| 'demo.clickToCollapse'
	| 'demo.clickToViewCode'
	| 'demo.codeCopied'
	| 'demo.copyCode';

// Helper type for typed translation function
export interface TypedTranslate {
	(key: LibI18nPath, params?: Record<string, unknown>): string;
}
