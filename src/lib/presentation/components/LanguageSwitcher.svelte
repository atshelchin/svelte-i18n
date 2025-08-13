<script lang="ts">
	import { getI18nInstance } from '../../unified.js';
	import { getAppSupportedLanguages } from '../../infrastructure/loaders/app-languages.js';
	import { getEffectiveLibI18n } from '../../translations/i18n.js';
	import type { I18nInstance } from '../../domain/models/types.js';
	import { onMount } from 'svelte';

	interface Props {
		class?: string;
		showFlags?: boolean;
		showLabel?: boolean;
		localeNames?: Record<string, string>;
		localeFlags?: Record<string, string>;
		i18n?: I18nInstance; // Optional: allow passing a specific i18n instance
	}

	let {
		class: className = '',
		showFlags = false,
		showLabel = true,
		localeNames: customLocaleNames,
		localeFlags: customLocaleFlags,
		i18n: propI18n
	}: Props = $props();

	// Use provided i18n or try to get the main app instance, fallback to libI18n
	let appI18n: I18nInstance | undefined;
	try {
		appI18n = getI18nInstance('app');
		console.log('✅ Found app i18n instance');
	} catch (e) {
		console.log('❌ Could not find app i18n instance:', e instanceof Error ? e.message : String(e));
	}

	const i18n = $derived(propI18n || appI18n || getEffectiveLibI18n());
	const currentLocale = $derived(i18n.locale);

	let availableLocales = $state<string[]>([]);
	const languageMeta = $derived(i18n.meta);

	// On mount, get all app-supported languages (including those from index.json)
	onMount(async () => {
		// Initialize with current i18n locales
		if (availableLocales.length === 0) {
			availableLocales = i18n.locales;
		}

		console.log('🔍 LanguageSwitcher checking languages:');
		console.log('  Current i18n.locales:', i18n.locales);
		console.log(
			'  i18n namespace:',
			(i18n as any).namespace || (i18n as any).config?.namespace || 'unknown'
		);

		// Then load all supported languages (built-in + auto-discovered)
		const allSupportedLanguages = await getAppSupportedLanguages(i18n as any);
		console.log('  All supported languages:', allSupportedLanguages);
		availableLocales = allSupportedLanguages;
	});

	// ISO 639-1 language codes with native names as defaults
	const defaultLocaleNames: Record<string, string> = {
		en: 'English',
		zh: '中文',
		'zh-CN': '简体中文',
		'zh-TW': '繁體中文',
		es: 'Español',
		fr: 'Français',
		de: 'Deutsch',
		ja: '日本語',
		ko: '한국어',
		ru: 'Русский',
		ar: 'العربية',
		pt: 'Português',
		'pt-BR': 'Português (Brasil)',
		it: 'Italiano',
		nl: 'Nederlands',
		pl: 'Polski',
		tr: 'Türkçe',
		vi: 'Tiếng Việt',
		th: 'ไทย',
		id: 'Bahasa Indonesia',
		hi: 'हिन्दी',
		he: 'עברית',
		sv: 'Svenska',
		no: 'Norsk',
		da: 'Dansk',
		fi: 'Suomi',
		cs: 'Čeština',
		hu: 'Magyar',
		el: 'Ελληνικά',
		ro: 'Română',
		uk: 'Українська',
		bg: 'Български'
	};

	// Use Intl.DisplayNames for dynamic locale names if available
	const getLocaleName = (locale: string): string => {
		// First, check if there's metadata for this language
		if (languageMeta[locale]?.name) {
			return languageMeta[locale].name;
		}

		if (customLocaleNames?.[locale]) {
			return customLocaleNames[locale];
		}

		if (defaultLocaleNames[locale]) {
			return defaultLocaleNames[locale];
		}

		// Fallback to browser's Intl API for unknown locales
		try {
			const displayNames = new Intl.DisplayNames([locale], { type: 'language' });
			return displayNames.of(locale) || locale;
		} catch {
			return locale.toUpperCase();
		}
	};

	const localeNames = $derived(
		availableLocales.reduce(
			(acc, locale) => {
				acc[locale] = getLocaleName(locale);
				return acc;
			},
			{} as Record<string, string>
		)
	);

	const localeFlags = customLocaleFlags || {};

	function handleChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		i18n.setLocale(select.value);
	}
</script>

<select class={className} value={currentLocale} onchange={handleChange} disabled={i18n.isLoading}>
	{#each availableLocales as locale (locale)}
		<option value={locale}>
			{#if showFlags && localeFlags[locale]}
				{localeFlags[locale]}
			{/if}
			{#if showLabel}
				{localeNames[locale] || locale}
			{/if}
		</option>
	{/each}
</select>

<style>
	select {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		background: white;
		cursor: pointer;
		font-size: 1rem;
	}

	select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	select:focus {
		outline: none;
		border-color: #007bff;
		box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
	}
</style>
