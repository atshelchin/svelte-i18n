/**
 * URL locale utilities for handling locale codes in URLs
 */

import { isValidLanguageCode } from './language-search.js';

/**
 * Remove locale code from URL pathname if it exists
 * Automatically detects and removes any valid locale code from the pathname
 * Uses the comprehensive language list from language-search.ts
 * @param url - The URL to process
 * @returns New URL with locale code removed from pathname if found
 *
 * @example
 * deLocalizeUrl(new URL('https://example.com/zh/about'))
 * // Returns: new URL('https://example.com/about')
 *
 * deLocalizeUrl(new URL('https://example.com/en-US/products'))
 * // Returns: new URL('https://example.com/products')
 *
 * deLocalizeUrl(new URL('https://example.com/notlang/about'))
 * // Returns: new URL('https://example.com/notlang/about') (unchanged)
 */
export function deLocalizeUrl(url: URL): URL {
	const newUrl = new URL(url.toString());
	const pathname = newUrl.pathname;

	// Split pathname into segments
	const segments = pathname.split('/').filter(Boolean);

	if (segments.length === 0) {
		return newUrl;
	}

	// Check if first segment is a valid locale code using the single source of truth
	const firstSegment = segments[0];
	if (isValidLanguageCode(firstSegment)) {
		// Remove the locale segment
		segments.shift();
		// Reconstruct pathname, ensuring at least a single slash
		newUrl.pathname = '/' + segments.join('/');
		// Handle empty pathname case
		if (newUrl.pathname === '') {
			newUrl.pathname = '/';
		}
	}

	return newUrl;
}
