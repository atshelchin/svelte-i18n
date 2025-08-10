/**
 * Type definitions for svelte-i18n library
 * These will be overridden by app-specific types
 */

import type { I18nConfig } from './domain/models/types.js';

export * from './index.js';

// This interface will be merged with app-specific types
export interface I18nInstance {
	locale: string;
	locales: string[];
	isLoading: boolean;
	errors: Record<string, string[]>;
	meta: Record<string, any>;
	t(key: string, params?: Record<string, any>): string;
	setLocale(locale: string): Promise<void>;
	loadLanguage(locale: string, source?: string | any | any): Promise<void>;
	validateTranslations(locale: string, schema?: any): boolean;
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

export declare function getI18n(): I18nInstance;
export declare function setupI18n(config: I18nConfig): I18nInstance;
