<script lang="ts">
	import { onMount } from 'svelte';
	import { i18nClientInit, i18nIsReady } from '@shelchin/svelte-i18n';
	import { i18n } from '../translations/i18n.js';

	let { data, children } = $props();

	// Check if ready (prevents flash)
	let isReady = $state(i18nIsReady(i18n, data));

	onMount(async () => {
		// Initialize with custom options
		await i18nClientInit(i18n, data, {
			storageKey: 'my-app-locale',
			autoLoad: true
		});

		isReady = true;
	});
</script>

{#if isReady}
	{@render children()}
{:else}
	<div>Loading translations...</div>
{/if}
