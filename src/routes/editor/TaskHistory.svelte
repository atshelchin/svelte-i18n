<script lang="ts">
	import { onMount } from 'svelte';
	import { getI18n } from '$lib/index.js';
	import { getRecentTasks, deleteTask, type TranslationTask } from './translation-cache.js';

	const i18n = getI18n();

	interface Props {
		onRestore: (task: TranslationTask) => void;
		onClose: () => void;
	}

	let { onRestore, onClose }: Props = $props();

	let tasks = $state<TranslationTask[]>([]);
	let loading = $state(true);
	let selectedTask = $state<TranslationTask | null>(null);
	let deleteConfirmId = $state<string | null>(null);

	onMount(async () => {
		await loadTasks();
	});

	async function loadTasks() {
		loading = true;
		try {
			tasks = await getRecentTasks(20);
		} catch (error) {
			console.error('Failed to load tasks:', error);
		} finally {
			loading = false;
		}
	}

	async function handleDelete(id: string) {
		if (deleteConfirmId === id) {
			// Confirm delete
			await deleteTask(id);
			await loadTasks();
			deleteConfirmId = null;
		} else {
			// Show confirm
			deleteConfirmId = id;
			// Auto-cancel after 3 seconds
			setTimeout(() => {
				if (deleteConfirmId === id) {
					deleteConfirmId = null;
				}
			}, 3000);
		}
	}

	function handleRestore(task: TranslationTask) {
		onRestore(task);
		onClose();
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat(i18n.locale, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'completed':
				return '#10b981';
			case 'in_progress':
				return '#3b82f6';
			case 'paused':
				return '#f59e0b';
			default:
				return '#6b7280';
		}
	}

	function getStatusIcon(status: string): string {
		switch (status) {
			case 'completed':
				return '✅';
			case 'in_progress':
				return '⏳';
			case 'paused':
				return '⏸️';
			default:
				return '📝';
		}
	}
</script>

<div class="task-history-overlay" onclick={onClose}>
	<div class="task-history-modal" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h2>📚 {i18n.locale === 'zh' ? '翻译历史' : 'Translation History'}</h2>
			<button class="btn-close" onclick={onClose}>×</button>
		</div>

		<div class="modal-body">
			{#if loading}
				<div class="loading-state">
					<div class="spinner"></div>
					<p>{i18n.locale === 'zh' ? '加载中...' : 'Loading...'}</p>
				</div>
			{:else if tasks.length === 0}
				<div class="empty-state">
					<div class="empty-icon">📭</div>
					<h3>{i18n.locale === 'zh' ? '暂无翻译任务' : 'No translation tasks yet'}</h3>
					<p>
						{i18n.locale === 'zh'
							? '开始新的翻译任务后会自动保存在这里'
							: 'Start a new translation task and it will be saved here automatically'}
					</p>
				</div>
			{:else}
				<div class="task-list">
					{#each tasks as task (task.id)}
						<div
							class="task-card"
							class:selected={selectedTask?.id === task.id}
							onclick={() => (selectedTask = selectedTask?.id === task.id ? null : task)}
						>
							<div class="task-header">
								<div class="task-info">
									<h3 class="task-name">{task.name}</h3>
									<div class="task-meta">
										<span class="task-date">{formatDate(task.updatedAt)}</span>
										<span class="task-status" style="color: {getStatusColor(task.status)}">
											{getStatusIcon(task.status)}
											{task.status.replace('_', ' ')}
										</span>
									</div>
								</div>
								<div class="task-progress">
									<div class="progress-circle" style="--progress: {task.progress}%">
										<span class="progress-text">{task.progress}%</span>
									</div>
								</div>
							</div>

							{#if selectedTask?.id === task.id}
								<div class="task-details">
									<div class="detail-grid">
										<div class="detail-item">
											<span class="detail-label"
												>{i18n.locale === 'zh' ? '源语言' : 'Sources'}:</span
											>
											<span class="detail-value">
												{#each task.sourceLangs as src, idx (src.id)}
													<span class="lang-badge">
														{src.meta?.flag || '🌐'}
														{src.meta?.name || src.locale}
													</span>
													{#if idx < task.sourceLangs.length - 1},&nbsp;{/if}
												{/each}
											</span>
										</div>
										<div class="detail-item">
											<span class="detail-label"
												>{i18n.locale === 'zh' ? '目标语言' : 'Target'}:</span
											>
											<span class="detail-value">
												<span class="lang-badge">
													{task.targetLanguage.flag || '🌐'}
													{task.targetLanguage.name}
												</span>
											</span>
										</div>
										<div class="detail-item">
											<span class="detail-label">{i18n.locale === 'zh' ? '进度' : 'Progress'}:</span
											>
											<span class="detail-value">
												{task.metadata.translatedKeys} / {task.metadata.totalKeys}
												{i18n.locale === 'zh' ? '个键' : 'keys'}
											</span>
										</div>
										<div class="detail-item">
											<span class="detail-label"
												>{i18n.locale === 'zh' ? '创建时间' : 'Created'}:</span
											>
											<span class="detail-value">{formatDate(task.createdAt)}</span>
										</div>
									</div>

									<div class="task-actions">
										<button
											class="btn-restore"
											onclick={(e) => {
												e.stopPropagation();
												handleRestore(task);
											}}
										>
											🔄 {i18n.locale === 'zh' ? '恢复任务' : 'Restore Task'}
										</button>
										<button
											class="btn-delete"
											class:confirm={deleteConfirmId === task.id}
											onclick={(e) => {
												e.stopPropagation();
												if (task.id) handleDelete(task.id);
											}}
										>
											{deleteConfirmId === task.id
												? i18n.locale === 'zh'
													? '确认删除？'
													: 'Confirm Delete?'
												: '🗑️ ' + (i18n.locale === 'zh' ? '删除' : 'Delete')}
										</button>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.task-history-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.2s;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.task-history-modal {
		background: white;
		border-radius: 16px;
		width: 90%;
		max-width: 800px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: slideUp 0.3s;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-header {
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.5rem;
		color: #1f2937;
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 2rem;
		color: #6b7280;
		cursor: pointer;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		transition: all 0.2s;
	}

	.btn-close:hover {
		background: #f3f4f6;
		color: #1f2937;
	}

	.modal-body {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	/* Loading State */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #e5e7eb;
		border-top-color: #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: #6b7280;
		max-width: 400px;
		margin: 0 auto;
	}

	/* Task List */
	.task-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.task-card {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.3s;
	}

	.task-card:hover {
		background: #f3f4f6;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		transform: translateY(-2px);
	}

	.task-card.selected {
		background: white;
		border-color: #667eea;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
	}

	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.task-info {
		flex: 1;
	}

	.task-name {
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		color: #1f2937;
		font-weight: 600;
	}

	.task-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
	}

	.task-date {
		color: #6b7280;
	}

	.task-status {
		font-weight: 500;
		text-transform: capitalize;
	}

	/* Progress Circle */
	.task-progress {
		position: relative;
	}

	.progress-circle {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: conic-gradient(#667eea var(--progress), #e5e7eb var(--progress));
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.progress-circle::before {
		content: '';
		position: absolute;
		inset: 4px;
		background: white;
		border-radius: 50%;
	}

	.progress-text {
		position: relative;
		z-index: 1;
		font-weight: 600;
		color: #1f2937;
		font-size: 0.875rem;
	}

	/* Task Details */
	.task-details {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
		animation: expand 0.3s;
	}

	@keyframes expand {
		from {
			opacity: 0;
			max-height: 0;
		}
		to {
			opacity: 1;
			max-height: 200px;
		}
	}

	.detail-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.detail-item {
		display: flex;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.detail-label {
		color: #6b7280;
		font-weight: 500;
	}

	.detail-value {
		color: #1f2937;
	}

	.lang-badge {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		background: #eff6ff;
		border: 1px solid #dbeafe;
		border-radius: 12px;
		font-size: 0.8rem;
	}

	/* Task Actions */
	.task-actions {
		display: flex;
		gap: 0.75rem;
	}

	.btn-restore {
		flex: 1;
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-restore:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}

	.btn-delete {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		color: #6b7280;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-delete:hover {
		background: #fee2e2;
		color: #dc2626;
		border-color: #fca5a5;
	}

	.btn-delete.confirm {
		background: #dc2626;
		color: white;
		border-color: #dc2626;
		animation: pulse 0.5s;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	/* Responsive */
	@media (max-width: 640px) {
		.task-history-modal {
			width: 95%;
			max-height: 90vh;
		}

		.detail-grid {
			grid-template-columns: 1fr;
		}

		.task-actions {
			flex-direction: column;
		}
	}
</style>
