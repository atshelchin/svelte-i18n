import { describe, it, expect } from 'vitest';
import { deLocalizeUrl } from '$lib/kit/url-locale.js';

describe('deLocalizeUrl', () => {
	it('should remove ISO 639-1 language codes (2 letters)', () => {
		const url = new URL('https://example.com/en/about');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/about');
		expect(result.href).toBe('https://example.com/about');
	});

	it('should remove Chinese language code', () => {
		const url = new URL('https://example.com/zh/products');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/products');
	});

	it('should remove Bengali language code', () => {
		const url = new URL('https://example.com/bn/about');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/about');
	});

	it('should remove BCP 47 locale codes with region', () => {
		const url = new URL('https://example.com/en-US/contact');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/contact');
	});

	it('should remove zh-CN locale code', () => {
		const url = new URL('https://example.com/zh-CN/docs');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/docs');
	});

	it('should remove zh-TW locale code', () => {
		const url = new URL('https://example.com/zh-TW/help');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/help');
	});

	it('should handle URL with only locale code in path', () => {
		const url = new URL('https://example.com/fr');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/');
	});

	it('should handle root URL without locale', () => {
		const url = new URL('https://example.com/');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/');
		expect(result.href).toBe('https://example.com/');
	});

	it('should NOT remove non-locale segments', () => {
		const url = new URL('https://example.com/blog/post-123');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/blog/post-123');
	});

	it('should NOT remove segments that look like but are not valid locales', () => {
		const url = new URL('https://example.com/abc123/page');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/abc123/page');
	});

	it('should preserve query parameters', () => {
		const url = new URL('https://example.com/en/search?q=test&page=2');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/search');
		expect(result.search).toBe('?q=test&page=2');
		expect(result.href).toBe('https://example.com/search?q=test&page=2');
	});

	it('should preserve hash fragments', () => {
		const url = new URL('https://example.com/fr/docs#section-1');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/docs');
		expect(result.hash).toBe('#section-1');
		expect(result.href).toBe('https://example.com/docs#section-1');
	});

	it('should preserve port and protocol', () => {
		const url = new URL('http://example.com:8080/de/api');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/api');
		expect(result.port).toBe('8080');
		expect(result.protocol).toBe('http:');
		expect(result.href).toBe('http://example.com:8080/api');
	});

	it('should handle complex paths with multiple segments', () => {
		const url = new URL('https://example.com/ja/docs/api/v2/reference');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/docs/api/v2/reference');
	});

	it('should handle uppercase language codes', () => {
		const url = new URL('https://example.com/EN/about');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/about');
	});

	it('should handle mixed case language codes', () => {
		const url = new URL('https://example.com/En/about');
		const result = deLocalizeUrl(url);
		expect(result.pathname).toBe('/about');
	});

	it('should NOT modify URLs with locale in subdomain', () => {
		const url = new URL('https://en.example.com/about');
		const result = deLocalizeUrl(url);
		expect(result.href).toBe('https://en.example.com/about');
	});

	it('should create a new URL instance without modifying the original', () => {
		const url = new URL('https://example.com/es/contact');
		const result = deLocalizeUrl(url);

		expect(url.pathname).toBe('/es/contact');
		expect(result.pathname).toBe('/contact');
		expect(url).not.toBe(result);
	});
});
