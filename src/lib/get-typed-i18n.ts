/**
 * This file provides the typed version of getI18n and setupI18n
 * It directly imports the generated types from the app
 */

import {
	getI18n as getOriginal,
	setupI18n as setupOriginal
} from './application/stores/store.svelte.js';
import type { I18nConfig, I18nInstance as BaseI18nInstance } from './domain/models/types.js';
import type { I18nPath } from '../types/app-i18n-generated.js';

// Type-safe I18nInstance
export interface I18nInstance extends Omit<BaseI18nInstance, 't'> {
	t(key: I18nPath, params?: Record<string, any>): string;
}

export function getI18n(): I18nInstance {
	return getOriginal() as I18nInstance;
}

export function setupI18n(config: I18nConfig): I18nInstance {
	return setupOriginal(config) as I18nInstance;
}
