<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { i18n } from '../app/i18n.js';
	import type { LayoutData } from './$types.js';

	let { children, data } = $props<{ children: any; data: LayoutData }>();

	let isInitialized = false;
	console.log('layout.sevelte', { data });

	// Immediately sync locale on client side during hydration
	// This must happen synchronously to prevent flash
	if (typeof window !== 'undefined' && !isInitialized) {
		if (data.locale && i18n.locales.includes(data.locale)) {
			if (i18n.locale !== data.locale) {
				console.log(
					'[Client] Immediate sync - setting locale from:',
					i18n.locale,
					'to:',
					data.locale
				);
				// Set the server-determined locale immediately
				// Use synchronous method to prevent delay
				(i18n as any).setLocaleSync(data.locale);
			}
		}
		isInitialized = true;
	}

	// On client side, load additional translations (auto-discovery)
	onMount(async () => {
		// Load auto-discovered translations
		// Pass the server locale to maintain it
		console.log('layout', { locale: data.locale });
		await i18n.clientLoad({ initialLocale: data.locale });
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
