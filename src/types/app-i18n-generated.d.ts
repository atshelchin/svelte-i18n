/**
 * Auto-generated i18n type definitions
 * Generated from: ar.json
 * Generated at: 2025-08-13T08:11:53.333Z
 */

// Type for all translation keys in your application
export type I18nPath =
	| '_meta.name'
	| '_meta.englishName'
	| '_meta.direction'
	| '_meta.flag'
	| '_meta.code'
	| 'welcome'
	| 'greeting'
	| 'nav.home'
	| 'nav.about'
	| 'nav.contact'
	| 'nav.settings'
	| 'user.profile.title'
	| 'user.profile.name'
	| 'user.profile.email'
	| 'user.profile.bio'
	| 'user.settings.title'
	| 'user.settings.language'
	| 'user.settings.theme'
	| 'user.settings.notifications'
	| 'items.count'
	| 'items.empty'
	| 'items.loading'
	| 'actions.save'
	| 'actions.cancel'
	| 'actions.delete'
	| 'actions.edit'
	| 'actions.submit'
	| 'actions.search'
	| 'messages.success'
	| 'messages.error'
	| 'messages.loading'
	| 'messages.confirmDelete'
	| 'date.today'
	| 'date.yesterday'
	| 'date.tomorrow'
	| 'date.format'
	| 'demo.title'
	| 'demo.features'
	| 'demo.interpolation'
	| 'demo.pluralization'
	| 'demo.nested'
	| 'demo.formatting'
	| 'demo.switchLanguage'
	| 'demo.currentLocale'
	| 'demo.tryIt';

// Helper type for typed translation function
export interface TypedTranslate {
	(key: I18nPath, params?: Record<string, any>): string;
}
