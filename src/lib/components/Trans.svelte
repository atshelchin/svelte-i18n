<script lang="ts">
	import { getI18n } from '../store.svelte.js';
	import type { InterpolationParams } from '../types.js';
	import type { Snippet } from 'svelte';

	interface Props {
		key: string;
		params?: InterpolationParams;
		tag?: string;
		children?: Snippet<[{ key: string; content: string }]>;
	}

	let { key, params = {}, tag = 'span', children }: Props = $props();

	const i18n = getI18n();

	const translation = $derived(i18n.t(key, params));

	// Simple rendering without complex slot parsing
	const processedContent = $derived(() => {
		let processed = translation;

		// Handle simple placeholder replacement
		if (children) {
			const placeholders = translation.match(/{{\s*(\w+)\s*}}/g);
			if (placeholders) {
				placeholders.forEach((placeholder) => {
					const key = placeholder.replace(/[{}]/g, '').trim();
					processed = processed.replace(placeholder, `<span data-slot="${key}"></span>`);
				});
			}
		}

		return processed;
	});
</script>

{#if tag === 'fragment'}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html processedContent()}
{:else}
	<svelte:element this={tag}>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html processedContent()}
	</svelte:element>
{/if}
