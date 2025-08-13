<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { i18n, initI18n } from '../app/i18n.js';
	import type { LayoutData } from './$types.js';

	let { children, data } = $props<{ children: import('svelte').Snippet; data: LayoutData }>();

	// Track if we're ready to render (to prevent flash in CSR)
	let isReady = $state(false);

	// Initialize with the locale from server (which includes cookie value)
	let initialLocale = data.locale || 'zh';

	// Check if we're in SSR or CSR mode
	const isSSR =
		data.ssrTranslations !== undefined ||
		data.translationsPreloaded ||
		i18n.locales.includes(initialLocale);

	// For SSR with auto-discovered languages, load SSR translations immediately
	if (
		data.isAutoDiscovered &&
		data.ssrTranslations &&
		i18n.loadLanguageSync &&
		i18n.setLocaleSync
	) {
		// Load the SSR translations synchronously to prevent flash
		console.log(`[+layout.svelte] Loading SSR translations for ${initialLocale}`);
		i18n.loadLanguageSync(initialLocale, data.ssrTranslations);
		// Set locale immediately after loading translations
		i18n.setLocaleSync(initialLocale);
		isReady = true; // SSR is ready
	} else if (data.translationsPreloaded) {
		// Translations were preloaded in +layout.ts
		console.log('[+layout.svelte] Using preloaded translations');
		isReady = true;
	} else if (
		i18n.locale !== initialLocale &&
		i18n.locales.includes(initialLocale) &&
		i18n.setLocaleSync
	) {
		// Set initial locale immediately to prevent flash for built-in languages
		// This will be synchronous if translations are already loaded
		i18n.setLocaleSync(initialLocale);
		isReady = true; // Built-in language is ready
	} else if (typeof window !== 'undefined' && !isSSR) {
		// CSR mode - translations should have been preloaded in +layout.ts
		// This is a fallback in case preloading didn't work
		console.log('[+layout.svelte] CSR mode fallback - loading translations');

		// Check if current locale matches target
		if (i18n.locale === initialLocale && i18n.locales.includes(initialLocale)) {
			// Already loaded and set
			isReady = true;
		} else {
			// Load translations immediately in CSR mode
			(async () => {
				// Get saved locale from localStorage
				const savedLocale = localStorage.getItem('i18n-locale');
				const targetLocale = savedLocale || initialLocale;

				// Initialize i18n and load all translations
				await initI18n(i18n);

				// Set the target locale
				if (i18n.locales.includes(targetLocale)) {
					await i18n.setLocale(targetLocale);
				}

				// Now ready to render
				isReady = true;
			})();
		}
	} else {
		// SSR or already loaded
		isReady = true;
	}

	// On client side, handle locale changes
	onMount(async () => {
		// If we already initialized in CSR mode, skip
		if (!isSSR && isReady) {
			console.log('[+layout.svelte] Already initialized in CSR mode');
			return;
		}

		// Initialize app i18n instance (this loads auto-discovered translations)
		await initI18n(i18n);

		// Get saved locale from localStorage (takes precedence over cookie)
		const savedLocale = localStorage.getItem('i18n-locale');

		// Determine final target locale
		let targetLocale = initialLocale; // Use initialLocale from SSR

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

{#if isReady}
	<div class="app">
		{@render children()}
	</div>
{:else}
	<!-- Loading state to prevent flash -->
	<div class="app loading">
		<div class="loading-container">
			<div class="loading-spinner"></div>
		</div>
	</div>
{/if}

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #3498db;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
