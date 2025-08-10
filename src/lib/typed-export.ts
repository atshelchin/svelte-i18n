/**
 * Factory for creating type-safe i18n instances
 * External applications should use this to get compile-time type checking
 */

import {
	getI18n as getOriginal,
	setupI18n as setupOriginal
} from './application/stores/store.svelte.js';
import type { I18nConfig, I18nInstance } from './domain/models/types.js';

/**
 * Typed i18n instance with application-specific translation keys
 */
export interface TypedI18nInstance<TPath extends string = string> extends Omit<I18nInstance, 't'> {
	t(key: TPath, params?: Record<string, any>): string;
}

/**
 * Create typed i18n functions with application-specific types
 *
 * Usage in external applications:
 *
 * 1. First, generate types from your translations:
 * ```bash
 * npx @shelchin/svelte-i18n generate-types
 * ```
 *
 * 2. Create a typed i18n module in your app (e.g., src/lib/i18n.ts):
 * ```typescript
 * import { createTypedI18n } from '@shelchin/svelte-i18n';
 * import type { I18nPath } from './types/i18n-generated';
 *
 * export const { getI18n, setupI18n } = createTypedI18n<I18nPath>();
 * ```
 *
 * 3. Use the typed functions in your components:
 * ```svelte
 * <script>
 *   import { getI18n } from '$lib/i18n';
 *   const i18n = getI18n();
 *   // Now i18n.t() has full type safety!
 * </script>
 * ```
 */
export function createTypedI18n<TPath extends string = string>() {
	return {
		getI18n(): TypedI18nInstance<TPath> {
			return getOriginal() as TypedI18nInstance<TPath>;
		},
		setupI18n(config: I18nConfig): TypedI18nInstance<TPath> {
			return setupOriginal(config) as TypedI18nInstance<TPath>;
		}
	};
}
