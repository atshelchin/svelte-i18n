/**
 * Ambient type declarations for i18n type safety
 * This file should be imported by the application after generating types
 */

import type { I18nPath } from './types/app-i18n-generated';

// Override the global module augmentation
declare module '$lib' {
	interface I18nInstance {
		t(key: I18nPath, params?: Record<string, unknown>): string;
	}
}

declare module '$lib/index' {
	interface I18nInstance {
		t(key: I18nPath, params?: Record<string, unknown>): string;
	}
}
