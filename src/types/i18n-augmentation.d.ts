/**
 * Module augmentation for type-safe i18n
 * Auto-generated - DO NOT EDIT MANUALLY
 *
 * Note: For better type safety, consider using createTypedI18n instead:
 * import { createTypedI18n } from '@shelchin/svelte-i18n';
 * export const { getI18n, setupI18n } = createTypedI18n<I18nPath>();
 */

import type { I18nPath } from './app-i18n-generated';
import type {
	I18nConfig,
	LanguageMeta,
	InterpolationParams,
	TranslationSchema,
	TranslationFile
} from '$lib';

declare module '$lib' {
	export interface I18nInstance {
		locale: string;
		locales: string[];
		isLoading: boolean;
		errors: Record<string, string[]>;
		meta: Record<string, LanguageMeta>;
		t(key: I18nPath, params?: InterpolationParams): string;
		setLocale(locale: string): Promise<void>;
		loadLanguage(
			locale: string,
			source?: string | TranslationSchema | TranslationFile
		): Promise<void>;
		validateTranslations(locale: string, schema?: TranslationSchema): boolean;
		formatDate(date: Date | number | string, preset?: string): string;
		formatTime(date: Date | number | string, preset?: string): string;
		formatNumber(num: number, preset?: string): string;
		formatCurrency(num: number, currency?: string): string;
		formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string;
		formatList(items: string[], type?: 'conjunction' | 'disjunction' | 'unit'): string;
		detectBrowserLanguage(): string | null;
		getNamespace(): string | undefined;
		canShowValidationPopup(): boolean;
		setActiveValidationPopup(active: boolean): void;
		clientLoad(): Promise<void>;
	}

	export function getI18n(): I18nInstance;
	export function setupI18n(config: I18nConfig): I18nInstance;
}

export {};
