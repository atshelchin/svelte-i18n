<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { i18n, initI18n } from '../app/i18n.js';
	import type { LayoutData } from './$types.js';

	let { children, data } = $props<{ children: import('svelte').Snippet; data: LayoutData }>();

	// Initialize with the locale from server (which includes cookie value)
	let initialLocale = data.locale || 'zh';

	// Set initial locale immediately to prevent flash
	if (i18n.locale !== initialLocale) {
		// This will be synchronous if translations are already loaded
		i18n.setLocale(initialLocale).catch(() => {
			// Fallback to default if locale not available
			i18n.setLocale('zh');
		});
	}

	// On client side, initialize i18n using unified API
	onMount(async () => {
		// Initialize app i18n instance
		await initI18n(i18n);

		// Get saved locale from localStorage (takes precedence over cookie)
		const savedLocale = localStorage.getItem('i18n-locale');

		// Determine final target locale
		let targetLocale = data.locale || 'zh';

		if (savedLocale && i18n.locales.includes(savedLocale)) {
			// localStorage takes precedence
			targetLocale = savedLocale;
		}

		// Set the locale if it's different from current
		if (i18n.locale !== targetLocale && i18n.locales.includes(targetLocale)) {
			await i18n.setLocale(targetLocale);
		}

		// Log for debugging
		console.log('Locale initialization:', {
			dataLocale: data.locale,
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
