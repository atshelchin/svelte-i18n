<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { i18n } from '../app/i18n.js';
	import type { LayoutData } from './$types.js';

	let { children, data } = $props<{ children: import('svelte').Snippet; data: LayoutData }>();

	// On client side, initialize i18n and load translations
	onMount(async () => {
		// Get saved locale from localStorage or use browser detection
		const savedLocale = localStorage.getItem('i18n-locale');
		let initialLocale = data.locale;

		if (savedLocale && i18n.locales.includes(savedLocale)) {
			initialLocale = savedLocale;
		} else {
			// Try browser language detection
			const browserLang = i18n.detectBrowserLanguage();
			if (browserLang && i18n.locales.includes(browserLang)) {
				initialLocale = browserLang;
			}
		}

		// Load auto-discovered translations and set initial locale
		await i18n.clientLoad({ initialLocale });

		// Set the locale if it's different
		if (i18n.locale !== initialLocale) {
			i18n.setLocale(initialLocale);
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
