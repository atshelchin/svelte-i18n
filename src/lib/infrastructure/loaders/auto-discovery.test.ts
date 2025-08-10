import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { autoDiscoverTranslations } from './auto-discovery.js';

describe('Auto-discovery with scoped packages', () => {
	// Mock fetch
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockClear();
		global.window = {
			// @ts-expect-error - Partial mock of Location for testing
			location: {
				origin: 'http://localhost:3000',
				hostname: 'localhost',
				pathname: '/',
				href: 'http://localhost:3000/'
			}
		};
		// @ts-expect-error - Mocking document for testing
		global.document = {
			querySelector: vi.fn().mockReturnValue(null)
		};
	});

	afterEach(() => {
		// @ts-expect-error - Cleaning up mock
		delete global.window;
		// @ts-expect-error - Cleaning up mock
		delete global.document;
	});

	it('should generate correct URLs for non-scoped packages', async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			status: 404
		});

		await autoDiscoverTranslations('my-package', 'en', {
			fetcher: mockFetch,
			debug: false
		});

		// Check that URLs were generated correctly for non-scoped package
		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('/translations/my-package.en.json')
		);
		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('/translations/my-package/en.json')
		);
	});

	it('should generate correct URLs for scoped packages', async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			status: 404
		});

		await autoDiscoverTranslations('@shelchin/my-package', 'en', {
			fetcher: mockFetch,
			debug: false
		});

		// Check that URLs were generated correctly for scoped package
		// The scope should be preserved in the directory structure
		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('/translations/@shelchin/my-package.en.json')
		);
		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('/translations/@shelchin/my-package/en.json')
		);
	});

	it('should handle multiple scoped packages without conflicts', async () => {
		const translations1 = { hello: 'Hello from @org1/package' };
		const translations2 = { hello: 'Hello from @org2/package' };

		// First call for @org1/package
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => translations1
		});

		const result1 = await autoDiscoverTranslations('@org1/package', 'en', {
			fetcher: mockFetch,
			debug: false
		});

		expect(result1).toEqual(translations1);

		// Second call for @org2/package (same package name, different scope)
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => translations2
		});

		const result2 = await autoDiscoverTranslations('@org2/package', 'en', {
			fetcher: mockFetch,
			debug: false
		});

		expect(result2).toEqual(translations2);

		// Verify different URLs were called
		expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/@org1/package.en.json'));
		expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/@org2/package.en.json'));
	});

	it('should handle scoped packages with custom patterns', async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			status: 404
		});

		await autoDiscoverTranslations('@myorg/awesome-lib', 'zh', {
			patterns: ['libs/{namespace}/{locale}.json', 'i18n/{namespace}.{locale}.json'],
			fetcher: mockFetch,
			debug: false
		});

		// Check custom patterns work with scoped packages
		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('/translations/libs/@myorg/awesome-lib/zh.json')
		);
		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('/translations/i18n/@myorg/awesome-lib.zh.json')
		);
	});

	it('should preserve URL encoding for scoped packages', async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			status: 404
		});

		// The @ and / should be preserved in the URL path
		await autoDiscoverTranslations('@test-org/test-package', 'en', {
			baseUrl: '/static/translations',
			fetcher: mockFetch,
			debug: false
		});

		// Verify the @ symbol is preserved in the URL
		const calls = mockFetch.mock.calls;
		expect(calls.some((call) => call[0].includes('@test-org'))).toBe(true);
		expect(
			calls.some((call) => call[0].includes('/static/translations/@test-org/test-package'))
		).toBe(true);
	});
});
