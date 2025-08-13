<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { i18n, initI18n } from '../app/i18n.js';
	import type { LayoutData } from './$types.js';

	let { children, data } = $props<{ children: import('svelte').Snippet; data: LayoutData }>();

	// On client side, initialize i18n using unified API
	onMount(async () => {
		// Initialize app i18n instance
		await initI18n(i18n);

		// Get saved locale from localStorage
		const savedLocale = localStorage.getItem('i18n-locale');

		// Determine target locale
		let targetLocale = data.locale;

		if (savedLocale && i18n.locales.includes(savedLocale)) {
			// Use saved locale if available
			targetLocale = savedLocale;
		} else if (!savedLocale) {
			// No saved locale - the default has already been set during initialization
			// Only use browser detection if explicitly enabled
			const useBrowserDetection = false; // Set to true to enable browser language detection
			if (useBrowserDetection) {
				const browserLang = i18n.detectBrowserLanguage();
				if (browserLang && i18n.locales.includes(browserLang)) {
					targetLocale = browserLang;
				}
			} else {
				// Use the configured default locale (already set by initI18n)
				targetLocale = i18n.locale; // This should be 'zh' from config
			}
		}

		// Set the locale if it's different from current
		if (i18n.locale !== targetLocale && i18n.locales.includes(targetLocale)) {
			await i18n.setLocale(targetLocale);
		}

		// Log for debugging
		console.log('Locale initialization:', {
			savedLocale,
			configuredDefault: 'zh',
			currentLocale: i18n.locale,
			targetLocale
		});
	});
</script>

<div class="app">
	{@render children()}
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
