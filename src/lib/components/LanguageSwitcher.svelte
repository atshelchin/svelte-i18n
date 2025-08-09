<script lang="ts">
	import { getI18n } from '../store.svelte.js';

	interface Props {
		class?: string;
		showFlags?: boolean;
		showLabel?: boolean;
		localeNames?: Record<string, string>;
		localeFlags?: Record<string, string>;
	}

	let {
		class: className = '',
		showFlags = false,
		showLabel = true,
		localeNames: customLocaleNames,
		localeFlags: customLocaleFlags
	}: Props = $props();

	const i18n = getI18n();

	const currentLocale = $derived(i18n.locale);
	const availableLocales = $derived(i18n.locales);
	const languageMeta = $derived(i18n.meta);

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
