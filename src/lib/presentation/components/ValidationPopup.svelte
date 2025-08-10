<script lang="ts">
	import { DEV } from '../../utils/env.js';
	import { getI18n } from '../../application/stores/store.svelte.js';
	import type { I18nInstance } from '../../domain/models/types.js';
	import { getValidationPopupI18n } from './validation-popup-i18n.js';
	import { onMount } from 'svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	const i18n = getI18n();
	const errors = $derived(i18n.errors);
	const hasErrors = $derived(Object.keys(errors).length > 0);
	const errorCount = $derived(Object.values(errors).reduce((sum, errs) => sum + errs.length, 0));

	// Namespaced i18n for this component
	let popupI18n = $state<I18nInstance | null>(null);
	let popupLocale = $state('en');

	let isOpen = $state(false);
	let hasBeenDismissed = $state(false);
	let selectedLocale = $state<string>('');
	let currentPage = $state(1);
	let showExportMenu = $state(false);
	const errorsPerPage = 15;

	// Initialize selected locale to first error locale
	$effect(() => {
		if (hasErrors && !selectedLocale && Object.keys(errors).length > 0) {
			selectedLocale = Object.keys(errors)[0];
		}
	});

	$effect(() => {
		if (hasErrors && !hasBeenDismissed) {
			isOpen = true;
		}
	});

	const selectedErrors = $derived(selectedLocale ? errors[selectedLocale] || [] : []);
	const totalPages = $derived(Math.ceil(selectedErrors.length / errorsPerPage));
	const pagedErrors = $derived(() => {
		const start = (currentPage - 1) * errorsPerPage;
		const end = start + errorsPerPage;
		return selectedErrors.slice(start, end);
	});

	function dismiss() {
		isOpen = false;
		hasBeenDismissed = true;
	}

	function selectLanguage(e: Event) {
		const target = e.target as HTMLSelectElement;
		selectedLocale = target.value;
		currentPage = 1;
	}

	function nextPage() {
		if (currentPage < totalPages) {
			currentPage++;
		}
	}

	function prevPage() {
		if (currentPage > 1) {
			currentPage--;
		}
	}

	// Parse error messages to extract missing keys
	function extractMissingKeys(errorMessages: string[]): Record<string, unknown> {
		const missingKeys: Record<string, unknown> = {};

		errorMessages.forEach((error) => {
			// Match patterns like: Missing translation: demo.xxx
			const match = error.match(/Missing translation: ([\w.]+)/);
			if (match && match[1]) {
				const key = match[1];
				// Create nested structure from dot notation
				const parts = key.split('.');
				let current = missingKeys;

				for (let i = 0; i < parts.length - 1; i++) {
					if (!current[parts[i]]) {
						current[parts[i]] = {};
					}
					current = current[parts[i]] as Record<string, unknown>;
				}

				// Set the final value
				const langName = i18n.meta[selectedLocale]?.name || selectedLocale;
				current[parts[parts.length - 1]] = popupI18n
					? popupI18n.t('validationPopup.report.todoTranslate', { language: langName })
					: `[TODO: Translate to ${langName}]`;
			}
		});

		return missingKeys;
	}

	function exportAsJSON() {
		if (!selectedLocale || !errors[selectedLocale]) return;

		const missingKeys = extractMissingKeys(errors[selectedLocale]);
		const json = JSON.stringify(missingKeys, null, 2);

		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `missing-translations-${selectedLocale}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		showExportMenu = false;
	}

	function exportAsText() {
		if (!selectedLocale || !errors[selectedLocale]) return;

		const langName = i18n.meta[selectedLocale]?.name || selectedLocale;
		let text = popupI18n
			? `${popupI18n.t('validationPopup.report.title')}\n`
			: `Missing Translations Report\n`;
		text += popupI18n
			? `${popupI18n.t('validationPopup.report.language', { name: langName, code: selectedLocale })}\n`
			: `Language: ${langName} (${selectedLocale})\n`;
		text += `${'='.repeat(60)}\n\n`;
		text += popupI18n
			? `${popupI18n.t('validationPopup.report.totalMissing', { count: errors[selectedLocale].length })}\n\n`
			: `Total missing keys: ${errors[selectedLocale].length}\n\n`;
		text += popupI18n ? `${popupI18n.t('validationPopup.report.details')}\n` : `Details:\n`;
		text += `${'─'.repeat(60)}\n\n`;

		errors[selectedLocale].forEach((error, index) => {
			text += `${index + 1}. ${error}\n`;
		});

		text += `\n${'='.repeat(60)}\n`;
		const dateStr = new Date().toLocaleString();
		text += popupI18n
			? `${popupI18n.t('validationPopup.report.generatedAt', { date: dateStr })}\n`
			: `Generated at: ${dateStr}\n`;

		const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `missing-translations-${selectedLocale}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		showExportMenu = false;
	}

	function copyMissingKeysJSON() {
		if (!selectedLocale || !errors[selectedLocale]) return;

		const missingKeys = extractMissingKeys(errors[selectedLocale]);
		const json = JSON.stringify(missingKeys, null, 2);

		navigator.clipboard.writeText(json).then(() => {
			// Visual feedback
			const btn = document.querySelector('.export-option:last-child') as HTMLElement;
			if (btn) {
				const originalText = btn.innerHTML;
				const copiedText = popupI18n
					? popupI18n.t('validationPopup.exportMenu.copied')
					: 'Copied to clipboard!';
				btn.innerHTML = `<span class="option-icon">✅</span>${copiedText}`;
				setTimeout(() => {
					btn.innerHTML = originalText;
				}, 2000);
			}
		});

		showExportMenu = false;
	}

	onMount(async () => {
		// Initialize the namespaced i18n (auto-discovery is built-in)
		popupI18n = await getValidationPopupI18n();

		// Sync with main i18n locale
		if (popupI18n) {
			// The i18n instance will auto-discover translations when setting locale
			await popupI18n.setLocale(i18n.locale);
			popupLocale = i18n.locale;

			// Debug: Check if translations are working
			if (DEV) {
				console.log('ValidationPopup i18n test:', popupI18n.t('validationPopup.header.title'));
			}
		}

		if (hasErrors) {
			setTimeout(() => {
				isOpen = true;
			}, 500);
		}
	});

	// Watch for main i18n locale changes
	$effect(() => {
		if (popupI18n && i18n.locale !== popupLocale) {
			// Auto-discovery happens automatically in setLocale
			void popupI18n.setLocale(i18n.locale);
			popupLocale = i18n.locale;
		}
	});
</script>

{#if hasErrors && isOpen}
	<div class="validation-popup {className}">
		<div
			class="popup-backdrop"
			onclick={dismiss}
			onkeydown={(e) => e.key === 'Escape' && dismiss()}
			role="button"
			tabindex="-1"
			aria-label="Close validation popup"
		></div>

		<div class="popup-container">
			<!-- Header -->
			<div class="popup-header">
				<div class="header-content">
					<span class="header-icon">🔍</span>
					<h2 class="header-title">
						{popupI18n
							? popupI18n.t('validationPopup.header.title')
							: 'Translation Validation Report'}
					</h2>
					<div class="header-stats">
						<span class="stat-badge error-count">
							{popupI18n
								? popupI18n.t('validationPopup.header.issues', { count: errorCount })
								: `${errorCount} issues`}
						</span>
						<span class="stat-badge lang-count">
							{popupI18n
								? popupI18n.t('validationPopup.header.languages', {
										count: Object.keys(errors).length
									})
								: `${Object.keys(errors).length} languages`}
						</span>
					</div>
				</div>
				<button
					class="close-btn"
					onclick={dismiss}
					title={popupI18n ? popupI18n.t('validationPopup.header.close') : 'Close'}
					aria-label={popupI18n ? popupI18n.t('validationPopup.header.close') : 'Close'}
				>
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path
							d="M15 5L5 15M5 5L15 15"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				</button>
			</div>

			<!-- Controls Bar -->
			<div class="controls-bar">
				<div class="language-selector">
					<label for="language-select">
						{popupI18n ? popupI18n.t('validationPopup.controls.languageLabel') : 'Language:'}
					</label>
					<select
						id="language-select"
						class="language-select"
						value={selectedLocale}
						onchange={selectLanguage}
					>
						{#each Object.entries(errors) as [locale, localeErrors] (locale)}
							<option value={locale}>
								{popupI18n
									? popupI18n.t('validationPopup.controls.languageOption', {
											flag: i18n.meta[locale]?.flag || '🌐',
											name: i18n.meta[locale]?.name || locale,
											count: localeErrors.length
										})
									: `${i18n.meta[locale]?.flag || '🌐'} ${i18n.meta[locale]?.name || locale} (${localeErrors.length} errors)`}
							</option>
						{/each}
					</select>
				</div>

				<div class="export-controls">
					<button
						class="export-btn"
						onclick={() => (showExportMenu = !showExportMenu)}
						title="Export options"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path
								d="M8 2V12M8 12L4 8M8 12L12 8M2 14H14"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						{popupI18n ? popupI18n.t('validationPopup.controls.export') : 'Export'}
					</button>

					{#if showExportMenu}
						<div class="export-menu">
							<button class="export-option" onclick={exportAsJSON}>
								<span class="option-icon">📄</span>
								{popupI18n
									? popupI18n.t('validationPopup.exportMenu.downloadJSON')
									: 'Download JSON'}
							</button>
							<button class="export-option" onclick={exportAsText}>
								<span class="option-icon">📝</span>
								{popupI18n
									? popupI18n.t('validationPopup.exportMenu.downloadText')
									: 'Download Text Report'}
							</button>
							<button class="export-option" onclick={copyMissingKeysJSON}>
								<span class="option-icon">📋</span>
								{popupI18n
									? popupI18n.t('validationPopup.exportMenu.copyJSON')
									: 'Copy JSON to Clipboard'}
							</button>
						</div>
					{/if}
				</div>
			</div>

			<!-- Content Area -->
			{#if selectedLocale && selectedErrors.length > 0}
				<div class="content-area">
					<div class="content-header">
						{#if totalPages > 1}
							<div class="pagination-compact">
								{popupI18n
									? popupI18n.t('validationPopup.pagination.page', {
											current: currentPage,
											total: totalPages
										})
									: `Page ${currentPage} / ${totalPages}`}
							</div>
						{/if}
					</div>

					<div class="error-list">
						{#each pagedErrors() as error, index (error)}
							<div class="error-item">
								<span class="error-number">
									{(currentPage - 1) * errorsPerPage + index + 1}
								</span>
								<div class="error-content">
									<div class="error-message">{error}</div>
									{#if error.includes('Missing translation')}
										{@const key = error.match(/Missing translation: ([\w.]+)/)?.[1]}
										{#if key}
											<div class="error-key">
												<code>{key}</code>
											</div>
										{/if}
									{/if}
								</div>
							</div>
						{/each}
					</div>

					{#if totalPages > 1}
						<div class="pagination">
							<button class="page-btn prev" onclick={prevPage} disabled={currentPage === 1}>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path
										d="M10 12L6 8L10 4"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								{popupI18n ? popupI18n.t('validationPopup.pagination.previous') : 'Previous'}
							</button>

							<div class="page-numbers">
								<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
								{#each { length: totalPages } as _, i (i)}
									{#if i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 2 && i + 1 <= currentPage + 2)}
										<button
											class="page-number"
											class:active={currentPage === i + 1}
											onclick={() => (currentPage = i + 1)}
										>
											{i + 1}
										</button>
									{:else if i + 1 === currentPage - 3 || i + 1 === currentPage + 3}
										<span class="page-dots">...</span>
									{/if}
								{/each}
							</div>

							<button
								class="page-btn next"
								onclick={nextPage}
								disabled={currentPage === totalPages}
							>
								{popupI18n ? popupI18n.t('validationPopup.pagination.next') : 'Next'}
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path
										d="M6 12L10 8L6 4"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</button>
						</div>
					{/if}
				</div>
			{:else if !selectedLocale}
				<div class="empty-state">
					<span class="empty-icon">📊</span>
					<p>
						{popupI18n
							? popupI18n.t('validationPopup.emptyState.selectLanguage')
							: 'Please select a language from the dropdown above'}
					</p>
				</div>
			{:else}
				<div class="empty-state">
					<span class="empty-icon">✅</span>
					<p>
						{popupI18n
							? popupI18n.t('validationPopup.emptyState.noErrors')
							: 'No validation errors for this language'}
					</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

{#if hasErrors && !isOpen && !hasBeenDismissed}
	<button
		class="floating-indicator"
		onclick={() => {
			isOpen = true;
			hasBeenDismissed = false;
		}}
	>
		<span class="indicator-icon">⚠️</span>
		<span class="indicator-count">{errorCount}</span>
		<span class="indicator-text">
			{popupI18n
				? popupI18n.t('validationPopup.floatingIndicator.translationIssues')
				: 'Translation Issues'}
		</span>
	</button>
{/if}

<style>
	.validation-popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 10000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.popup-backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		cursor: pointer;
	}

	.popup-container {
		position: relative;
		background: white;
		border-radius: 16px;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		width: 100%;
		max-width: 720px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Header */
	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.header-icon {
		font-size: 1.5rem;
	}

	.header-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
		flex: 1;
	}

	.header-stats {
		display: flex;
		gap: 0.5rem;
	}

	.stat-badge {
		background: rgba(255, 255, 255, 0.2);
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.813rem;
		font-weight: 500;
	}

	.close-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: white;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	/* Controls Bar */
	.controls-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		background: #f8f9fa;
		border-bottom: 1px solid #e9ecef;
		gap: 1rem;
	}

	.language-selector {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.language-selector label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #495057;
	}

	.language-select {
		flex: 1;
		max-width: 300px;
		padding: 0.5rem 0.75rem;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		background: white;
		font-size: 0.875rem;
		color: #212529;
		cursor: pointer;
		transition: all 0.2s;
	}

	.language-select:hover {
		border-color: #667eea;
	}

	.language-select:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.export-controls {
		position: relative;
	}

	.export-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: white;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		color: #495057;
		cursor: pointer;
		transition: all 0.2s;
	}

	.export-btn:hover {
		background: #f8f9fa;
		border-color: #667eea;
		color: #667eea;
	}

	.export-menu {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		background: white;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		padding: 0.5rem;
		min-width: 200px;
		z-index: 10;
	}

	.export-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.625rem 0.75rem;
		background: none;
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #212529;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}

	.export-option:hover {
		background: #f8f9fa;
		color: #667eea;
	}

	.option-icon {
		font-size: 1rem;
	}

	/* Content Area */
	.content-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.content-header {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 0.75rem 1.5rem;
		background: white;
		border-bottom: 1px solid #e9ecef;
		min-height: 20px;
	}

	.pagination-compact {
		font-size: 0.875rem;
		color: #6c757d;
		font-weight: 500;
	}

	/* Error List */
	.error-list {
		height: 400px;
		overflow-y: auto;
		padding: 1.5rem;
	}

	.error-item {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 8px;
		margin-bottom: 0.75rem;
		transition: all 0.2s;
	}

	.error-item:hover {
		background: white;
		border-color: #667eea;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.error-number {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		height: 32px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 50%;
		font-size: 0.813rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	.error-content {
		flex: 1;
	}

	.error-message {
		color: #212529;
		font-size: 0.875rem;
		line-height: 1.5;
		margin-bottom: 0.5rem;
	}

	.error-key {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.error-key code {
		background: white;
		padding: 0.25rem 0.5rem;
		border: 1px solid #dee2e6;
		border-radius: 4px;
		font-family: 'SF Mono', Monaco, monospace;
		font-size: 0.75rem;
		color: #e83e8c;
	}

	/* Pagination */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		padding: 1.25rem;
		background: #f8f9fa;
		border-top: 1px solid #e9ecef;
	}

	.page-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		background: white;
		border: 1px solid #dee2e6;
		border-radius: 6px;
		font-size: 0.813rem;
		font-weight: 500;
		color: #495057;
		cursor: pointer;
		transition: all 0.2s;
	}

	.page-btn:hover:not(:disabled) {
		background: #f8f9fa;
		border-color: #667eea;
		color: #667eea;
	}

	.page-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.page-numbers {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}

	.page-number {
		min-width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: white;
		border: 1px solid #dee2e6;
		border-radius: 6px;
		font-size: 0.813rem;
		font-weight: 500;
		color: #495057;
		cursor: pointer;
		transition: all 0.2s;
	}

	.page-number:hover {
		background: #f8f9fa;
		border-color: #667eea;
		color: #667eea;
	}

	.page-number.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-color: transparent;
	}

	.page-dots {
		padding: 0 0.5rem;
		color: #6c757d;
	}

	/* Empty State */
	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		color: #6c757d;
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.empty-state p {
		margin: 0;
		font-size: 1rem;
	}

	/* Floating Indicator */
	.floating-indicator {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: linear-gradient(135deg, #f76707 0%, #e8590c 100%);
		color: white;
		border: none;
		border-radius: 24px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		box-shadow:
			0 10px 15px -3px rgba(251, 146, 60, 0.3),
			0 4px 6px -2px rgba(251, 146, 60, 0.2);
		transition: all 0.2s;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.02);
		}
	}

	.floating-indicator:hover {
		transform: translateY(-2px);
		box-shadow:
			0 20px 25px -5px rgba(251, 146, 60, 0.3),
			0 10px 10px -5px rgba(251, 146, 60, 0.2);
	}

	.indicator-icon {
		font-size: 1.125rem;
	}

	.indicator-count {
		background: rgba(255, 255, 255, 0.25);
		padding: 0.125rem 0.5rem;
		border-radius: 10px;
		font-weight: 600;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.popup-container {
			max-width: 95%;
			max-height: 90vh;
		}

		.controls-bar {
			flex-direction: column;
			align-items: stretch;
		}

		.language-selector {
			flex-direction: column;
			align-items: stretch;
		}

		.language-select {
			max-width: none;
		}

		.export-controls {
			align-self: flex-end;
		}

		.header-stats {
			display: none;
		}

		.pagination {
			flex-wrap: wrap;
		}

		.page-btn span {
			display: none;
		}
	}
</style>
