/**
 * Re-export i18n from translations directory
 * This file exists for backward compatibility and clean imports
 */
export { i18n, default } from '../translations/i18n.js';
export { initTypedI18n as initI18n } from '$lib/unified.js';
