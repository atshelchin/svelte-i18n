<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { setupI18nClient, initI18nOnMount } from '$lib/index.js';
	import { i18n, initI18n } from '../app/i18n.js';
	import type { LayoutData } from './$types.js';

	let { children, data } = $props<{ children: import('svelte').Snippet; data: LayoutData }>();

	// Setup i18n synchronously to prevent flash during hydration
	const setupResult = setupI18nClient(i18n, data, {
		defaultLocale: i18n.locale
	});
	let isReady = $state(setupResult?.i18nReady || false);

	// Handle client-side initialization
	onMount(async () => {
		const result = await initI18nOnMount(i18n, data, {
			initFunction: async (inst) => {
				await initI18n(inst);
			},
			defaultLocale: i18n.locale
		});
		// Update ready state after initialization
		if (result?.i18nReady && !isReady) {
			isReady = true;
		}
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
