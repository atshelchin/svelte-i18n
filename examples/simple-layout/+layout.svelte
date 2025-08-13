<script lang="ts">
	import { handleClient } from '@shelchin/svelte-i18n';
	import { i18n } from '../translations/i18n.js';

	let { data, children } = $props();

	// One line client setup!
	handleClient(i18n, data);
</script>

{@render children()}
