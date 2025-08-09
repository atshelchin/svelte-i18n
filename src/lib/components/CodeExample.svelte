<script lang="ts">
	import { slide } from 'svelte/transition';
	import { getI18n } from '../store.svelte.js';

	interface Props {
		title: string;
		code: string;
		language?: string;
		class?: string;
	}

	let { title, code, language = 'typescript', class: className = '' }: Props = $props();

	const i18n = getI18n();
	let isExpanded = $state(false);
	let isCopied = $state(false);

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}

	async function copyCode() {
		await navigator.clipboard.writeText(code);
		isCopied = true;
		setTimeout(() => (isCopied = false), 2000);
	}

	// Format code with proper indentation
	const formattedCode = $derived(() => {
		return code
			.trim()
			.split('\n')
			.map((line) => line.trimEnd())
			.join('\n');
	});
</script>

<div class="code-example {className}">
	<button class="code-header" onclick={toggleExpanded}>
		<div class="header-content">
			<svg
				class="expand-icon"
				class:expanded={isExpanded}
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
			>
				<path
					d="M4 6L8 10L12 6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<span class="code-title">{title}</span>
			<span class="code-badge">{language}</span>
		</div>
		<div class="header-hint">
			{isExpanded ? i18n.t('demo.clickToCollapse') : i18n.t('demo.clickToViewCode')}
		</div>
	</button>

	{#if isExpanded}
		<div class="code-container" transition:slide={{ duration: 300 }}>
			<div class="code-toolbar">
				<button class="copy-button" onclick={copyCode} title="Copy code">
					{#if isCopied}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path
								d="M13.5 4L6 11.5L2.5 8"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<span>{i18n.t('demo.codeCopied')}</span>
					{:else}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<rect
								x="5"
								y="5"
								width="9"
								height="9"
								rx="1"
								stroke="currentColor"
								stroke-width="1.5"
							/>
							<path
								d="M3 11V3C3 2.44772 3.44772 2 4 2H12"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
						<span>{i18n.t('demo.copyCode')}</span>
					{/if}
				</button>
			</div>
			<pre class="code-content"><code class="language-{language}">{formattedCode()}</code></pre>
		</div>
	{/if}
</div>

<style>
	.code-example {
		margin: 1rem 0;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(10px);
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.code-example:hover {
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.05);
	}

	.code-header {
		width: 100%;
		padding: 0.875rem 1.25rem;
		background: transparent;
		border: none;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.code-header:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.expand-icon {
		color: rgba(255, 255, 255, 0.6);
		transition: transform 0.3s ease;
	}

	.expand-icon.expanded {
		transform: rotate(180deg);
	}

	.code-title {
		font-size: 0.9rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.95);
	}

	.code-badge {
		padding: 0.25rem 0.625rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 12px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.header-hint {
		font-size: 0.813rem;
		color: rgba(255, 255, 255, 0.5);
		font-style: italic;
	}

	.code-container {
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.2);
	}

	.code-toolbar {
		display: flex;
		justify-content: flex-end;
		padding: 0.75rem 1.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.copy-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.875rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.813rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.copy-button:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.2);
		color: white;
	}

	.code-content {
		padding: 1.25rem;
		margin: 0;
		overflow-x: auto;
		font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.code-content code {
		color: #e6e6e6;
		white-space: pre;
		display: block;
	}

	/* Simple syntax highlighting */
	:global(.language-typescript) {
		color: #d4d4d4;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.code-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.header-hint {
			align-self: flex-start;
			margin-left: 1.75rem;
		}
	}
</style>
