/**
 * This file enhances the default I18nInstance interface with type safety
 * Import your generated types and augment the interface here
 */

// Import generated types - these should exist after running type generation
import type { I18nPath } from '../types/app-i18n-generated';

// Augment the default I18nInstance to make t() type-safe
declare module './domain/models/types' {
	interface I18nInstance {
		/**
		 * Type-safe translation function with autocomplete
		 * @param key - Translation key (with autocomplete when types are generated!)
		 * @param params - Parameters for interpolation
		 */
		t(key: I18nPath, params?: Record<string, any>): string;
	}
}
