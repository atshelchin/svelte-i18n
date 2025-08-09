<script lang="ts">
	import { getI18n } from '../store.svelte.js';

	interface Props {
		class?: string;
		showDetails?: boolean;
	}

	let { class: className = '', showDetails = true }: Props = $props();

	const i18n = getI18n();
	const errors = $derived(i18n.errors);
	const hasErrors = $derived(Object.keys(errors).length > 0);
	const errorCount = $derived(Object.values(errors).reduce((sum, errs) => sum + errs.length, 0));
</script>

{#if hasErrors}
	<div class="validation-status {className}">
		<div class="validation-header">
			<span class="validation-icon">⚠️</span>
			<span class="validation-title">Translation Validation Issues ({errorCount})</span>
		</div>

		{#if showDetails}
			<div class="validation-details">
				{#each Object.entries(errors) as [locale, localeErrors] (locale)}
					<details class="locale-errors">
						<summary class="locale-summary">
							{locale} ({localeErrors.length} issues)
						</summary>
						<ul class="error-list">
							{#each localeErrors as error (error)}
								<li class="error-item">{error}</li>
							{/each}
						</ul>
					</details>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.validation-status {
		background: #fff3cd;
		border: 1px solid #ffc107;
		border-radius: 4px;
		padding: 1rem;
		margin: 1rem 0;
	}

	.validation-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: bold;
		color: #856404;
	}

	.validation-icon {
		font-size: 1.2rem;
	}

	.validation-details {
		margin-top: 1rem;
	}

	.locale-errors {
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		margin: 0.5rem 0;
		padding: 0.5rem;
	}

	.locale-summary {
		cursor: pointer;
		font-weight: 500;
		color: #333;
		padding: 0.25rem;
	}

	.locale-summary:hover {
		color: #ff3e00;
	}

	.error-list {
		margin: 0.5rem 0 0 1.5rem;
		padding: 0;
		list-style-type: none;
	}

	.error-item {
		color: #666;
		padding: 0.25rem 0;
		position: relative;
		padding-left: 1rem;
	}

	.error-item::before {
		content: '•';
		position: absolute;
		left: 0;
		color: #d32f2f;
	}
</style>
