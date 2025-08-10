<script lang="ts">
	import '../app.css';
	import { autoLoadLanguages } from '$lib/index.js';
	import { onMount } from 'svelte';
	import { i18n } from '../app/i18n.js';

	let { children } = $props();

	// Track if languages are already loaded
	let languagesLoaded = $state(i18n.locales.length > 0);

	onMount(async () => {
		// Only load languages if they haven't been loaded yet
		if (!languagesLoaded) {
			// Automatically load all available languages
			// Note: autoLoadLanguages will automatically detect the base path
			await autoLoadLanguages(i18n, {
				// translationsPath is automatically determined from base path
				defaultLocale: i18n.locale, // Use the initial locale (from localStorage or browser)
				onLoaded: (locale) => console.log(`✓ Loaded ${locale}`),
				onError: (locale, error) => console.error(`✗ Failed to load ${locale}:`, error)
			});

			languagesLoaded = true;

			// If the saved/detected locale wasn't loaded, fallback to default
			if (!i18n.locales.includes(i18n.locale)) {
				i18n.setLocale(i18n.locales[0] || 'en');
			}
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
