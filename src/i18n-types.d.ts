/**
 * Global type augmentation for i18n type safety
 * This file makes the default getI18n from $lib type-safe
 */

import type { I18nPath } from './types/app-i18n-generated';

declare module '@shelchin/svelte-i18n' {
	interface I18nInstance {
		/**
		 * Type-safe translation function with autocomplete
		 */
		t(key: I18nPath, params?: Record<string, any>): string;
	}
}

declare module '$lib' {
	import type { I18nConfig } from '$lib/domain/models/types';

	interface I18nInstance {
		locale: string;
		locales: string[];
		isLoading: boolean;
		errors: Record<string, string[]>;
		meta: Record<string, any>;

		/**
		 * Type-safe translation function with autocomplete
		 */
		t(key: I18nPath, params?: Record<string, any>): string;

		setLocale: (locale: string) => Promise<void>;
		loadLanguage: (locale: string, source?: any) => Promise<void>;
		validateTranslations: (locale: string, schema?: any) => boolean;
		formatDate: (date: Date | number | string, preset?: string) => string;
		formatTime: (date: Date | number | string, preset?: string) => string;
		formatNumber: (num: number, preset?: string) => string;
		formatCurrency: (num: number, currency?: string) => string;
		formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
		formatList: (items: string[], type?: 'conjunction' | 'disjunction' | 'unit') => string;
		detectBrowserLanguage: () => string | null;
		getNamespace: () => string | undefined;
		canShowValidationPopup: () => boolean;
		setActiveValidationPopup: (active: boolean) => void;
		clientLoad: () => Promise<void>;
	}

	export function getI18n(): I18nInstance;
	export function setupI18n(config: I18nConfig): I18nInstance;
}

export {};
