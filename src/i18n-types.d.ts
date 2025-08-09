/**
 * Auto-generated translation types
 * Generated from: static/translations/en.json
 * Namespace: default
 */

export interface TranslationTypesSchema {
	welcome: string;
	greeting: string;
	nav: {
		home: string;
		about: string;
		contact: string;
		settings: string;
	};
	user: {
		profile: {
			title: string;
			name: string;
			email: string;
			bio: string;
		};
		settings: {
			title: string;
			language: string;
			theme: string;
			notifications: string;
		};
	};
	items: {
		count: string;
		empty: string;
		loading: string;
	};
	actions: {
		save: string;
		cancel: string;
		delete: string;
		edit: string;
		submit: string;
		search: string;
	};
	messages: {
		success: string;
		error: string;
		loading: string;
		confirmDelete: string;
	};
	date: {
		today: string;
		yesterday: string;
		tomorrow: string;
		format: string;
	};
	demo: {
		title: string;
		features: string;
		interpolation: string;
		pluralization: string;
		nested: string;
		formatting: string;
		switchLanguage: string;
		currentLocale: string;
		tryIt: string;
		loadingTranslations: string;
		noTranslationsLoaded: string;
		noTranslationsMessage: string;
		checkConsole: string;
		enterName: string;
		transComponent: string;
		autoLoadedLanguages: string;
		allLanguagesLoaded: string;
		languagePreferenceSaved: string;
		validationErrors: string;
		showFormattingExamples: string;
		hideFormattingExamples: string;
		dateFormats: string;
		timeFormats: string;
		numberFormats: string;
		currencyAutoDetected: string;
		otherFormats: string;
		short: string;
		medium: string;
		long: string;
		full: string;
		standard: string;
		decimal: string;
		compact: string;
		percent: string;
		relativeTime: string;
		list: string;
		coreFeatures: string;
		typeSafety: string;
		fullTypeScript: string;
		svelte5Runes: string;
		builtWithRunes: string;
		locales100Plus: string;
		supportAllLanguages: string;
		persistent: string;
		userPreferencesSaved: string;
		namespaceIsolation: string;
		isolateTranslations: string;
		runtimeValidation: string;
		automaticDetection: string;
		lazyLoading: string;
		loadOnDemand: string;
		hotReload: string;
		addLanguagesWithoutRebuild: string;
		quickStart: string;
		exampleCode: string;
		showCode: string;
		hideCode: string;
		clickToViewCode: string;
		clickToCollapse: string;
		copyCode: string;
		codeCopied: string;
		languagesLoadedCount: string;
		localesSupported: string;
		dependencies: string;
		svelteVersion: string;
		madeWithLove: string;
		github: string;
		documentation: string;
		apiReference: string;
		overview: string;
		translation: string;
		validation: string;
		advanced: string;
		svelteReady: string;
		modernI18n: string;
		powerfulLibrary: string;
	};
	editor: {
		title: string;
		subtitle: string;
		backToHome: string;
		loadFromFile: string;
		loadFromUrl: string;
		uploadFile: string;
		uploadDescription: string;
		addMoreSources: string;
		chooseFile: string;
		loadFromUrlTitle: string;
		loadFromUrlDescription: string;
		loading: string;
		load: string;
		expectedFormat: string;
		sourceLanguages: string;
		removeSource: string;
		addSource: string;
		sourcesLoaded: string;
		progress: string;
		translated: string;
		targetLanguage: string;
		enterLanguage: string;
		languageNotRecognized: string;
		aiAssistant: string;
		enableAI: string;
		openaiKey: string;
		translating: string;
		translateAll: string;
		export: string;
		download: string;
		translation: string;
		translationFields: string;
		searchKeys: string;
		translateWithAI: string;
		target: string;
		enterTranslation: string;
		fields: string;
		downloadSuccess: string;
		confirmTranslateAll: string;
		translateSuccess: string;
		translateFailed: string;
		errors: {
			invalidUrl: string;
			maxSources: string;
			loadFailed: string;
			jsonOnly: string;
			parseFailed: string;
			aiConfig: string;
			noSource: string;
			noTargetLang: string;
		};
	};
}

export type TranslationTypesKeys =
	| 'welcome'
	| 'greeting'
	| 'nav'
	| 'nav.home'
	| 'nav.about'
	| 'nav.contact'
	| 'nav.settings'
	| 'user'
	| 'user.profile'
	| 'user.profile.title'
	| 'user.profile.name'
	| 'user.profile.email'
	| 'user.profile.bio'
	| 'user.settings'
	| 'user.settings.title'
	| 'user.settings.language'
	| 'user.settings.theme'
	| 'user.settings.notifications'
	| 'items'
	| 'items.count'
	| 'items.empty'
	| 'items.loading'
	| 'actions'
	| 'actions.save'
	| 'actions.cancel'
	| 'actions.delete'
	| 'actions.edit'
	| 'actions.submit'
	| 'actions.search'
	| 'messages'
	| 'messages.success'
	| 'messages.error'
	| 'messages.loading'
	| 'messages.confirmDelete'
	| 'date'
	| 'date.today'
	| 'date.yesterday'
	| 'date.tomorrow'
	| 'date.format'
	| 'demo'
	| 'demo.title'
	| 'demo.features'
	| 'demo.interpolation'
	| 'demo.pluralization'
	| 'demo.nested'
	| 'demo.formatting'
	| 'demo.switchLanguage'
	| 'demo.currentLocale'
	| 'demo.tryIt'
	| 'demo.loadingTranslations'
	| 'demo.noTranslationsLoaded'
	| 'demo.noTranslationsMessage'
	| 'demo.checkConsole'
	| 'demo.enterName'
	| 'demo.transComponent'
	| 'demo.autoLoadedLanguages'
	| 'demo.allLanguagesLoaded'
	| 'demo.languagePreferenceSaved'
	| 'demo.validationErrors'
	| 'demo.showFormattingExamples'
	| 'demo.hideFormattingExamples'
	| 'demo.dateFormats'
	| 'demo.timeFormats'
	| 'demo.numberFormats'
	| 'demo.currencyAutoDetected'
	| 'demo.otherFormats'
	| 'demo.short'
	| 'demo.medium'
	| 'demo.long'
	| 'demo.full'
	| 'demo.standard'
	| 'demo.decimal'
	| 'demo.compact'
	| 'demo.percent'
	| 'demo.relativeTime'
	| 'demo.list'
	| 'demo.coreFeatures'
	| 'demo.typeSafety'
	| 'demo.fullTypeScript'
	| 'demo.svelte5Runes'
	| 'demo.builtWithRunes'
	| 'demo.locales100Plus'
	| 'demo.supportAllLanguages'
	| 'demo.persistent'
	| 'demo.userPreferencesSaved'
	| 'demo.namespaceIsolation'
	| 'demo.isolateTranslations'
	| 'demo.runtimeValidation'
	| 'demo.automaticDetection'
	| 'demo.lazyLoading'
	| 'demo.loadOnDemand'
	| 'demo.hotReload'
	| 'demo.addLanguagesWithoutRebuild'
	| 'demo.quickStart'
	| 'demo.exampleCode'
	| 'demo.showCode'
	| 'demo.hideCode'
	| 'demo.clickToViewCode'
	| 'demo.clickToCollapse'
	| 'demo.copyCode'
	| 'demo.codeCopied'
	| 'demo.languagesLoadedCount'
	| 'demo.localesSupported'
	| 'demo.dependencies'
	| 'demo.svelteVersion'
	| 'demo.madeWithLove'
	| 'demo.github'
	| 'demo.documentation'
	| 'demo.apiReference'
	| 'demo.overview'
	| 'demo.translation'
	| 'demo.validation'
	| 'demo.advanced'
	| 'demo.svelteReady'
	| 'demo.modernI18n'
	| 'demo.powerfulLibrary'
	| 'editor'
	| 'editor.title'
	| 'editor.subtitle'
	| 'editor.backToHome'
	| 'editor.loadFromFile'
	| 'editor.loadFromUrl'
	| 'editor.uploadFile'
	| 'editor.uploadDescription'
	| 'editor.addMoreSources'
	| 'editor.chooseFile'
	| 'editor.loadFromUrlTitle'
	| 'editor.loadFromUrlDescription'
	| 'editor.loading'
	| 'editor.load'
	| 'editor.expectedFormat'
	| 'editor.sourceLanguages'
	| 'editor.removeSource'
	| 'editor.addSource'
	| 'editor.sourcesLoaded'
	| 'editor.progress'
	| 'editor.translated'
	| 'editor.targetLanguage'
	| 'editor.enterLanguage'
	| 'editor.languageNotRecognized'
	| 'editor.aiAssistant'
	| 'editor.enableAI'
	| 'editor.openaiKey'
	| 'editor.translating'
	| 'editor.translateAll'
	| 'editor.export'
	| 'editor.download'
	| 'editor.translation'
	| 'editor.translationFields'
	| 'editor.searchKeys'
	| 'editor.translateWithAI'
	| 'editor.target'
	| 'editor.enterTranslation'
	| 'editor.fields'
	| 'editor.downloadSuccess'
	| 'editor.confirmTranslateAll'
	| 'editor.translateSuccess'
	| 'editor.translateFailed'
	| 'editor.errors'
	| 'editor.errors.invalidUrl'
	| 'editor.errors.maxSources'
	| 'editor.errors.loadFailed'
	| 'editor.errors.jsonOnly'
	| 'editor.errors.parseFailed'
	| 'editor.errors.aiConfig'
	| 'editor.errors.noSource'
	| 'editor.errors.noTargetLang';

export interface TranslationTypesParams {
	welcome: { name: string | number };
	'items.count': { count: string | number };
	'demo.interpolation': { name: string | number };
	'demo.currentLocale': { locale: string | number };
	'demo.validationErrors': { count: string | number };
	'demo.dateFormats': { locale: string | number };
	'demo.compact': { number: string | number };
	'editor.sourcesLoaded': { count: string | number };
	'editor.confirmTranslateAll': { count: string | number };
	'editor.errors.loadFailed': { error: string | number };
}

export type TranslationTypesFunction = {
	<K extends keyof TranslationTypesParams>(key: K, params: TranslationTypesParams[K]): string;
	(key: Exclude<TranslationTypesKeys, keyof TranslationTypesParams>): string;
};
