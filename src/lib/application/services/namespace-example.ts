import { setupI18n } from '../stores/store.svelte.js';
import type { TranslationSchema } from '../../domain/models/types.js';

// Example: Library A with its own i18n instance
export const libraryATranslations: TranslationSchema = {
	button: {
		submit: 'Submit Form',
		cancel: 'Cancel'
	},
	message: 'This is from Library A'
};

export const libraryAI18n = setupI18n({
	defaultLocale: 'en',
	namespace: 'lib-a'
});

// Example: Library B with its own i18n instance
export const libraryBTranslations: TranslationSchema = {
	button: {
		submit: 'Send Data', // Different translation for same key
		cancel: 'Abort'
	},
	message: 'This is from Library B'
};

export const libraryBI18n = setupI18n({
	defaultLocale: 'en',
	namespace: 'lib-b'
});

// Example: Main app with its own i18n instance
export const appTranslations: TranslationSchema = {
	button: {
		submit: 'Save Changes', // App's own translation
		cancel: 'Discard'
	},
	message: 'This is from the main app'
};

export const appI18n = setupI18n({
	defaultLocale: 'en',
	namespace: 'app'
});

// Usage example:
// await libraryAI18n.loadLanguage('en', libraryATranslations);
// await libraryBI18n.loadLanguage('en', libraryBTranslations);
// await appI18n.loadLanguage('en', appTranslations);
//
// libraryAI18n.t('button.submit') // Returns: "Submit Form"
// libraryBI18n.t('button.submit') // Returns: "Send Data"
// appI18n.t('button.submit')      // Returns: "Save Changes"
//
// No conflicts! Each namespace has its own translation space.
