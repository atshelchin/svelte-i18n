/**
 * Application i18n configuration and translations
 * This file handles all translation imports and i18n setup
 *
 * Using unified API with type safety for translation keys
 */
import type { I18nPath } from '../types/app-i18n-generated.js';
export declare const i18n: import("$lib/typed-unified.js").TypedUnifiedI18nInstance<I18nPath>;
export declare function getI18n(): import("$lib/typed-unified.js").TypedUnifiedI18nInstance<I18nPath>;
export default i18n;
