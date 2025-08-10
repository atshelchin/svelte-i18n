<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { i18n } from '../app/i18n.js';
	import type { LayoutData } from './$types.js';

	let { children, data } = $props<{ children: import('svelte').Snippet; data: LayoutData }>();

	// On client side, initialize i18n and load translations
	onMount(async () => {
		// Get saved locale from localStorage
		const savedLocale = localStorage.getItem('i18n-locale');

		// First load all available translations (including auto-discovered ones)
		// Don't pass initialLocale yet, let it load with default locale first
		await i18n.clientLoad();

		// Now that all languages are loaded, we can check if saved locale is available
		let targetLocale = data.locale;

		if (savedLocale && i18n.locales.includes(savedLocale)) {
			// Now savedLocale check includes auto-discovered languages
			targetLocale = savedLocale;
		} else if (!savedLocale) {
			// No saved locale, try browser language detection
			const browserLang = i18n.detectBrowserLanguage();
			if (browserLang && i18n.locales.includes(browserLang)) {
				targetLocale = browserLang;
			}
		}

		// Set the locale if it's different from current
		if (i18n.locale !== targetLocale && i18n.locales.includes(targetLocale)) {
			await i18n.setLocale(targetLocale);
		}
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
