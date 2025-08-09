import { Dexie, type Table } from 'dexie';

// Data structure for translation task
export interface TranslationTask {
	id?: string; // Auto-generated UUID
	name: string; // Task name (e.g., "English to French - 2024-01-09")
	createdAt: Date;
	updatedAt: Date;
	status: 'draft' | 'in_progress' | 'completed' | 'paused';
	progress: number; // 0-100 percentage

	// Source languages data
	sourceLangs: Array<{
		id: string;
		locale: string;
		translations: Record<string, unknown>;
		meta?: {
			name: string;
			code: string;
			englishName?: string;
			direction?: 'ltr' | 'rtl';
			flag?: string;
		};
		source: 'file' | 'url';
		fileName?: string;
		url?: string;
	}>;

	// Target language data
	targetLanguage: {
		code: string;
		name: string;
		englishName?: string;
		direction?: 'ltr' | 'rtl';
		flag?: string;
	};

	// Translation data
	targetTranslations: Record<string, unknown>;

	// Translation metadata
	metadata: {
		totalKeys: number;
		translatedKeys: number;
		untranslatedKeys: string[]; // Keys that still need translation
		aiEnabled: boolean;
		lastAIModel?: string;
		estimatedTimeRemaining?: number; // in seconds
	};

	// Session data
	sessionData?: {
		activeSourceTab?: number;
		expandedSections?: string[];
		searchQuery?: string;
		scrollPosition?: number;
	};
}

// File export/import format with embedded metadata
export interface TranslationExport {
	_cache?: {
		version: '1.0';
		taskId?: string;
		taskName?: string;
		createdAt?: string;
		updatedAt?: string;
		status?: 'incomplete' | 'complete';
		progress?: number;
		sourceLangs?: TranslationTask['sourceLangs'];
		targetLanguage?: TranslationTask['targetLanguage'];
		untranslatedKeys?: string[];
	};
	_meta: {
		code: string;
		name: string;
		englishName?: string;
		direction?: 'ltr' | 'rtl';
		flag?: string;
	};
	[key: string]: unknown;
}

// Database class
class TranslationCacheDB extends Dexie {
	tasks!: Table<TranslationTask>;

	constructor() {
		super('TranslationCache');

		// Define database schema
		this.version(1).stores({
			tasks: '++id, name, createdAt, updatedAt, status, progress'
		});
	}
}

// Create database instance
export const db = new TranslationCacheDB();

// Helper functions
export function generateTaskId(): string {
	return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateTaskName(sourceLang: string, targetLang: string): string {
	const date = new Date().toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
	return `${sourceLang} → ${targetLang} (${date})`;
}

// Helper to ensure object is serializable (remove functions, convert special objects)
function makeSerializable(obj: unknown, path = ''): unknown {
	if (obj === null || obj === undefined) return obj;

	// Handle primitive types
	if (typeof obj !== 'object') return obj;

	// Handle Date objects
	if (obj instanceof Date) return obj;

	// Handle Arrays
	if (Array.isArray(obj)) {
		return obj.map((item, index) => makeSerializable(item, `${path}[${index}]`));
	}

	// Check for non-plain objects (Sets, Maps, etc)
	const className = obj.constructor?.name;
	if (className && className !== 'Object') {
		console.warn(`Found non-plain object at ${path}: ${className}`);
		// Convert Sets to Arrays
		if (obj instanceof Set) {
			return Array.from(obj);
		}
		// Convert Maps to plain objects
		if (obj instanceof Map) {
			const result: Record<string, unknown> = {};
			obj.forEach((value, key) => {
				if (typeof key === 'string') {
					result[key] = makeSerializable(value, `${path}.${key}`);
				}
			});
			return result;
		}
	}

	// Handle plain objects
	const result: Record<string, unknown> = {};
	for (const key in obj) {
		const value = (obj as Record<string, unknown>)[key];
		// Skip functions and undefined values
		if (typeof value === 'function' || value === undefined) continue;
		// Skip Symbol properties
		if (typeof key === 'symbol') continue;
		// Recursively clean nested objects
		result[key] = makeSerializable(value, `${path}.${key}`);
	}
	return result;
}

// Cache operations
export async function saveTask(task: TranslationTask): Promise<string> {
	// Create a clean, serializable copy
	const cleanTask = makeSerializable(task) as TranslationTask;

	cleanTask.updatedAt = new Date();

	// Calculate progress
	const { totalKeys, translatedKeys } = cleanTask.metadata;
	cleanTask.progress = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0;

	// Update status based on progress
	if (cleanTask.progress === 100) {
		cleanTask.status = 'completed';
	} else if (cleanTask.progress > 0) {
		cleanTask.status = 'in_progress';
	}

	// Check if task already exists (by ID or by matching source/target languages)
	if (cleanTask.id) {
		// Update existing task - using put instead of update for simplicity
		await db.tasks.put(cleanTask);
	} else {
		// Check if a task with same source and target languages exists
		const existingTasks = await db.tasks.toArray();
		const matchingTask = existingTasks.find((t) => {
			// Match by source language codes and target language code
			const sourceCodesMatch =
				t.sourceLangs.length === cleanTask.sourceLangs.length &&
				t.sourceLangs.every((s, idx) => s.locale === cleanTask.sourceLangs[idx].locale);
			const targetCodeMatch = t.targetLanguage.code === cleanTask.targetLanguage.code;
			return sourceCodesMatch && targetCodeMatch;
		});

		if (matchingTask) {
			// Update existing task with same language combination
			cleanTask.id = matchingTask.id;
			cleanTask.createdAt = matchingTask.createdAt; // Keep original creation date
			await db.tasks.put(cleanTask);
		} else {
			// Create new task
			cleanTask.id = generateTaskId();
			cleanTask.createdAt = new Date();
			await db.tasks.put(cleanTask);
		}
	}

	return cleanTask.id!; // We always set the id above, so it's safe to assert it exists
}

export async function getTask(id: string): Promise<TranslationTask | undefined> {
	return await db.tasks.get(id);
}

export async function getRecentTasks(limit = 10): Promise<TranslationTask[]> {
	return await db.tasks.orderBy('updatedAt').reverse().limit(limit).toArray();
}

export async function deleteTask(id: string): Promise<void> {
	await db.tasks.delete(id);
}

export async function deleteOldTasks(daysOld = 30): Promise<void> {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - daysOld);

	const oldTasks = await db.tasks.where('updatedAt').below(cutoffDate).toArray();

	for (const task of oldTasks) {
		if (task.id) {
			await db.tasks.delete(task.id);
		}
	}
}

// Export task to file with cache metadata
export function exportTaskToFile(task: TranslationTask): TranslationExport {
	const export_: TranslationExport = {
		...task.targetTranslations,
		_cache: {
			version: '1.0',
			taskId: task.id,
			taskName: task.name,
			createdAt: task.createdAt.toISOString(),
			updatedAt: task.updatedAt.toISOString(),
			status: task.status === 'completed' ? 'complete' : 'incomplete',
			progress: task.progress,
			sourceLangs: task.sourceLangs,
			targetLanguage: task.targetLanguage,
			untranslatedKeys: task.metadata.untranslatedKeys
		},
		_meta: (task.targetTranslations._meta as TranslationExport['_meta']) || {
			code: task.targetLanguage.code,
			name: task.targetLanguage.name,
			englishName: task.targetLanguage.englishName,
			direction: task.targetLanguage.direction,
			flag: task.targetLanguage.flag
		}
	};

	return export_;
}

// Import task from file with cache metadata
export function importTaskFromFile(
	fileData: Record<string, unknown>,
	fileName?: string
): Partial<TranslationTask> | null {
	// Check if file has cache metadata
	const cache = fileData._cache as TranslationExport['_cache'];
	if (!cache || cache.version !== '1.0') {
		return null;
	}

	// Reconstruct task from cache metadata
	const task: Partial<TranslationTask> = {
		name: cache.taskName || fileName || 'Imported Task',
		createdAt: cache.createdAt ? new Date(cache.createdAt) : new Date(),
		updatedAt: cache.updatedAt ? new Date(cache.updatedAt) : new Date(),
		status: cache.status === 'complete' ? 'completed' : 'paused',
		progress: cache.progress || 0,
		sourceLangs: cache.sourceLangs || [],
		targetLanguage: cache.targetLanguage,
		targetTranslations: { ...fileData },
		metadata: {
			totalKeys: 0, // Will be recalculated
			translatedKeys: 0, // Will be recalculated
			untranslatedKeys: cache.untranslatedKeys || [],
			aiEnabled: false
		}
	};

	// Remove cache metadata from translations
	delete (task.targetTranslations as Record<string, unknown>)._cache;

	return task;
}

// Auto-save debounce helper
export function createAutoSaver(saveInterval = 5000) {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let lastSaveTime = 0;

	return {
		schedule(task: TranslationTask) {
			const now = Date.now();

			// Clear existing timeout
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			// If last save was recent, debounce
			if (now - lastSaveTime < saveInterval) {
				timeoutId = setTimeout(async () => {
					try {
						await saveTask(task);
						lastSaveTime = Date.now();
						console.log('Auto-save successful at', new Date().toLocaleTimeString());
					} catch (error) {
						console.error('Auto-save failed:', error);
						if (error instanceof Error) {
							console.error('Error details:', {
								name: error.name,
								message: error.message,
								stack: error.stack
							});
						}
					}
				}, saveInterval);
			} else {
				// Save immediately if enough time has passed
				saveTask(task)
					.then(() => {
						console.log('Auto-save successful at', new Date().toLocaleTimeString());
					})
					.catch((error) => {
						console.error('Auto-save failed:', error);
						if (error instanceof Error) {
							console.error('Error details:', {
								name: error.name,
								message: error.message,
								stack: error.stack
							});
						}
					});
				lastSaveTime = now;
			}
		},

		cancel() {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
		},

		async flush(task: TranslationTask) {
			this.cancel();
			await saveTask(task);
			lastSaveTime = Date.now();
		}
	};
}

// Check for unsaved work on page unload
export function setupUnloadProtection(hasUnsavedWork: () => boolean) {
	const handler = (e: BeforeUnloadEvent) => {
		if (hasUnsavedWork()) {
			e.preventDefault();
			e.returnValue = '';
			return '';
		}
	};

	window.addEventListener('beforeunload', handler);

	return () => {
		window.removeEventListener('beforeunload', handler);
	};
}
