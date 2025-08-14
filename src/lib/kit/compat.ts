/**
 * Backward compatibility exports
 * These are deprecated functions that delegate to new implementations
 */

import { loadI18nSSR } from './ssr-load.js';
import { loadI18nUniversal } from './universal-load.js';
import { setupI18nClient } from './client-init.js';
import type { I18nInstance } from '$lib/core/types.js';
import type { Cookies } from '@sveltejs/kit';

/**
 * @deprecated Use loadI18nSSR from './ssr-load.js' instead
 */
export async function handleSSR<T = I18nInstance>(
	i18n: T & Pick<I18nInstance, 'locale' | 'locales' | 'setLocale'>,
	cookies: Cookies,
	options?: any
) {
	return loadI18nSSR(i18n, cookies, undefined, options);
}

/**
 * @deprecated Use setupI18nClient from './client-init.js' instead
 */
export function handleClient<T = I18nInstance>(
	i18n: T & Pick<I18nInstance, 'locale' | 'locales' | 'setLocale' | 'loadLanguageSync'>,
	data: any,
	options?: any
) {
	return setupI18nClient(i18n, data, options);
}

/**
 * @deprecated Use loadI18nUniversal from './universal-load.js' instead
 */
export async function handleUniversal<T = I18nInstance>(
	i18n: T & Pick<I18nInstance, 'locale' | 'locales' | 'setLocale'>,
	data: any,
	browser: boolean,
	options?: any
) {
	return loadI18nUniversal(i18n, data, undefined, options);
}
