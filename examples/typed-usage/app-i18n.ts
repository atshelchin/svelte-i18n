/**
 * Application-specific type-safe i18n instance
 * This file should be created in the application, not in the library
 *
 * This is an EXAMPLE showing how applications should use the library
 */

import { createTypedI18n } from '$lib/typed-export.js';
import type { I18nPath } from '../types/app-i18n-generated.js';

// Create typed versions with app-specific types
export const { getI18n, setupI18n } = createTypedI18n<I18nPath>();
