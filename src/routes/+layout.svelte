<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { i18n } from '../app/i18n.js';

	let { children } = $props();

	onMount(async () => {
		// Use the new clientLoad method for automatic language loading
		await i18n.clientLoad();
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
