import { setupI18n } from '$lib/index.js';
import { registerBuiltInTranslations, loadBuiltInTranslations } from '$lib/infrastructure/loaders/built-in.js';
import { builtInTranslations } from '../translations/index.js';

// Register all built-in translations
registerBuiltInTranslations(builtInTranslations);

// Initialize i18n (will reuse existing instance if already created)
export const i18n = setupI18n({
	defaultLocale: 'en',
	fallbackLocale: 'en',
	interpolation: {
		prefix: '{',
		suffix: '}'
	},
	formats: {
		date: { year: 'numeric', month: 'long', day: 'numeric' },
		time: { hour: '2-digit', minute: '2-digit' },
		number: { minimumFractionDigits: 0, maximumFractionDigits: 2 },
		currency: { style: 'currency', currency: 'USD' }
	}
});

// Load built-in translations on initialization
if (typeof window !== 'undefined') {
	loadBuiltInTranslations(i18n).catch(console.error);
}
