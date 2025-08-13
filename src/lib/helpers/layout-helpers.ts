/**
 * Helper functions for SvelteKit layout files
 * Simplifies i18n setup in +layout.server.ts, +layout.ts, and +layout.svelte
 */

import type { Cookies } from '@sveltejs/kit';
import type { I18nInstance } from '../domain/models/types.js';

// ============================================
// Server-side helpers (+layout.server.ts)
// ============================================

/**
 * Server-side load function for i18n
 * Use this in your +layout.server.ts
 * 
 * @example
 * ```typescript
 * // +layout.server.ts
 * import { i18nServerLoad } from '@shelchin/svelte-i18n';
 * import { i18n } from '../translations/i18n';
 * 
 * export const load = ({ cookies }) => i18nServerLoad(i18n, cookies);
 * ```
 */
export async function i18nServerLoad(
	i18n: I18nInstance,
	cookies: Cookies,
	options?: {
		cookieName?: string;
		defaultLocale?: string;
	}
) {
	const cookieName = options?.cookieName || 'i18n-locale';
	const defaultLocale = options?.defaultLocale || i18n.locale || 'en';
	
	// Get locale from cookie
	const cookieLocale = cookies.get(cookieName);
	const locale = cookieLocale || defaultLocale;
	
	// Set locale if available
	if (i18n.locales.includes(locale)) {
		await i18n.setLocale(locale);
	}
	
	// For SSR, try to load the locale if needed
	if (cookieLocale && !i18n.locales.includes(cookieLocale)) {
		// Try to load from server if available
		if (i18n.serverLoad) {
			await i18n.serverLoad(cookies);
		}
	}
	
	return {
		locale,
		locales: i18n.locales,
		i18nReady: true
	};
}

// ============================================
// Universal load helpers (+layout.ts)
// ============================================

/**
 * Universal load function for i18n (works on both server and client)
 * Use this in your +layout.ts
 * 
 * @example
 * ```typescript
 * // +layout.ts
 * import { i18nUniversalLoad } from '@shelchin/svelte-i18n';
 * import { i18n } from '../translations/i18n';
 * import { browser } from '$app/environment';
 * 
 * export const load = ({ data }) => i18nUniversalLoad(i18n, data, browser);
 * ```
 */
export async function i18nUniversalLoad(
	i18n: I18nInstance,
	data: any,
	browser: boolean,
	options?: {
		storageKey?: string;
		defaultLocale?: string;
	}
) {
	const storageKey = options?.storageKey || 'i18n-locale';
	const defaultLocale = options?.defaultLocale || data?.locale || i18n.locale || 'en';
	
	let locale = defaultLocale;
	
	// In browser, check localStorage
	if (browser && typeof localStorage !== 'undefined') {
		const savedLocale = localStorage.getItem(storageKey);
		if (savedLocale && i18n.locales.includes(savedLocale)) {
			locale = savedLocale;
		}
		
		// Ensure locale is set
		if (locale !== i18n.locale) {
			await i18n.setLocale(locale);
		}
	}
	
	return {
		...data,
		locale,
		locales: i18n.locales,
		i18nReady: true
	};
}

// ============================================
// Client-side helpers (+layout.svelte)
// ============================================

/**
 * Client-side initialization for i18n
 * Use this in your +layout.svelte onMount
 * 
 * @example
 * ```svelte
 * <!-- +layout.svelte -->
 * <script>
 * import { onMount } from 'svelte';
 * import { i18nClientInit } from '@shelchin/svelte-i18n';
 * import { i18n } from '../translations/i18n';
 * 
 * let { data } = $props();
 * 
 * onMount(() => i18nClientInit(i18n, data));
 * </script>
 * ```
 */
export async function i18nClientInit(
	i18n: I18nInstance,
	data: any,
	options?: {
		storageKey?: string;
		autoLoad?: boolean;
	}
) {
	const storageKey = options?.storageKey || 'i18n-locale';
	const autoLoad = options?.autoLoad !== false;
	
	// Load translations if configured
	if (autoLoad && i18n.clientLoad) {
		await i18n.clientLoad();
	}
	
	// Get saved locale from localStorage
	const savedLocale = localStorage.getItem(storageKey);
	const serverLocale = data?.locale;
	
	// Determine best locale (localStorage > server > default)
	const targetLocale = savedLocale || serverLocale || i18n.locale;
	
	// Set locale if available and different
	if (targetLocale !== i18n.locale && i18n.locales.includes(targetLocale)) {
		await i18n.setLocale(targetLocale);
	}
	
	return {
		locale: i18n.locale,
		locales: i18n.locales
	};
}

/**
 * Simple ready check for preventing flash during hydration
 * 
 * @example
 * ```svelte
 * <script>
 * import { i18nIsReady } from '@shelchin/svelte-i18n';
 * 
 * let isReady = $state(i18nIsReady(i18n, data));
 * </script>
 * 
 * {#if isReady}
 *   <div>Content</div>
 * {:else}
 *   <div>Loading...</div>
 * {/if}
 * ```
 */
export function i18nIsReady(i18n: I18nInstance, data: any): boolean {
	// Check if translations are loaded for current locale
	const locale = data?.locale || i18n.locale;
	return i18n.locales.includes(locale);
}

// ============================================
// Minimal setup helpers (one-liner solutions)
// ============================================

/**
 * Minimal SSR setup - just one line in +layout.server.ts
 * 
 * @example
 * ```typescript
 * // +layout.server.ts
 * import { handleSSR } from '@shelchin/svelte-i18n';
 * import { i18n } from '../translations/i18n';
 * 
 * export const load = handleSSR(i18n);
 * ```
 */
export function handleSSR(i18n: I18nInstance) {
	return async ({ cookies }: { cookies: Cookies }) => {
		return i18nServerLoad(i18n, cookies);
	};
}

/**
 * Minimal client setup - just one line in +layout.svelte
 * 
 * @example
 * ```svelte
 * <!-- +layout.svelte -->
 * <script>
 * import { handleClient } from '@shelchin/svelte-i18n';
 * import { i18n } from '../translations/i18n';
 * 
 * let { data, children } = $props();
 * handleClient(i18n, data);
 * </script>
 * 
 * {@render children()}
 * ```
 */
export function handleClient(i18n: I18nInstance, data: any) {
	if (typeof window !== 'undefined') {
		// Run initialization asynchronously
		i18nClientInit(i18n, data).catch(console.error);
	}
	return true;
}

/**
 * Minimal universal setup - for static sites
 * 
 * @example
 * ```typescript
 * // +layout.ts
 * import { handleUniversal } from '@shelchin/svelte-i18n';
 * import { i18n } from '../translations/i18n';
 * import { browser } from '$app/environment';
 * 
 * export const load = handleUniversal(i18n, browser);
 * ```
 */
export function handleUniversal(i18n: I18nInstance, browser: boolean) {
	return async ({ data }: { data: any }) => {
		return i18nUniversalLoad(i18n, data, browser);
	};
}