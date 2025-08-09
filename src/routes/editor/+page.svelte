<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import { base } from '$app/paths';
	import { getI18n } from '$lib/index.js';
	import type { LanguageMeta } from '$lib/types.js';
	import { fuzzySearchLanguages, type LanguageInfo } from '$lib/languages.js';
	import TaskHistory from './TaskHistory.svelte';
	import {
		type TranslationTask,
		saveTask,
		getTask,
		generateTaskName,
		exportTaskToFile,
		importTaskFromFile,
		createAutoSaver,
		setupUnloadProtection
	} from './translation-cache.js';

	const i18n = getI18n();

	// Source languages management (up to 3)
	interface SourceLanguage {
		id: string;
		locale: string;
		translations: Record<string, unknown>;
		meta?: {
			code: string;
			name: string;
			englishName?: string;
			direction?: 'ltr' | 'rtl';
			flag?: string;
		};
		source: 'file' | 'url';
		fileName?: string;
		url?: string;
	}

	let sourceLangs = $state<SourceLanguage[]>([]);
	let targetTranslations = $state<Record<string, unknown>>({});

	// Task management
	let currentTask = $state<TranslationTask | null>(null);
	let showTaskHistory = $state(false);
	let autoSaveEnabled = $state(true);
	let lastSaveTime = $state<Date | null>(null);
	let hasUnsavedChanges = $state(false);
	const autoSaver = createAutoSaver(5000); // Auto-save every 5 seconds

	// Target language input and detection
	let targetLanguageInput = $state('');
	let detectedLanguageInfo = $state<LanguageInfo | null>(null);
	let targetLocaleCode = $derived(detectedLanguageInfo?.code || '');
	let targetLocaleName = $derived(detectedLanguageInfo?.name || '');
	let languageSuggestions = $state<LanguageInfo[]>([]);
	let showSuggestions = $state(false);
	let selectedSuggestionIndex = $state(-1);

	// Compute the download filename based on source pattern
	let expectedDownloadFileName = $derived.by(() => {
		if (!targetLocaleCode) return '';

		if (sourceLangs.length > 0 && sourceLangs[0].fileName) {
			let sourceFileName = sourceLangs[0].fileName;
			// Remove any existing incomplete markers
			sourceFileName = sourceFileName.replace(/_incomplete/g, '').replace(/incomplete_/g, '');
			const sourceLocale = sourceLangs[0].locale;

			// Try to replace locale in filename
			if (sourceFileName.includes(sourceLocale)) {
				return sourceFileName.replace(sourceLocale, targetLocaleCode);
			} else {
				// Try common patterns
				const patterns = [
					/\.([a-z]{2}(-[A-Z]{2})?)\.json$/i, // .en.json
					/^([a-z]{2}(-[A-Z]{2})?)\.json$/i, // en.json
					/_([a-z]{2}(-[A-Z]{2})?)\.json$/i, // _en.json
					/-([a-z]{2}(-[A-Z]{2})?)\.json$/i // -en.json
				];

				for (const pattern of patterns) {
					if (pattern.test(sourceFileName)) {
						return sourceFileName.replace(pattern, (match, locale) => {
							return match.replace(locale, targetLocaleCode);
						});
					}
				}
				return sourceFileName.replace('.json', `.${targetLocaleCode}.json`);
			}
		}
		return `${targetLocaleCode}.json`;
	});

	// UI state
	let isLoading = $state(false);
	let saveStatus = $state('');
	let taskStatus = $state<'new' | 'restored' | 'imported'>('new');
	let activeSourceTab = $state(0);
	let loadMode = $state<'file' | 'url' | 'resume'>('file');
	let urlInput = $state('');
	let showAddSource = $state(false);

	// File handling
	let fileInput = $state<HTMLInputElement>();
	let resumeFileInput = $state<HTMLInputElement>();
	let dragActive = $state(false);

	// AI Assistant
	let openaiApiKey = $state('');
	let isTranslating = $state(false);
	let translationProgress = $state(0);
	let translationTotal = $state(0);
	let translationStatus = $state('');
	let aiEnabled = $state(false);

	// Editor navigation
	const expandedSections = new SvelteSet<string>();
	let searchQuery = $state('');

	// Progress tracking
	let totalKeys = $derived(countKeys(sourceLangs[0]?.translations || {}));
	let translatedKeys = $derived(countTranslatedKeys(targetTranslations));
	let progress = $derived(totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 0);

	// Auto-detect language and show suggestions when user types
	$effect(() => {
		if (targetLanguageInput && targetLanguageInput.length >= 1) {
			// Get fuzzy search results
			const suggestions = fuzzySearchLanguages(targetLanguageInput);
			languageSuggestions = suggestions;

			// If there's exactly one match and it's exact, auto-select it
			if (suggestions.length === 1) {
				const firstMatch = suggestions[0];
				if (
					firstMatch.name.toLowerCase() === targetLanguageInput.toLowerCase() ||
					firstMatch.englishName.toLowerCase() === targetLanguageInput.toLowerCase() ||
					firstMatch.code.toLowerCase() === targetLanguageInput.toLowerCase()
				) {
					detectedLanguageInfo = firstMatch;
					showSuggestions = false;
				} else {
					showSuggestions = true;
				}
			} else if (suggestions.length > 0) {
				showSuggestions = true;
			} else {
				showSuggestions = false;
				detectedLanguageInfo = null;
			}
		} else {
			languageSuggestions = [];
			showSuggestions = false;
			detectedLanguageInfo = null;
		}
		selectedSuggestionIndex = -1;
	});

	function selectLanguage(lang: LanguageInfo) {
		detectedLanguageInfo = lang;
		targetLanguageInput = lang.name;
		showSuggestions = false;
		selectedSuggestionIndex = -1;
	}

	function handleLanguageInputKeydown(e: KeyboardEvent) {
		if (!showSuggestions || languageSuggestions.length === 0) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				selectedSuggestionIndex = Math.min(
					selectedSuggestionIndex + 1,
					languageSuggestions.length - 1
				);
				break;
			case 'ArrowUp':
				e.preventDefault();
				selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
				break;
			case 'Enter':
				e.preventDefault();
				if (selectedSuggestionIndex >= 0) {
					selectLanguage(languageSuggestions[selectedSuggestionIndex]);
				} else if (languageSuggestions.length > 0) {
					selectLanguage(languageSuggestions[0]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				showSuggestions = false;
				selectedSuggestionIndex = -1;
				break;
		}
	}

	function countKeys(obj: Record<string, unknown>): number {
		let count = 0;
		for (const key in obj) {
			if (key === '_meta') continue;
			if (typeof obj[key] === 'string') {
				count++;
			} else if (typeof obj[key] === 'object' && obj[key] !== null) {
				count += countKeys(obj[key] as Record<string, unknown>);
			}
		}
		return count;
	}

	function countTranslatedKeys(obj: Record<string, unknown>): number {
		let count = 0;
		for (const key in obj) {
			if (key === '_meta') continue;
			// Consider any non-empty string as translated
			// Even if it contains [TODO, it might be a valid translation of a TODO message
			if (typeof obj[key] === 'string' && obj[key]) {
				count++;
			} else if (typeof obj[key] === 'object' && obj[key] !== null) {
				count += countTranslatedKeys(obj[key] as Record<string, unknown>);
			}
		}
		return count;
	}

	async function loadFromUrls(urlsInput: string) {
		if (!urlsInput) {
			alert(i18n.t('editor.errors.invalidUrl'));
			return;
		}

		// Support multiple URLs separated by newlines or commas
		const urls = urlsInput
			.split(/[\n,]/)
			.map((u) => u.trim())
			.filter((u) => u.length > 0);

		if (urls.length === 0) {
			alert(i18n.t('editor.errors.invalidUrl'));
			return;
		}

		const maxUrls = Math.min(urls.length, 3 - sourceLangs.length);
		if (urls.length > maxUrls) {
			alert(i18n.t('editor.errors.maxSources'));
		}

		isLoading = true;
		let successCount = 0;

		for (let i = 0; i < maxUrls; i++) {
			try {
				const response = await fetch(urls[i]);
				if (!response.ok) {
					throw new Error(`Failed to fetch: ${response.statusText}`);
				}
				const data = await response.json();

				// Extract locale and filename from URL
				const urlParts = urls[i].split('/');
				const fileName = urlParts[urlParts.length - 1];
				
				// Extract locale from filename - try to find the actual locale code
				let locale = fileName.replace('.json', '');
				// Common patterns to extract locale code
				const localePatterns = [
					/\.([a-z]{2}(-[A-Z]{2})?)$/i,  // app.en or app.en-US
					/^([a-z]{2}(-[A-Z]{2})?)$/i,    // en or en-US
					/_([a-z]{2}(-[A-Z]{2})?)$/i,    // app_en or app_en-US
					/-([a-z]{2}(-[A-Z]{2})?)$/i     // app-en or app-en-US
				];
				
				for (const pattern of localePatterns) {
					const match = locale.match(pattern);
					if (match) {
						locale = match[1];
						break;
					}
				}

				addSourceLanguage(data, locale, 'url', urls[i], fileName);
				successCount++;
			} catch (error) {
				console.error(`Failed to load ${urls[i]}:`, error);
				alert(i18n.t('editor.errors.loadFailed', { error: `${urls[i]}: ${String(error)}` }));
			}
		}

		if (successCount > 0) {
			urlInput = '';
			showAddSource = false; // Hide add source UI after successful load
		}

		isLoading = false;
	}

	async function handleFileDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;

		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			// Handle multiple files
			const maxFiles = Math.min(files.length, 3 - sourceLangs.length);
			for (let i = 0; i < maxFiles; i++) {
				await handleFileUpload(files[i]);
			}
			if (files.length > maxFiles) {
				alert(i18n.t('editor.errors.maxSources'));
			}
		}
	}

	async function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			// Handle multiple files
			const maxFiles = Math.min(files.length, 3 - sourceLangs.length);
			for (let i = 0; i < maxFiles; i++) {
				await handleFileUpload(files[i]);
			}
			if (files.length > maxFiles) {
				alert(i18n.t('editor.errors.maxSources'));
			}
		}
	}

	async function handleFileUpload(file: File) {
		if (!file.name.endsWith('.json')) {
			alert(i18n.t('editor.errors.jsonOnly'));
			return;
		}

		if (sourceLangs.length >= 3) {
			alert(i18n.t('editor.errors.maxSources'));
			return;
		}

		isLoading = true;
		try {
			const text = await file.text();
			const data = JSON.parse(text);

			// Otherwise, treat as normal source file
			// Extract locale from filename - try to find the actual locale code
			let locale = file.name.replace('.json', '');
			// Common patterns to extract locale code
			const localePatterns = [
				/\.([a-z]{2}(-[A-Z]{2})?)$/i,  // app.en or app.en-US
				/^([a-z]{2}(-[A-Z]{2})?)$/i,    // en or en-US
				/_([a-z]{2}(-[A-Z]{2})?)$/i,    // app_en or app_en-US
				/-([a-z]{2}(-[A-Z]{2})?)$/i     // app-en or app-en-US
			];
			
			for (const pattern of localePatterns) {
				const match = locale.match(pattern);
				if (match) {
					locale = match[1];
					break;
				}
			}

			addSourceLanguage(data, locale, 'file', undefined, file.name);
			showAddSource = false; // Hide add source UI after successful load
		} catch (error) {
			alert(i18n.t('editor.errors.parseFailed'));
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	async function handleResumeFile(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith('.json')) {
			alert(
				i18n.locale === 'zh'
					? '请上传 JSON 格式的翻译文件'
					: 'Please upload a JSON translation file'
			);
			return;
		}

		isLoading = true;
		try {
			const text = await file.text();
			const data = JSON.parse(text);

			// Check if it's a cached incomplete translation
			if (data._cache && data._cache.version === '1.0') {
				const taskData = importTaskFromFile(data, file.name);
				if (taskData) {
					restoreTask(taskData);
					taskStatus = 'imported';
					showAddSource = false;
					saveStatus = i18n.locale === 'zh' ? '✅ 已恢复翻译任务' : '✅ Translation task restored';
					setTimeout(() => {
						saveStatus = '';
					}, 3000);
				} else {
					alert(
						i18n.locale === 'zh'
							? '无法恢复任务，文件格式可能不正确'
							: 'Cannot restore task, file format may be incorrect'
					);
				}
			} else {
				alert(
					i18n.locale === 'zh'
						? '该文件不包含缓存信息，无法恢复翻译进度。\n请使用"从文件加载"选项添加源文件。'
						: 'This file does not contain cache metadata.\nPlease use "Load from File" option to add source files.'
				);
			}
		} catch (error) {
			alert(
				i18n.locale === 'zh'
					? '文件解析失败，请检查文件格式'
					: 'Failed to parse file, please check the format'
			);
			console.error(error);
		} finally {
			isLoading = false;
			// Reset file input
			if (target) target.value = '';
		}
	}

	function addSourceLanguage(
		data: Record<string, unknown>,
		locale: string,
		source: 'file' | 'url',
		url?: string,
		fileName?: string
	) {
		const id = `source-${Date.now()}`;
		const newSource: SourceLanguage = {
			id,
			locale,
			translations: data,
			meta: data._meta as SourceLanguage['meta'],
			source,
			url,
			fileName
		};

		sourceLangs = [...sourceLangs, newSource];

		// If this is the first source, initialize target structure
		if (sourceLangs.length === 1) {
			targetTranslations = createEmptyStructure(data);
			activeSourceTab = 0;
		}
	}

	function removeSourceLanguage(id: string) {
		sourceLangs = sourceLangs.filter((s) => s.id !== id);
		if (sourceLangs.length === 0) {
			targetTranslations = {};
		} else if (activeSourceTab >= sourceLangs.length) {
			activeSourceTab = sourceLangs.length - 1;
		}
	}

	// Validation functions
	function collectAllKeys(obj: Record<string, unknown>, prefix = ''): SvelteSet<string> {
		const keys = new SvelteSet<string>();

		for (const key in obj) {
			if (key === '_meta') continue;

			const fullKey = prefix ? `${prefix}.${key}` : key;

			if (typeof obj[key] === 'string') {
				keys.add(fullKey);
			} else if (typeof obj[key] === 'object' && obj[key] !== null) {
				const nestedKeys = collectAllKeys(obj[key] as Record<string, unknown>, fullKey);
				nestedKeys.forEach((k) => keys.add(k));
			}
		}

		return keys;
	}

	interface ValidationResult {
		isComplete: boolean;
		missingKeys: SvelteMap<string, string[]>; // locale -> missing keys
		extraKeys: SvelteMap<string, string[]>; // locale -> extra keys
		commonKeys: SvelteSet<string>;
	}

	function validateSourceCompleteness(): ValidationResult {
		if (sourceLangs.length === 0) {
			return {
				isComplete: true,
				missingKeys: new SvelteMap(),
				extraKeys: new SvelteMap(),
				commonKeys: new SvelteSet()
			};
		}

		// Collect all keys from each source
		const keysBySource = new SvelteMap<string, SvelteSet<string>>();
		sourceLangs.forEach((source) => {
			keysBySource.set(source.locale, collectAllKeys(source.translations));
		});

		// Find union of all keys
		const allKeys = new SvelteSet<string>();
		keysBySource.forEach((keys) => {
			keys.forEach((k) => allKeys.add(k));
		});

		// Find common keys (intersection)
		let commonKeys = new SvelteSet(allKeys);
		keysBySource.forEach((keys) => {
			commonKeys = new SvelteSet([...commonKeys].filter((k) => keys.has(k)));
		});

		// Find missing and extra keys for each source
		const missingKeys = new SvelteMap<string, string[]>();
		const extraKeys = new SvelteMap<string, string[]>();

		sourceLangs.forEach((source) => {
			const sourceKeys = keysBySource.get(source.locale)!;
			const missing = [...allKeys].filter((k) => !sourceKeys.has(k));
			const extra = [...sourceKeys].filter((k) => !commonKeys.has(k));

			if (missing.length > 0) {
				missingKeys.set(source.locale, missing);
			}
			if (extra.length > 0) {
				extraKeys.set(source.locale, extra);
			}
		});

		const isComplete = missingKeys.size === 0 && extraKeys.size === 0;

		return {
			isComplete,
			missingKeys,
			extraKeys,
			commonKeys
		};
	}

	// Reactive validation state
	let validationResult = $derived(validateSourceCompleteness());
	let showValidationWarning = $state(false);

	function createEmptyStructure(obj: Record<string, unknown>): Record<string, unknown> {
		const result: Record<string, unknown> = {};

		for (const key in obj) {
			if (key === '_meta') {
				result._meta = {
					code: '',
					name: '',
					englishName: '',
					direction: 'ltr',
					flag: '🏳️'
				};
			} else if (typeof obj[key] === 'string') {
				result[key] = '';
			} else if (typeof obj[key] === 'object' && obj[key] !== null) {
				result[key] = createEmptyStructure(obj[key] as Record<string, unknown>);
			}
		}

		return result;
	}

	// Update target metadata when language is detected
	function updateTargetMetadata() {
		if (targetTranslations && targetTranslations._meta && detectedLanguageInfo) {
			const newMeta = {
				code: targetLocaleCode || detectedLanguageInfo.code,
				name: targetLocaleName || detectedLanguageInfo.name,
				englishName: detectedLanguageInfo.englishName || detectedLanguageInfo.name,
				direction: detectedLanguageInfo.direction || 'ltr',
				flag: detectedLanguageInfo.flag || '🏳️'
			};

			// Only update if metadata actually changed
			const currentMeta = targetTranslations._meta as LanguageMeta;
			if (
				currentMeta.code !== newMeta.code ||
				currentMeta.name !== newMeta.name ||
				currentMeta.englishName !== newMeta.englishName ||
				currentMeta.direction !== newMeta.direction ||
				currentMeta.flag !== newMeta.flag
			) {
				targetTranslations._meta = newMeta;
				targetTranslations = { ...targetTranslations };
			}
		}
	}

	function updateTranslation(path: string[], value: string) {
		let current: Record<string, unknown> = targetTranslations;
		for (let i = 0; i < path.length - 1; i++) {
			current = current[path[i]] as Record<string, unknown>;
		}
		current[path[path.length - 1]] = value;
		targetTranslations = { ...targetTranslations };
	}

	async function translateWithAI(
		sourceText: string,
		sourceLang: string,
		keyPath?: string
	): Promise<string> {
		if (!aiEnabled || !openaiApiKey || !targetLocaleCode) {
			return '';
		}

		isTranslating = true;
		try {
			// Build context with all available translations for better accuracy
			let systemPrompt = `You are a professional translator specializing in software localization.`;
			let userPrompt = '';

			if (sourceLangs.length > 1 && keyPath) {
				// Multiple sources available - provide all translations as reference
				systemPrompt += `\n\nYou have multiple reference translations for the same text in different languages. Use all of them to understand the context and meaning, then provide the most accurate translation.`;

				userPrompt = `Translate the following text to ${detectedLanguageInfo?.name || targetLocaleCode} (${targetLocaleCode}):\n\n`;

				// Add all available translations as reference
				sourceLangs.forEach((src) => {
					const value = getNestedValue(src.translations, keyPath);
					if (typeof value === 'string') {
						const langName = src.meta?.name || src.locale;
						const langCode = src.meta?.code || src.locale;
						userPrompt += `${langName} (${langCode}): "${value}"\n`;
					}
				});

				userPrompt += `\nBased on all these translations, provide the ${detectedLanguageInfo?.name || targetLocaleCode} translation:`;
			} else {
				// Single source or direct text translation
				const sourceLangInfo = sourceLangs.find((s) => s.locale === sourceLang);
				const sourceLangName = sourceLangInfo?.meta?.name || sourceLang;
				const targetLangName = detectedLanguageInfo?.name || targetLocaleCode;

				systemPrompt += `\n\nTranslate from ${sourceLangName} to ${targetLangName}.`;
				userPrompt = sourceText;
			}

			systemPrompt += `\n\nImportant rules:
1. Keep the same tone, style, and formality level as the source text
2. Preserve all placeholders exactly as they are (e.g., {name}, {count}, {0}, %s, etc.)
3. Maintain the same meaning and context
4. Return ONLY the translated text, no explanations or alternatives`;

			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${openaiApiKey}`
				},
				body: JSON.stringify({
					model: 'gpt-3.5-turbo',
					messages: [
						{
							role: 'system',
							content: systemPrompt
						},
						{
							role: 'user',
							content: userPrompt
						}
					],
					temperature: 0.3,
					max_tokens: 500
				})
			});

			if (!response.ok) {
				throw new Error('AI translation failed');
			}

			const data = await response.json();
			return data.choices[0].message.content.trim();
		} catch (error) {
			console.error('AI translation error:', error);
			return '';
		} finally {
			isTranslating = false;
		}
	}

	async function translateAll() {
		if (!aiEnabled || !openaiApiKey || !targetLocaleCode) {
			alert(i18n.t('editor.errors.aiConfig'));
			return;
		}

		if (sourceLangs.length === 0) {
			alert(i18n.t('editor.errors.noSource'));
			return;
		}

		// Check validation if multiple sources
		if (sourceLangs.length > 1 && !validationResult.isComplete) {
			showValidationWarning = true;
			const proceed = confirm(
				'⚠️ Warning: Source language files have inconsistent keys.\n\n' +
					`Missing keys: ${validationResult.missingKeys.size > 0 ? 'Yes' : 'No'}\n` +
					`Extra keys: ${validationResult.extraKeys.size > 0 ? 'Yes' : 'No'}\n\n` +
					'Translation quality may be affected. Continue anyway?'
			);
			if (!proceed) return;
		}

		const primarySource = sourceLangs[activeSourceTab];
		const untranslatedCount = totalKeys - translatedKeys;

		if (untranslatedCount === 0) {
			alert(
				i18n.locale === 'zh' ? '✅ 所有字段已翻译完成！' : '✅ All fields are already translated!'
			);
			return;
		}

		const confirmTranslate = confirm(
			i18n.locale === 'zh'
				? `将翻译 ${untranslatedCount} 个未完成的字段\n已翻译的字段将被跳过。\n\n继续？`
				: `Will translate ${untranslatedCount} untranslated fields.\nAlready translated fields will be skipped.\n\nContinue?`
		);

		if (!confirmTranslate) return;

		isTranslating = true;
		translationProgress = 0;
		translationTotal = untranslatedCount;

		// Collect all fields that need translation
		const translationTasks: Array<{
			path: string[];
			fullPath: string;
			sourceText: string;
		}> = [];

		function collectTranslationTasks(
			source: Record<string, unknown>,
			target: Record<string, unknown>,
			path: string[] = []
		) {
			for (const key in source) {
				if (key === '_meta') continue;

				const currentPath = [...path, key];

				if (typeof source[key] === 'string') {
					// Only translate if target is empty
					if (!target[key]) {
						const fullPath = currentPath.join('.');
						translationTasks.push({
							path: currentPath,
							fullPath,
							sourceText: source[key] as string
						});
					}
				} else if (typeof source[key] === 'object' && source[key] !== null) {
					collectTranslationTasks(
						source[key] as Record<string, unknown>,
						(target[key] as Record<string, unknown>) || {},
						currentPath
					);
				}
			}
		}

		collectTranslationTasks(primarySource.translations, targetTranslations);

		// Process translations with concurrency control
		const CONCURRENT_LIMIT = 5; // Max concurrent API calls (adjust based on OpenAI rate limits)
		const RATE_LIMIT_DELAY = 200; // Minimum delay between API calls (ms)

		async function processTranslations() {
			const queue = [...translationTasks];
			const inProgress = new SvelteMap<number, Promise<void>>();
			let lastApiCall = 0;

			while (queue.length > 0 || inProgress.size > 0) {
				// Start new translations if under concurrency limit
				while (inProgress.size < CONCURRENT_LIMIT && queue.length > 0) {
					const task = queue.shift()!;
					const taskId = Date.now() + Math.random();

					// Rate limiting
					const now = Date.now();
					const timeSinceLastCall = now - lastApiCall;
					if (timeSinceLastCall < RATE_LIMIT_DELAY) {
						await new Promise((resolve) =>
							setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastCall)
						);
					}
					lastApiCall = Date.now();

					const promise = translateWithAI(task.sourceText, primarySource.locale, task.fullPath)
						.then((translated) => {
							if (translated) {
								updateTranslation(task.path, translated);
								translationProgress++;
								translationStatus =
									i18n.locale === 'zh'
										? `正在翻译... (${translationProgress}/${translationTotal})`
										: `Translating... (${translationProgress}/${translationTotal})`;
							}
						})
						.catch((error) => {
							console.error(`Failed to translate ${task.fullPath}:`, error);
						})
						.finally(() => {
							inProgress.delete(taskId);
						});

					inProgress.set(taskId, promise);
				}

				// Wait for at least one translation to complete
				if (inProgress.size > 0) {
					await Promise.race(inProgress.values());
				}
			}
		}

		try {
			await processTranslations();
			translationStatus = '';
			alert(i18n.t('editor.translateSuccess'));
		} catch (error) {
			alert(i18n.t('editor.translateFailed'));
			console.error(error);
		} finally {
			isTranslating = false;
			translationProgress = 0;
			translationTotal = 0;
			translationStatus = '';
		}
	}

	// Use the new downloadTranslationsWithCache function
	const downloadTranslations = downloadTranslationsWithCache;

	function toggleSection(section: string) {
		if (expandedSections.has(section)) {
			expandedSections.delete(section);
		} else {
			expandedSections.add(section);
		}
	}

	function renderTranslationFields(
		sourceObj: Record<string, unknown>,
		targetObj: Record<string, unknown>,
		path: string[] = []
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): any[] {
		const items = [];

		for (const key in sourceObj) {
			if (key === '_meta') continue;

			const currentPath = [...path, key];
			const pathString = currentPath.join('.');

			if (typeof sourceObj[key] === 'string') {
				// Check if matches search
				if (
					searchQuery &&
					!pathString.toLowerCase().includes(searchQuery.toLowerCase()) &&
					!sourceObj[key].toLowerCase().includes(searchQuery.toLowerCase())
				) {
					continue;
				}

				// Check if this key exists in all sources
				const missingInSources: string[] = [];
				sourceLangs.forEach((src) => {
					const value = getNestedValue(src.translations, pathString);
					if (value === undefined || value === null) {
						missingInSources.push(src.locale);
					}
				});

				items.push({
					type: 'field',
					path: currentPath,
					pathString,
					key,
					sourceValue: sourceObj[key] as string,
					targetValue: (targetObj[key] as string) || '',
					missingInSources
				});
			} else if (typeof sourceObj[key] === 'object' && sourceObj[key] !== null) {
				items.push({
					type: 'section',
					path: currentPath,
					pathString,
					key,
					children: renderTranslationFields(
						sourceObj[key] as Record<string, unknown>,
						(targetObj[key] as Record<string, unknown>) || {},
						currentPath
					)
				});
			}
		}

		return items;
	}

	const translationItems = $derived(
		sourceLangs.length > 0 && sourceLangs[activeSourceTab]
			? renderTranslationFields(sourceLangs[activeSourceTab].translations, targetTranslations)
			: []
	);

	function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
		return path.split('.').reduce<unknown>((current, key) => {
			if (current && typeof current === 'object' && key in current) {
				return (current as Record<string, unknown>)[key];
			}
			return undefined;
		}, obj);
	}

	// Count fields in a section recursively
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function countFieldsInSection(items: any[]): number {
		let count = 0;
		for (const item of items) {
			if (item.type === 'field') {
				count++;
			} else if (item.type === 'section' && item.children) {
				count += countFieldsInSection(item.children);
			}
		}
		return count;
	}

	// Count translated fields in a section
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function countTranslatedFieldsInSection(items: any[]): number {
		let count = 0;
		for (const item of items) {
			if (item.type === 'field') {
				// Count any non-empty value as translated
				if (item.targetValue) {
					count++;
				}
			} else if (item.type === 'section' && item.children) {
				count += countTranslatedFieldsInSection(item.children);
			}
		}
		return count;
	}

	// Calculate section progress
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function calculateSectionProgress(items: any[]): number {
		const total = countFieldsInSection(items);
		const translated = countTranslatedFieldsInSection(items);
		return total > 0 ? Math.round((translated / total) * 100) : 0;
	}

	// Helper to create serializable task data
	function createSerializableTask(task: TranslationTask): TranslationTask {
		// First, create a clean object without any reactive proxies
		// We need to explicitly handle all nested reactive properties
		const cleanTask = {
			id: task.id,
			name: task.name,
			createdAt: task.createdAt,
			updatedAt: task.updatedAt,
			status: task.status,
			progress: task.progress,
			// Deep clone sourceLangs to remove any reactive proxies
			sourceLangs: JSON.parse(JSON.stringify(task.sourceLangs)),
			// Deep clone targetLanguage
			targetLanguage: JSON.parse(JSON.stringify(task.targetLanguage)),
			// Deep clone targetTranslations - this is the main reactive object
			targetTranslations: JSON.parse(JSON.stringify(targetTranslations)),
			// Deep clone metadata
			metadata: {
				totalKeys: task.metadata.totalKeys,
				translatedKeys: task.metadata.translatedKeys,
				untranslatedKeys: [...task.metadata.untranslatedKeys],
				aiEnabled: task.metadata.aiEnabled,
				lastAIModel: task.metadata.lastAIModel,
				estimatedTimeRemaining: task.metadata.estimatedTimeRemaining
			},
			// Handle sessionData with expandedSections conversion
			sessionData: {
				activeSourceTab: task.sessionData?.activeSourceTab || activeSourceTab,
				expandedSections: Array.from(expandedSections || new SvelteSet()),
				searchQuery: task.sessionData?.searchQuery || searchQuery,
				scrollPosition: task.sessionData?.scrollPosition
			}
		};

		return cleanTask as TranslationTask;
	}

	// Task management functions
	function createNewTask(): TranslationTask {
		const sourceLangName = sourceLangs[0]?.meta?.name || sourceLangs[0]?.locale || 'Unknown';
		const targetLangName = targetLocaleName || targetLocaleCode || 'Unknown';

		return {
			name: generateTaskName(sourceLangName, targetLangName),
			createdAt: new Date(),
			updatedAt: new Date(),
			status: 'draft',
			progress: 0,
			// Deep clone to avoid reactive proxies
			sourceLangs: JSON.parse(JSON.stringify(sourceLangs)),
			targetLanguage: {
				code: targetLocaleCode,
				name: targetLocaleName,
				englishName: detectedLanguageInfo?.englishName,
				direction: detectedLanguageInfo?.direction,
				flag: detectedLanguageInfo?.flag
			},
			// Deep clone targetTranslations to avoid reactive proxy issues
			targetTranslations: JSON.parse(JSON.stringify(targetTranslations)),
			metadata: {
				totalKeys,
				translatedKeys,
				untranslatedKeys: getUntranslatedKeys(),
				aiEnabled
			},
			sessionData: {
				activeSourceTab,
				expandedSections: Array.from(expandedSections || new SvelteSet()),
				searchQuery
			}
		};
	}

	function getUntranslatedKeys(): string[] {
		const keys: string[] = [];

		function collectKeys(obj: Record<string, unknown>, path = '') {
			for (const key in obj) {
				if (key === '_meta') continue;
				const fullPath = path ? `${path}.${key}` : key;

				if (typeof obj[key] === 'string') {
					const value = obj[key] as string;
					// Only consider empty fields as untranslated
					if (!value) {
						keys.push(fullPath);
					}
				} else if (typeof obj[key] === 'object' && obj[key] !== null) {
					collectKeys(obj[key] as Record<string, unknown>, fullPath);
				}
			}
		}

		if (targetTranslations) {
			collectKeys(targetTranslations);
		}

		return keys;
	}

	function restoreTask(task: Partial<TranslationTask>) {
		// Restore source languages
		sourceLangs = task.sourceLangs?.map((s) => ({ ...s })) || [];

		// Restore target language
		if (task.targetLanguage) {
			targetLanguageInput = task.targetLanguage.name;
			detectedLanguageInfo = {
				code: task.targetLanguage.code,
				name: task.targetLanguage.name,
				englishName: task.targetLanguage.englishName || '',
				direction: task.targetLanguage.direction || 'ltr',
				flag: task.targetLanguage.flag || '🌐'
			};
		}

		// Restore translations
		targetTranslations = task.targetTranslations || {};

		// Restore session data
		if (task.sessionData) {
			activeSourceTab = task.sessionData.activeSourceTab || 0;
			expandedSections.clear();
			(task.sessionData.expandedSections || []).forEach((s) => expandedSections.add(s));
			searchQuery = task.sessionData.searchQuery || '';
		}

		// Create a proper task with updated metadata
		const restoredTask: TranslationTask = {
			id: task.id,
			name:
				task.name ||
				generateTaskName(
					sourceLangs[0]?.meta?.name || sourceLangs[0]?.locale || 'Unknown',
					task.targetLanguage?.name || 'Unknown'
				),
			createdAt: task.createdAt || new Date(),
			updatedAt: new Date(),
			status: 'in_progress',
			progress: 0, // Will be recalculated
			sourceLangs: sourceLangs,
			targetLanguage: task.targetLanguage || {
				code: targetLocaleCode,
				name: targetLocaleName,
				englishName: detectedLanguageInfo?.englishName,
				direction: detectedLanguageInfo?.direction || 'ltr',
				flag: detectedLanguageInfo?.flag || '🌐'
			},
			targetTranslations: targetTranslations,
			metadata: {
				totalKeys: countKeys(sourceLangs[0]?.translations || {}),
				translatedKeys: countTranslatedKeys(targetTranslations),
				untranslatedKeys: getUntranslatedKeys(),
				aiEnabled: false
			},
			sessionData: {
				activeSourceTab,
				expandedSections: Array.from(expandedSections || new SvelteSet()),
				searchQuery
			}
		};

		// Set current task
		currentTask = restoredTask;
		taskStatus = 'restored';
		saveStatus = i18n.locale === 'zh' ? '✅ 任务已恢复' : '✅ Task restored';

		// Save the restored task immediately to update progress
		saveCurrentTask();

		setTimeout(() => {
			saveStatus = '';
		}, 3000);
	}

	async function downloadTranslationsWithCache() {
		if (!targetLocaleCode) return;

		// Update current task before export
		if (!currentTask) {
			currentTask = createNewTask();
		} else {
			// Update with clean, non-reactive data
			currentTask.targetTranslations = JSON.parse(JSON.stringify(targetTranslations));
			currentTask.metadata.totalKeys = totalKeys;
			currentTask.metadata.translatedKeys = translatedKeys;
			currentTask.metadata.untranslatedKeys = getUntranslatedKeys();
		}

		let exportData: Record<string, unknown>;

		// If translation is complete (100%), export clean JSON without cache
		if (progress >= 100) {
			exportData = JSON.parse(JSON.stringify(targetTranslations));
		} else {
			// If incomplete, include cache metadata for resuming later
			const serializedTask = createSerializableTask(currentTask);
			exportData = exportTaskToFile(serializedTask);
		}

		// Use the computed filename (same logic as display)
		let downloadFileName = expectedDownloadFileName;

		// Add incomplete suffix if needed
		if (progress < 100 && downloadFileName) {
			downloadFileName = downloadFileName.replace('.json', '_incomplete.json');
		}

		// Fallback if no filename computed
		if (!downloadFileName) {
			downloadFileName = `${targetLocaleCode}_${progress < 100 ? 'incomplete_' : ''}translations.json`;
		}

		// Create download
		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: 'application/json'
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = downloadFileName;
		a.click();
		URL.revokeObjectURL(url);

		saveStatus = i18n.t('editor.downloadSuccess');
		setTimeout(() => {
			saveStatus = '';
		}, 3000);
	}

	// Manual save function
	async function saveCurrentTask() {
		if (!sourceLangs.length || !targetLocaleCode) return;

		if (!currentTask) {
			currentTask = createNewTask();
		} else {
			// Update the current task with clean, non-reactive data
			currentTask.targetTranslations = JSON.parse(JSON.stringify(targetTranslations));
			currentTask.metadata.totalKeys = totalKeys;
			currentTask.metadata.translatedKeys = translatedKeys;
			currentTask.metadata.untranslatedKeys = getUntranslatedKeys();
		}

		try {
			const taskToSave = createSerializableTask(currentTask);
			await saveTask(taskToSave);
			lastSaveTime = new Date();
			// Reset after manual save
			hasUnsavedChanges = false;
			// Re-enable after a moment to allow new changes
			setTimeout(() => {
				isInitialLoad = false;
			}, 100);
			saveStatus = i18n.locale === 'zh' ? '✅ 已保存' : '✅ Saved';
			setTimeout(() => {
				saveStatus = '';
			}, 3000);
		} catch (error) {
			console.error('Failed to save task:', error);
			saveStatus = i18n.locale === 'zh' ? '❌ 保存失败' : '❌ Save failed';
		}
	}

	// Auto-save effect
	let autoSaveInProgress = false;
	$effect(() => {
		if (
			autoSaveEnabled &&
			sourceLangs.length > 0 &&
			targetLocaleCode &&
			hasUnsavedChanges &&
			!autoSaveInProgress
		) {
			// Create a clean task object for saving
			autoSaveInProgress = true;
			const taskToSave = createSerializableTask(currentTask || createNewTask());
			autoSaver.schedule(taskToSave);
			// Keep hasUnsavedChanges true so manual save button remains enabled
			setTimeout(() => {
				autoSaveInProgress = false;
			}, 5000); // Reset after 5 seconds
		}
	});

	// Track changes - but don't trigger on initial load
	let isInitialLoad = true;
	$effect(() => {
		// Watch for any changes that should trigger auto-save
		// Access the reactive values to track them
		void targetTranslations;
		void translatedKeys;

		// Skip setting hasUnsavedChanges on initial load
		if (isInitialLoad) {
			isInitialLoad = false;
		} else {
			hasUnsavedChanges = true;
		}
	});

	// Update metadata when target language changes
	let previousLanguageCode = '';
	$effect(() => {
		if (detectedLanguageInfo && targetLocaleCode !== previousLanguageCode) {
			previousLanguageCode = targetLocaleCode;
			updateTargetMetadata();
		}
	});

	let unloadProtection: (() => void) | null = null;

	onMount(() => {
		// Load saved API key from localStorage
		const savedKey = localStorage.getItem('openai_api_key');
		if (savedKey) {
			openaiApiKey = savedKey;
			aiEnabled = true;
		}
	});

	$effect(() => {
		// Save API key to localStorage when changed
		if (openaiApiKey) {
			localStorage.setItem('openai_api_key', openaiApiKey);
		}

		// Setup unload protection
		unloadProtection = setupUnloadProtection(() => hasUnsavedChanges);

		// Check for URL parameters for task restoration
		const urlParams = new URLSearchParams(window.location.search);
		const taskId = urlParams.get('task');
		if (taskId) {
			getTask(taskId).then((task) => {
				if (task) {
					restoreTask(task);
				}
			});
		}
	});

	onDestroy(() => {
		// Cancel auto-save
		autoSaver.cancel();

		// Remove unload protection
		if (unloadProtection) {
			unloadProtection();
		}

		// Save current task if there are unsaved changes
		if (hasUnsavedChanges && currentTask) {
			// Update task with clean data before final save
			currentTask.targetTranslations = JSON.parse(JSON.stringify(targetTranslations));
			currentTask.metadata.totalKeys = totalKeys;
			currentTask.metadata.translatedKeys = translatedKeys;
			currentTask.metadata.untranslatedKeys = getUntranslatedKeys();

			const serializedTask = createSerializableTask(currentTask);
			autoSaver.flush(serializedTask);
		}
	});
</script>

{#if showTaskHistory}
	<TaskHistory onRestore={restoreTask} onClose={() => (showTaskHistory = false)} />
{/if}

<div class="editor-container">
	<!-- Header -->
	<header class="editor-header">
		<div class="header-content">
			<h1>🌍 {i18n.t('editor.title')}</h1>
			<p>{i18n.t('editor.subtitle')}</p>
			{#if taskStatus === 'restored'}
				<div class="task-badge restored">
					📂 {i18n.locale === 'zh' ? '任务已恢复' : 'Task Restored'}
				</div>
			{:else if taskStatus === 'imported'}
				<div class="task-badge imported">
					📥 {i18n.locale === 'zh' ? '已导入未完成任务' : 'Incomplete Task Imported'}
				</div>
			{/if}
		</div>
		<div class="header-actions">
			{#if autoSaveEnabled && lastSaveTime}
				<div class="auto-save-status">
					💾 {i18n.locale === 'zh' ? '自动保存' : 'Auto-save'}:
					<span class="save-time">{lastSaveTime.toLocaleTimeString()}</span>
				</div>
			{/if}
			<button class="btn-history" onclick={() => (showTaskHistory = true)}>
				📚 {i18n.locale === 'zh' ? '历史' : 'History'}
			</button>
			<a href="{base}/" class="btn-back">← {i18n.t('editor.backToHome')}</a>
		</div>
	</header>

	<!-- Upload Section -->
	{#if sourceLangs.length === 0 || showAddSource}
		<div class="upload-section">
			{#if sourceLangs.length > 0 && showAddSource}
				<div class="add-source-header">
					<h2>{i18n.t('editor.addMoreSources')}</h2>
					<button class="btn-cancel" onclick={() => (showAddSource = false)}>
						{i18n.t('actions.cancel')}
					</button>
				</div>
			{/if}
			<div class="load-mode-selector">
				<button
					class="mode-btn"
					class:active={loadMode === 'file'}
					onclick={() => (loadMode = 'file')}
				>
					📁 {i18n.t('editor.loadFromFile')}
				</button>
				<button
					class="mode-btn"
					class:active={loadMode === 'url'}
					onclick={() => (loadMode = 'url')}
				>
					🌐 {i18n.t('editor.loadFromUrl')}
				</button>
				<button
					class="mode-btn"
					class:active={loadMode === 'resume'}
					onclick={() => (loadMode = 'resume')}
				>
					📂 {i18n.locale === 'zh' ? '恢复未完成翻译' : 'Resume Translation'}
				</button>
			</div>

			{#if loadMode === 'file'}
				<div
					class="upload-area"
					class:drag-active={dragActive}
					role="region"
					aria-label="File upload area"
					ondragover={(e) => {
						e.preventDefault();
						dragActive = true;
					}}
					ondragleave={() => (dragActive = false)}
					ondrop={handleFileDrop}
				>
					<div class="upload-icon">📁</div>
					<h2>{i18n.t('editor.uploadFile')}</h2>
					<p>{i18n.t('editor.uploadDescription')}</p>
					<input
						bind:this={fileInput}
						type="file"
						accept=".json"
						multiple
						onchange={handleFileSelect}
						style="display: none"
					/>
					<button class="btn-upload" onclick={() => fileInput?.click()}>
						{i18n.t('editor.chooseFile')}
					</button>
				</div>
			{:else if loadMode === 'url'}
				<div class="url-input-area">
					<h2>{i18n.t('editor.loadFromUrlTitle')}</h2>
					<p>{i18n.t('editor.loadFromUrlDescription')}</p>
					<div class="url-input-wrapper">
						<textarea
							placeholder="https://example.com/en.json&#10;https://example.com/fr.json&#10;https://example.com/es.json"
							bind:value={urlInput}
							class="url-textarea"
							rows="3"
						></textarea>
						<button
							class="btn-load-url"
							onclick={() => loadFromUrls(urlInput)}
							disabled={!urlInput || isLoading}
						>
							{isLoading ? i18n.t('editor.loading') : i18n.t('editor.load')}
						</button>
					</div>
				</div>
			{:else if loadMode === 'resume'}
				<div class="resume-area">
					<div class="resume-icon">📂</div>
					<h2>{i18n.locale === 'zh' ? '恢复未完成的翻译' : 'Resume Incomplete Translation'}</h2>
					<p>
						{i18n.locale === 'zh'
							? '上传之前下载的包含 _cache 元数据的翻译文件，继续未完成的翻译工作。'
							: 'Upload a previously downloaded translation file with _cache metadata to continue your work.'}
					</p>
					<input
						bind:this={resumeFileInput}
						type="file"
						accept=".json"
						onchange={handleResumeFile}
						style="display: none"
					/>
					<button class="btn-resume" onclick={() => resumeFileInput?.click()}>
						📂 {i18n.locale === 'zh' ? '选择文件' : 'Choose File'}
					</button>
					<div class="resume-hint">
						<p>
							💡 {i18n.locale === 'zh'
								? '提示：只有包含 _cache 元数据的文件才能恢复翻译进度。'
								: 'Tip: Only files with _cache metadata can restore translation progress.'}
						</p>
					</div>
				</div>
			{/if}

			<div class="format-hint">
				<h3>{i18n.t('editor.expectedFormat')}:</h3>
				{#if loadMode === 'resume'}
					<pre>{`{
  "_cache": {
    "version": "1.0",
    "progress": 45,
    "taskName": "English → 中文",
    "sourceLangs": [...],
    "targetLanguage": {...},
    "untranslatedKeys": [...]
  },
  "_meta": {
    "code": "zh",
    "name": "中文",
    "flag": "🇨🇳"
  },
  "welcome": "欢迎 {name}!",
  "nav": {
    "home": "主页",
    "about": ""  // 未翻译的字段
  }
}`}</pre>
				{:else}
					<pre>{`{
  "_meta": {
    "code": "en",
    "name": "English",
    "englishName": "English",
    "direction": "ltr",
    "flag": "🇬🇧"
  },
  "welcome": "Welcome {name}!",
  "nav": {
    "home": "Home",
    "about": "About"
  }
}`}</pre>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Editor Section -->
		<div class="editor-main">
			<!-- Sidebar -->
			<aside class="editor-sidebar">
				<div class="sidebar-section">
					<h3>📚 {i18n.t('editor.sourceLanguages')}</h3>
					<div class="source-tabs">
						{#each sourceLangs as source, index (source.id)}
							<div class="source-tab" class:active={activeSourceTab === index}>
								<button class="tab-btn" onclick={() => (activeSourceTab = index)}>
									<span class="tab-flag">{source.meta?.flag || '🌐'}</span>
									<span class="tab-name">{source.meta?.name || source.locale}</span>
									{#if source.source === 'url'}
										<span class="tab-badge">URL</span>
									{/if}
								</button>
								<button
									class="tab-remove"
									onclick={() => removeSourceLanguage(source.id)}
									title={i18n.t('editor.removeSource')}
								>
									×
								</button>
							</div>
						{/each}
						{#if sourceLangs.length < 3}
							<button
								class="add-source-btn"
								onclick={() => {
									// Show the add source UI
									showAddSource = true;
									// Reset the file input to allow adding more sources
									if (fileInput) {
										fileInput.value = '';
									}
									loadMode = 'file';
								}}
							>
								+ {i18n.t('editor.addSource')}
							</button>
						{/if}
					</div>
					<p class="source-info">
						{i18n.t('editor.sourcesLoaded', { count: sourceLangs.length })}
					</p>

					{#if sourceLangs.length > 1 && !validationResult.isComplete}
						<div class="validation-warning">
							<div class="warning-header">⚠️ Inconsistent Keys Detected</div>
							{#if validationResult.missingKeys.size > 0}
								<div class="warning-details">
									<strong>Missing keys:</strong>
									{#each [...validationResult.missingKeys.entries()] as [locale, keys] (locale)}
										<div class="warning-item">
											{locale}: {keys.length} missing
										</div>
									{/each}
								</div>
							{/if}
							{#if validationResult.extraKeys.size > 0}
								<div class="warning-details">
									<strong>Extra keys:</strong>
									{#each [...validationResult.extraKeys.entries()] as [locale, keys] (locale)}
										<div class="warning-item">
											{locale}: {keys.length} extra
										</div>
									{/each}
								</div>
							{/if}
							<button
								class="btn-show-details"
								onclick={() => (showValidationWarning = !showValidationWarning)}
							>
								{showValidationWarning ? 'Hide' : 'Show'} Details
							</button>
							{#if showValidationWarning}
								<div class="warning-key-list">
									{#if validationResult.missingKeys.size > 0}
										{#each [...validationResult.missingKeys.entries()] as [locale, keys] (locale)}
											<div class="key-section">
												<strong>{locale} missing:</strong>
												<ul>
													{#each keys.slice(0, 5) as key (key)}
														<li>{key}</li>
													{/each}
													{#if keys.length > 5}
														<li>... and {keys.length - 5} more</li>
													{/if}
												</ul>
											</div>
										{/each}
									{/if}
								</div>
							{/if}
						</div>
					{/if}
				</div>

				<div class="sidebar-section">
					<h3>📊 {i18n.t('editor.progress')}</h3>
					<div class="progress-bar">
						<div class="progress-fill" style="width: {progress}%"></div>
					</div>
					<p class="progress-text">
						{translatedKeys} / {totalKeys}
						{i18n.t('editor.translated')} ({progress.toFixed(1)}%)
					</p>
				</div>

				<div class="sidebar-section">
					<h3>🎯 {i18n.t('editor.targetLanguage')}</h3>
					<div class="language-input-wrapper">
						<input
							type="text"
							placeholder={i18n.t('editor.enterLanguage')}
							bind:value={targetLanguageInput}
							onkeydown={handleLanguageInputKeydown}
							onfocus={() => {
								if (languageSuggestions.length > 0) {
									showSuggestions = true;
								}
							}}
							onblur={() => {
								// Delay hiding to allow click on suggestion
								setTimeout(() => {
									showSuggestions = false;
								}, 200);
							}}
							class="input-field"
						/>
						{#if showSuggestions && languageSuggestions.length > 0}
							<div class="language-suggestions">
								{#each languageSuggestions as suggestion, index (suggestion.code)}
									<button
										class="suggestion-item"
										class:selected={index === selectedSuggestionIndex}
										onclick={() => selectLanguage(suggestion)}
										onmouseenter={() => (selectedSuggestionIndex = index)}
									>
										<span class="suggestion-flag">{suggestion.flag || '🌐'}</span>
										<div class="suggestion-info">
											<strong>{suggestion.name}</strong>
											<small>{suggestion.code} - {suggestion.englishName}</small>
										</div>
									</button>
								{/each}
							</div>
						{/if}
					</div>
					{#if detectedLanguageInfo}
						<div class="detected-lang">
							<span class="detected-flag">{detectedLanguageInfo.flag || '🌐'}</span>
							<div class="detected-info">
								<strong>{detectedLanguageInfo.name}</strong>
								<small>{detectedLanguageInfo.code} - {detectedLanguageInfo.englishName}</small>
							</div>
						</div>
					{:else if targetLanguageInput && !showSuggestions && languageSuggestions.length === 0}
						<div class="lang-not-found">
							⚠️ {i18n.t('editor.languageNotRecognized')}
						</div>
					{/if}
				</div>

				<div class="sidebar-section">
					<h3>🤖 {i18n.t('editor.aiAssistant')}</h3>
					<label class="ai-toggle">
						<input type="checkbox" bind:checked={aiEnabled} />
						<span>{i18n.t('editor.enableAI')}</span>
					</label>

					{#if aiEnabled}
						<input
							type="password"
							placeholder={i18n.t('editor.openaiKey')}
							bind:value={openaiApiKey}
							class="input-field"
						/>
						<button
							class="btn-ai"
							onclick={translateAll}
							disabled={isTranslating || !targetLocaleCode || sourceLangs.length === 0}
						>
							{isTranslating
								? translationStatus || i18n.t('editor.translating')
								: i18n.t('editor.translateAll')}
						</button>
						{#if isTranslating && translationTotal > 0}
							<div class="translation-progress">
								<div class="progress-bar">
									<div
										class="progress-fill"
										style="width: {(translationProgress / translationTotal) * 100}%"
									></div>
								</div>
								<span class="progress-text">
									{translationProgress} / {translationTotal}
								</span>
							</div>
						{/if}
					{/if}
				</div>

				<div class="sidebar-section">
					<h3>💾 {i18n.t('editor.export')}</h3>
					<div class="button-group">
						<button
							class="btn-save"
							onclick={saveCurrentTask}
							disabled={!targetLocaleCode || sourceLangs.length === 0}
						>
							💾 {i18n.locale === 'zh' ? '保存到浏览器' : 'Save to Browser'}
						</button>
						<button
							class="btn-download"
							onclick={downloadTranslations}
							disabled={!targetLocaleCode}
						>
							📥 {i18n.t('editor.download')}
							{expectedDownloadFileName || i18n.t('editor.translation') + '.json'}
						</button>
					</div>
					{#if saveStatus}
						<p class="save-status">{saveStatus}</p>
					{/if}
				</div>
			</aside>

			<!-- Translation Fields -->
			<main class="editor-content">
				<div class="content-header">
					<h2>{i18n.t('editor.translationFields')}</h2>
					<input
						type="text"
						placeholder="🔍 {i18n.t('editor.searchKeys')}"
						bind:value={searchQuery}
						class="search-input"
					/>
				</div>

				<div class="translation-list">
					{#each translationItems as item (item.pathString)}
						{#if item.type === 'field'}
							<div class="translation-field" class:has-missing={item.missingInSources.length > 0}>
								<div class="field-header">
									<span class="field-path">
										{item.pathString}
										{#if item.missingInSources.length > 0}
											<span
												class="missing-indicator"
												title="Missing in: {item.missingInSources.join(', ')}"
											>
												⚠️
											</span>
										{/if}
									</span>
									{#if aiEnabled}
										<button
											class="btn-ai-translate"
											onclick={async () => {
												const translated = item.sourceValue
													? await translateWithAI(
															item.sourceValue,
															sourceLangs[activeSourceTab].locale,
															item.pathString
														)
													: '';
												if (translated) {
													updateTranslation(item.path, translated);
												}
											}}
											disabled={isTranslating}
											title={i18n.t('editor.translateWithAI')}
										>
											🤖
										</button>
									{/if}
								</div>
								<div class="field-content">
									<div class="field-sources">
										{#each sourceLangs as source, idx (source.id)}
											<div class="field-source" class:active={idx === activeSourceTab}>
												<div class="field-label">
													{source.meta?.name || source.locale}
													{#if source.meta?.flag}
														{source.meta.flag}
													{/if}
												</div>
												<div class="source-text">
													{getNestedValue(source.translations, item.pathString) || ''}
												</div>
											</div>
										{/each}
									</div>
									<div class="field-target">
										<div class="field-label">
											{targetLocaleName || i18n.t('editor.target')} ({targetLocaleCode || 'new'})
										</div>
										<textarea
											value={item.targetValue}
											oninput={(e) => updateTranslation(item.path, e.currentTarget.value)}
											placeholder={i18n.t('editor.enterTranslation')}
											class="target-input"
											class:has-value={item.targetValue}
										></textarea>
									</div>
								</div>
							</div>
						{:else if item.type === 'section'}
							<div class="translation-section">
								<button class="section-header" onclick={() => toggleSection(item.pathString)}>
									<span class="section-icon">
										{expandedSections.has(item.pathString) ? '📂' : '📁'}
									</span>
									<span class="section-name">{item.key}</span>
									<span class="section-count">
										({countTranslatedFieldsInSection(item.children)}/{countFieldsInSection(
											item.children
										)}
										{i18n.t('editor.fields')})
										<span
											class="progress-badge"
											data-progress={calculateSectionProgress(item.children)}
										>
											{calculateSectionProgress(item.children)}%
										</span>
									</span>
								</button>
								{#if expandedSections.has(item.pathString)}
									<div class="section-content">
										{#each item.children as child (child.pathString)}
											{#if child.type === 'field'}
												<div class="translation-field nested">
													<div class="field-header">
														<span class="field-path">{child.key}</span>
														{#if aiEnabled}
															<button
																class="btn-ai-translate"
																onclick={async () => {
																	const translated = await translateWithAI(
																		child.sourceValue,
																		sourceLangs[activeSourceTab].locale,
																		child.pathString
																	);
																	if (translated) {
																		updateTranslation(child.path, translated);
																	}
																}}
																disabled={isTranslating}
																title={i18n.t('editor.translateWithAI')}
															>
																🤖
															</button>
														{/if}
													</div>
													<div class="field-content">
														<div class="field-sources compact">
															{#each sourceLangs as source (source.id)}
																<div class="source-text-compact">
																	<span class="source-flag">{source.meta?.flag || '🌐'}</span>
																	{getNestedValue(source.translations, child.pathString) || ''}
																</div>
															{/each}
														</div>
														<div class="field-target">
															<textarea
																value={child.targetValue}
																oninput={(e) =>
																	updateTranslation(child.path, e.currentTarget.value)}
																placeholder={i18n.t('editor.enterTranslation')}
																class="target-input"
																class:has-value={child.targetValue &&
																	!child.targetValue.startsWith('[TODO')}
															></textarea>
														</div>
													</div>
												</div>
											{:else if child.type === 'section'}
												<!-- Nested Section -->
												<div class="translation-section nested">
													<button
														class="section-header"
														onclick={() => toggleSection(child.pathString)}
													>
														<span class="section-icon">
															{expandedSections.has(child.pathString) ? '📂' : '📁'}
														</span>
														<span class="section-name">{child.key}</span>
														<span class="section-count">
															({countTranslatedFieldsInSection(
																child.children
															)}/{countFieldsInSection(child.children)}
															{i18n.t('editor.fields')})
															<span
																class="progress-badge"
																data-progress={calculateSectionProgress(child.children)}
															>
																{calculateSectionProgress(child.children)}%
															</span>
														</span>
													</button>
													{#if expandedSections.has(child.pathString)}
														<div class="section-content">
															{#each child.children as subChild (subChild.pathString)}
																{#if subChild.type === 'field'}
																	<div class="translation-field nested">
																		<div class="field-header">
																			<span class="field-path">{subChild.key}</span>
																			{#if aiEnabled}
																				<button
																					class="btn-ai-translate"
																					onclick={async () => {
																						const translated = await translateWithAI(
																							subChild.sourceValue,
																							sourceLangs[activeSourceTab].locale,
																							subChild.pathString
																						);
																						if (translated) {
																							updateTranslation(subChild.path, translated);
																						}
																					}}
																					disabled={isTranslating}
																					title={i18n.t('editor.translateWithAI')}
																				>
																					🤖
																				</button>
																			{/if}
																		</div>
																		<div class="field-content">
																			<div class="field-sources compact">
																				{#each sourceLangs as source (source.id)}
																					<div class="source-text-compact">
																						<span class="source-flag"
																							>{source.meta?.flag || '🌐'}</span
																						>
																						{getNestedValue(
																							source.translations,
																							subChild.pathString
																						) || ''}
																					</div>
																				{/each}
																			</div>
																			<div class="field-target">
																				<textarea
																					value={subChild.targetValue}
																					oninput={(e) =>
																						updateTranslation(subChild.path, e.currentTarget.value)}
																					placeholder={i18n.t('editor.enterTranslation')}
																					class="target-input"
																					class:has-value={subChild.targetValue &&
																						!subChild.targetValue.startsWith('[TODO')}
																				></textarea>
																			</div>
																		</div>
																	</div>
																{/if}
															{/each}
														</div>
													{/if}
												</div>
											{/if}
										{/each}
									</div>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			</main>
		</div>
	{/if}
</div>

<style>
	.editor-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	/* Header */
	.editor-header {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		padding: 1.5rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.header-content h1 {
		color: white;
		margin: 0;
		font-size: 2rem;
	}

	.header-content p {
		color: rgba(255, 255, 255, 0.9);
		margin: 0.5rem 0 0 0;
	}

	.btn-back {
		background: white;
		color: #667eea;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.3s;
	}

	.btn-back:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
	}

	.btn-history {
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-history:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
	}

	.task-badge {
		display: inline-block;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 500;
		margin-top: 0.5rem;
		animation: slideIn 0.5s;
	}

	.task-badge.restored {
		background: rgba(34, 197, 94, 0.2);
		color: #10b981;
		border: 1px solid rgba(34, 197, 94, 0.3);
	}

	.task-badge.imported {
		background: rgba(59, 130, 246, 0.2);
		color: #3b82f6;
		border: 1px solid rgba(59, 130, 246, 0.3);
	}

	.auto-save-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(255, 255, 255, 0.1);
		padding: 0.5rem 1rem;
		border-radius: 8px;
		color: white;
		font-size: 0.875rem;
	}

	.save-time {
		font-weight: 600;
		color: #10b981;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Load Mode Selector */
	.load-mode-selector {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.mode-btn {
		padding: 1rem 2rem;
		background: white;
		border: 2px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s;
	}

	.mode-btn.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-color: transparent;
	}

	/* Upload Section */
	.upload-section {
		max-width: 800px;
		margin: 4rem auto;
		padding: 0 2rem;
	}

	.add-source-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.add-source-header h2 {
		color: white;
		margin: 0;
	}

	.btn-cancel {
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-cancel:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.upload-area,
	.resume-area {
		background: white;
		border-radius: 16px;
		padding: 4rem 2rem;
		text-align: center;
		/* border: 3px solid #ddd; */
		border: none;
		transition: all 0.3s;
		cursor: pointer;
	}

	.resume-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.btn-resume {
		padding: 0.75rem 2rem;
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
		margin-top: 1rem;
	}

	.btn-resume:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
	}

	.resume-hint {
		margin-top: 2rem;
		padding: 1rem;
		background: rgba(102, 126, 234, 0.1);
		border-radius: 8px;
	}

	.resume-hint p {
		margin: 0;
		color: #4c1d95;
		font-size: 0.875rem;
	}

	.upload-area.drag-active {
		border-color: #667eea;
		background: #f0f4ff;
	}

	.upload-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.upload-area h2 {
		color: #333;
		margin-bottom: 0.5rem;
	}

	.upload-area p {
		color: #666;
		margin-bottom: 2rem;
	}

	.btn-upload {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-upload:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
	}

	/* URL Input Area */
	.url-input-area {
		background: white;
		border-radius: 16px;
		padding: 3rem 2rem;
		text-align: center;
	}

	.url-input-area h2 {
		color: #333;
		margin-bottom: 0.5rem;
	}

	.url-input-area p {
		color: #666;
		margin-bottom: 2rem;
	}

	.url-input-wrapper {
		max-width: 600px;
		margin: 0 auto;
	}

	.url-textarea {
		width: 100%;
		padding: 0.875rem;
		border: 2px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		font-family: inherit;
		resize: vertical;
		margin-bottom: 1rem;
	}

	.url-textarea:focus {
		outline: none;
		border-color: #667eea;
	}

	.btn-load-url {
		padding: 0.875rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-load-url:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
	}

	.btn-load-url:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.format-hint {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		margin-top: 2rem;
	}

	.format-hint h3 {
		color: #333;
		margin-bottom: 1rem;
	}

	.format-hint pre {
		background: #f5f5f5;
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
		font-size: 0.875rem;
	}

	/* Editor Main */
	.editor-main {
		display: grid;
		grid-template-columns: 380px 1fr;
		height: calc(100vh - 100px);
	}

	/* Sidebar */
	.editor-sidebar {
		background: rgba(255, 255, 255, 0.95);
		padding: 1.5rem;
		overflow-y: auto;
		border-right: 1px solid #e0e0e0;
	}

	.sidebar-section {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #e0e0e0;
	}

	.sidebar-section:last-child {
		border-bottom: none;
	}

	.sidebar-section h3 {
		color: #333;
		margin-bottom: 1rem;
		font-size: 1.1rem;
	}

	/* Source Tabs */
	.source-tabs {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.source-tab {
		display: flex;
		gap: 0.25rem;
	}

	.tab-btn {
		flex: 1;
		padding: 0.75rem;
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.source-tab.active .tab-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-color: transparent;
	}

	.tab-flag {
		font-size: 1.2rem;
	}

	.tab-name {
		flex: 1;
		font-weight: 500;
	}

	.tab-badge {
		background: rgba(0, 0, 0, 0.1);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.75rem;
	}

	.tab-remove {
		width: 32px;
		height: 32px;
		background: #ff4444;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab-remove:hover {
		background: #cc0000;
	}

	.add-source-btn {
		padding: 0.75rem;
		background: white;
		border: 2px dashed #667eea;
		color: #667eea;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-source-btn:hover {
		background: #f0f4ff;
	}

	.source-info {
		color: #666;
		font-size: 0.875rem;
		margin-top: 0.5rem;
		text-align: center;
	}

	/* Validation Warning */
	.validation-warning {
		background: #fff3cd;
		border: 1px solid #ffc107;
		border-radius: 8px;
		padding: 0.75rem;
		margin-top: 1rem;
		font-size: 0.875rem;
	}

	.warning-header {
		font-weight: 600;
		color: #856404;
		margin-bottom: 0.5rem;
	}

	.warning-details {
		color: #856404;
		margin-bottom: 0.5rem;
	}

	.warning-item {
		margin-left: 1rem;
		font-size: 0.8rem;
	}

	.btn-show-details {
		background: transparent;
		border: 1px solid #ffc107;
		color: #856404;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		cursor: pointer;
		margin-top: 0.5rem;
		transition: all 0.3s;
	}

	.btn-show-details:hover {
		background: #ffc107;
		color: white;
	}

	.warning-key-list {
		margin-top: 0.75rem;
		max-height: 200px;
		overflow-y: auto;
		background: rgba(255, 255, 255, 0.5);
		padding: 0.5rem;
		border-radius: 4px;
	}

	.key-section {
		margin-bottom: 0.75rem;
	}

	.key-section strong {
		color: #856404;
		display: block;
		margin-bottom: 0.25rem;
	}

	.key-section ul {
		margin: 0;
		padding-left: 1.5rem;
		color: #666;
		font-size: 0.75rem;
	}

	.key-section li {
		margin: 0.125rem 0;
	}

	/* Language Input */
	.language-input-wrapper {
		position: relative;
	}

	.language-suggestions {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		margin-top: 0.25rem;
		max-height: 300px;
		overflow-y: auto;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}

	.suggestion-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem;
		background: none;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
		text-align: left;
	}

	.suggestion-item:hover,
	.suggestion-item.selected {
		background: #f0f4ff;
	}

	.suggestion-flag {
		font-size: 1.5rem;
		width: 2rem;
		text-align: center;
	}

	.suggestion-info {
		flex: 1;
		min-width: 0;
	}

	.suggestion-info strong {
		display: block;
		color: #333;
		font-size: 0.875rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.suggestion-info small {
		display: block;
		color: #666;
		font-size: 0.75rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Detected Language */
	.detected-lang {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: #f0f4ff;
		border: 1px solid #667eea;
		border-radius: 8px;
		margin-top: 0.5rem;
	}

	.detected-flag {
		font-size: 2rem;
	}

	.detected-info {
		flex: 1;
	}

	.detected-info strong {
		display: block;
		color: #333;
	}

	.detected-info small {
		color: #666;
	}

	.lang-not-found {
		padding: 0.75rem;
		background: #fff3cd;
		border: 1px solid #ffc107;
		border-radius: 8px;
		margin-top: 0.5rem;
		color: #856404;
		font-size: 0.875rem;
	}

	.progress-bar {
		background: #e0e0e0;
		height: 20px;
		border-radius: 10px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.progress-fill {
		background: linear-gradient(90deg, #667eea, #764ba2);
		height: 100%;
		transition: width 0.3s;
	}

	.progress-text {
		color: #666;
		font-size: 0.875rem;
		text-align: center;
	}

	.input-field {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
	}

	.input-field:focus {
		outline: none;
		border-color: #667eea;
	}

	.ai-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
		cursor: pointer;
	}

	.ai-toggle input {
		width: 20px;
		height: 20px;
		cursor: pointer;
	}

	.button-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.btn-ai,
	.btn-save,
	.btn-download {
		width: 100%;
		padding: 0.875rem;
		border: none;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-ai {
		background: linear-gradient(135deg, #ffd700, #ff6b6b);
		color: white;
	}

	/* Translation Progress */
	.translation-progress {
		margin-top: 1rem;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
	}

	.translation-progress .progress-bar {
		width: 100%;
		height: 8px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.translation-progress .progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #ffd700, #ff6b6b);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.translation-progress .progress-text {
		display: block;
		text-align: center;
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.btn-save {
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
	}

	.btn-download {
		background: linear-gradient(135deg, #10b981, #059669);
		color: white;
	}

	.btn-ai:hover:not(:disabled),
	.btn-save:hover:not(:disabled),
	.btn-download:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
	}

	.btn-ai:disabled,
	.btn-save:disabled,
	.btn-download:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.save-status {
		margin-top: 0.5rem;
		color: #28a745;
		font-size: 0.875rem;
		text-align: center;
	}

	/* Editor Content */
	.editor-content {
		background: white;
		overflow-y: auto;
	}

	.content-header {
		position: sticky;
		top: 0;
		background: white;
		padding: 1.5rem;
		border-bottom: 1px solid #e0e0e0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: 10;
	}

	.content-header h2 {
		color: #333;
		margin: 0;
	}

	.search-input {
		width: 300px;
		padding: 0.625rem 1rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 0.875rem;
	}

	.search-input:focus {
		outline: none;
		border-color: #667eea;
	}

	/* Translation List */
	.translation-list {
		padding: 1.5rem;
	}

	.translation-field {
		background: #f8f9fa;
		border: 1px solid #e0e0e0;
		border-radius: 12px;
		padding: 1.25rem;
		margin-bottom: 1rem;
	}

	.translation-field.has-missing {
		border-color: #ffc107;
		background: #fffdf5;
	}

	.translation-field.nested {
		background: white;
		margin-left: 1.5rem;
	}

	.missing-indicator {
		display: inline-block;
		margin-left: 0.5rem;
		font-size: 0.875rem;
		cursor: help;
	}

	.field-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.field-path {
		color: #667eea;
		font-family: monospace;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.btn-ai-translate {
		background: linear-gradient(135deg, #ffd700, #ff6b6b);
		border: none;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s;
		font-size: 1.25rem;
	}

	.btn-ai-translate:hover:not(:disabled) {
		transform: scale(1.1);
	}

	.btn-ai-translate:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.field-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field-sources {
		display: flex;
		gap: 1rem;
	}

	.field-source {
		flex: 1;
		display: flex;
		flex-direction: column;
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.field-source.active {
		opacity: 1;
	}

	.field-source .field-label,
	.field-target .field-label {
		color: #666;
		font-size: 0.75rem;
		text-transform: uppercase;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	.source-text {
		background: white;
		padding: 0.75rem;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		min-height: 60px;
		color: #333;
		line-height: 1.5;
	}

	.field-sources.compact {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.source-text-compact {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #666;
	}

	.source-flag {
		font-size: 1rem;
	}

	.field-target {
		display: flex;
		flex-direction: column;
	}

	.target-input {
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		min-height: 80px;
		font-family: inherit;
		font-size: 0.875rem;
		resize: vertical;
		transition: all 0.3s;
	}

	.target-input:focus {
		outline: none;
		border-color: #667eea;
	}

	.target-input.has-value {
		background: #f0fff4;
		border-color: #28a745;
	}

	/* Translation Section */
	.translation-section {
		margin-bottom: 1.5rem;
	}

	.translation-section.nested {
		margin-left: 1.5rem;
		margin-bottom: 1rem;
		padding-left: 1rem;
		border-left: 2px solid #e5e7eb;
	}

	.section-header {
		width: 100%;
		padding: 1rem 1.25rem;
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
		border: 1px solid rgba(102, 126, 234, 0.3);
		border-radius: 12px;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		transition: all 0.3s;
		color: #333;
		font-size: 1rem;
		font-weight: 500;
		text-align: left;
	}

	.section-header:hover {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
	}

	.section-icon {
		font-size: 1.25rem;
	}

	.section-name {
		flex: 1;
	}

	.section-count {
		color: #666;
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.progress-badge {
		padding: 0.125rem 0.5rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
		color: #374151; /* Dark gray text for default state */
	}

	.progress-badge[data-progress='100'] {
		background: linear-gradient(135deg, #d1fae5, #a7f3d0);
		color: #065f46;
	}

	.progress-badge[data-progress^='9']:not([data-progress='9']) {
		background: linear-gradient(135deg, #dbeafe, #bfdbfe);
		color: #1e40af;
	}

	.progress-badge[data-progress^='8'],
	.progress-badge[data-progress^='7'],
	.progress-badge[data-progress^='6'],
	.progress-badge[data-progress^='5'] {
		background: linear-gradient(135deg, #fef3c7, #fde68a);
		color: #78350f; /* Dark amber for mid-progress */
	}

	.progress-badge[data-progress^='4'],
	.progress-badge[data-progress^='3'],
	.progress-badge[data-progress^='2'],
	.progress-badge[data-progress^='1'] {
		background: linear-gradient(135deg, #fed7aa, #fdba74);
		color: #7c2d12; /* Dark orange for low progress */
	}

	.progress-badge[data-progress^='0'],
	.progress-badge[data-progress='0'] {
		background: linear-gradient(135deg, #fee2e2, #fecaca);
		color: #991b1b;
	}

	.section-content {
		margin-top: 1rem;
		padding-left: 1rem;
		border-left: 3px solid rgba(102, 126, 234, 0.2);
	}

	/* Responsive */
	@media (max-width: 1024px) {
		.editor-main {
			grid-template-columns: 1fr;
		}

		.editor-sidebar {
			position: fixed;
			left: -380px;
			top: 0;
			height: 100vh;
			z-index: 100;
			transition: left 0.3s;
		}

		.field-sources {
			flex-direction: column;
		}
	}
</style>
