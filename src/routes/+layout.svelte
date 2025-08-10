<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { i18n } from '../app/i18n.js';
	import type { LayoutData } from './$types';

	let { children, data } = $props<{ children: any; data: LayoutData }>();

	// Immediately set the locale from server to prevent flash
	// The translations are already loaded synchronously in i18n.ts
	if (typeof window !== 'undefined' && data.locale && i18n.locales.includes(data.locale)) {
		if (i18n.locale !== data.locale) {
			// Set the server-determined locale immediately
			// Use synchronous method to prevent delay
			// @ts-ignore - setLocaleSync is not in the interface but exists on the implementation
			i18n.setLocaleSync(data.locale);
		}
	}

	// On client side, load additional translations (auto-discovery)
	onMount(async () => {
		// Load auto-discovered translations
		// Pass the server locale to maintain it
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
