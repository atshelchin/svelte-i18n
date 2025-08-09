<script lang="ts">
	import '../app.css';
	import { setupI18n, autoLoadLanguages } from '$lib/index.js';
	import { onMount } from 'svelte';

	let { children } = $props();

	// Initialize i18n
	const i18n = setupI18n({
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

	// Track if languages are loaded
	// let languagesLoaded = $state(false);

	onMount(async () => {
		// Automatically load all available languages
		await autoLoadLanguages(i18n, {
			translationsPath: '/translations',
			defaultLocale: i18n.locale, // Use the initial locale (from localStorage or browser)
			onLoaded: (locale) => console.log(`✓ Loaded ${locale}`),
			onError: (locale, error) => console.error(`✗ Failed to load ${locale}:`, error)
		});

		// languagesLoaded = true;

		// If the saved/detected locale wasn't loaded, fallback to default
		if (!i18n.locales.includes(i18n.locale)) {
			i18n.setLocale(i18n.locales[0] || 'en');
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
