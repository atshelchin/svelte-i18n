<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { i18n, initI18n } from '../app/i18n.js';
	import type { LayoutData } from './$types.js';

	let { children, data } = $props<{ children: import('svelte').Snippet; data: LayoutData }>();

	// Initialize with the locale from server (which includes cookie value)
	let initialLocale = data.locale || 'zh';

	// For auto-discovered languages, load SSR translations immediately
	if (data.isAutoDiscovered && data.ssrTranslations && i18n.loadLanguageSync && i18n.setLocaleSync) {
		// Load the SSR translations synchronously to prevent flash
		console.log(`[+layout.svelte] Loading SSR translations for ${initialLocale}`);
		i18n.loadLanguageSync(initialLocale, data.ssrTranslations);
		// Set locale immediately after loading translations
		i18n.setLocaleSync(initialLocale);
	} else if (i18n.locale !== initialLocale && i18n.locales.includes(initialLocale) && i18n.setLocaleSync) {
		// Set initial locale immediately to prevent flash for built-in languages
		// This will be synchronous if translations are already loaded
		i18n.setLocaleSync(initialLocale);
	}

	// On client side, initialize i18n using unified API
	onMount(async () => {
		// Initialize app i18n instance (this loads auto-discovered translations)
		await initI18n(i18n);

		// Get saved locale from localStorage (takes precedence over cookie)
		const savedLocale = localStorage.getItem('i18n-locale');

		// Determine final target locale
		let targetLocale = initialLocale;  // Use initialLocale from SSR

		if (savedLocale && i18n.locales.includes(savedLocale)) {
			// localStorage takes precedence
			targetLocale = savedLocale;
		}

		// Set the locale - this should work now that auto-discovered translations are loaded
		if (i18n.locale !== targetLocale && i18n.locales.includes(targetLocale)) {
			await i18n.setLocale(targetLocale);
		}

		// Log for debugging
		console.log('Locale initialization:', {
			dataLocale: data.locale,
			savedLocale,
			configuredDefault: 'zh',
			currentLocale: i18n.locale,
			targetLocale,
			availableLocales: i18n.locales
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
