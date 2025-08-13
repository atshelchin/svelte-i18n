/**
 * Application-specific type-safe i18n instance
 * This file should be created in the application, not in the library
 *
 * This is an EXAMPLE showing how applications should use the library
 */

import { createTypedUnifiedI18n, type UnifiedI18nConfig } from '$lib/index.js';
import type { I18nPath } from '../types/app-i18n-generated.js';

// Example configuration
const config: UnifiedI18nConfig = {
	namespace: 'app',
	isMain: true,
	defaultLocale: 'en',
	fallbackLocale: 'en'
};

// Create typed i18n instance with app-specific types
export const i18n = createTypedUnifiedI18n<I18nPath>(config);
