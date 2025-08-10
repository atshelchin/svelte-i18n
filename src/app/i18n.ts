import { setupI18n } from '$lib/index.js';

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
