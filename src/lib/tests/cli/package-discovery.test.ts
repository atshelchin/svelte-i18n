import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
	packageUsesI18n,
	discoverStaticPackages,
	getPackageSchemaSource
} from '$lib/cli/package-discovery.js';

// Mock fs and path modules
vi.mock('fs');
vi.mock('path');

// Mock console
const mockConsole = {
	warn: vi.fn()
};

describe('CLI Package Discovery', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'warn').mockImplementation(mockConsole.warn);

		// Setup path mock
		vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('packageUsesI18n', () => {
		it('should detect package with @shelchin/svelte-i18n in dependencies', () => {
			const mockPackageJson = {
				name: '@myorg/ui-lib',
				dependencies: {
					'@shelchin/svelte-i18n': '^1.0.0',
					svelte: '^5.0.0'
				}
			};

			setupPackageMocks({
				'@myorg/ui-lib': {
					packageJson: mockPackageJson
				}
			});

			const result = packageUsesI18n('@myorg/ui-lib');

			expect(result).toBe(true);
		});

		it('should detect package with @shelchin/svelte-i18n in devDependencies', () => {
			const mockPackageJson = {
				name: 'my-lib',
				devDependencies: {
					'@shelchin/svelte-i18n': '^1.0.0'
				}
			};

			setupPackageMocks({
				'my-lib': {
					packageJson: mockPackageJson
				}
			});

			const result = packageUsesI18n('my-lib');

			expect(result).toBe(true);
		});

		it('should detect package with @shelchin/svelte-i18n in peerDependencies', () => {
			const mockPackageJson = {
				name: 'ui-components',
				peerDependencies: {
					'@shelchin/svelte-i18n': '>=1.0.0'
				}
			};

			setupPackageMocks({
				'ui-components': {
					packageJson: mockPackageJson
				}
			});

			const result = packageUsesI18n('ui-components');

			expect(result).toBe(true);
		});

		it('should detect package with translations directory', () => {
			setupPackageMocks({
				'my-package': {
					hasTranslations: true
				}
			});

			const result = packageUsesI18n('my-package');

			expect(result).toBe(true);
		});

		it('should return false for package without i18n', () => {
			const mockPackageJson = {
				name: 'plain-lib',
				dependencies: {
					svelte: '^5.0.0'
				}
			};

			setupPackageMocks({
				'plain-lib': {
					packageJson: mockPackageJson
				}
			});

			const result = packageUsesI18n('plain-lib');

			expect(result).toBe(false);
		});

		it('should handle missing package.json gracefully', () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);

			const result = packageUsesI18n('non-existent');

			expect(result).toBe(false);
		});

		it('should handle malformed package.json', () => {
			vi.mocked(fs.existsSync).mockImplementation((path) => {
				return path.toString().includes('broken-package/package.json');
			});

			vi.mocked(fs.readFileSync).mockReturnValue('{ invalid json');

			const result = packageUsesI18n('broken-package');

			expect(result).toBe(false);
		});
	});

	describe('discoverStaticPackages', () => {
		it('should discover app translations', () => {
			setupStaticDirMocks({
				app: { isDirectory: true },
				other: { isDirectory: true }
			});

			const result = discoverStaticPackages('/static/translations', {});

			expect(result).toContain('app');
		});

		it('should discover scoped packages', () => {
			setupStaticDirMocks({
				'@myorg': {
					isDirectory: true,
					children: {
						'ui-lib': { isDirectory: true },
						utils: { isDirectory: true }
					}
				}
			});

			const result = discoverStaticPackages('/static/translations', {
				packages: ['@myorg/ui-lib', '@myorg/utils']
			});

			expect(result).toContain('@myorg/ui-lib');
			expect(result).toContain('@myorg/utils');
		});

		it('should auto-discover packages with i18n when enabled', () => {
			// Set up mocks directly without using setupStaticDirMocks
			vi.mocked(fs.existsSync).mockImplementation((path) => {
				const pathStr = path.toString();

				// Static directory exists
				if (pathStr === '/static/translations') return true;

				// Package.json files exist for both packages in node_modules
				if (pathStr === 'node_modules/lib-with-i18n/package.json') return true;
				if (pathStr === 'node_modules/lib-without-i18n/package.json') return true;

				// Only lib-with-i18n has translations directory
				if (pathStr === 'node_modules/lib-with-i18n/translations') return true;
				if (pathStr === 'node_modules/lib-without-i18n/translations') return false;
				if (pathStr === 'node_modules/lib-with-i18n/dist/translations') return false;
				if (pathStr === 'node_modules/lib-without-i18n/dist/translations') return false;
				if (pathStr === 'node_modules/lib-with-i18n/static/translations') return false;
				if (pathStr === 'node_modules/lib-without-i18n/static/translations') return false;

				// Other packageUsesI18n checks
				if (pathStr.includes('../lib-with-i18n/package.json')) return false;
				if (pathStr.includes('../lib-without-i18n/package.json')) return false;
				if (pathStr.includes('../../lib-with-i18n/package.json')) return false;
				if (pathStr.includes('../../lib-without-i18n/package.json')) return false;

				return false;
			});

			vi.mocked(fs.readdirSync).mockImplementation((dir) => {
				if (dir.toString() === '/static/translations') {
					// Return directory entries
					return [
						{ name: 'lib-with-i18n', isDirectory: () => true },
						{ name: 'lib-without-i18n', isDirectory: () => true }
					] as any;
				}
				return [] as any;
			});

			vi.mocked(fs.readFileSync).mockImplementation((path) => {
				const pathStr = path.toString();
				if (pathStr === 'node_modules/lib-with-i18n/package.json') {
					return JSON.stringify({
						dependencies: { '@shelchin/svelte-i18n': '^1.0.0' }
					});
				}
				if (pathStr === 'node_modules/lib-without-i18n/package.json') {
					return JSON.stringify({
						dependencies: {}
					});
				}
				return '{}';
			});

			const result = discoverStaticPackages('/static/translations', {
				autoDiscover: true
			});

			// Debug: check what packageUsesI18n returns for each
			const withI18n = packageUsesI18n('lib-with-i18n');
			const withoutI18n = packageUsesI18n('lib-without-i18n');

			// These should be true and false respectively
			expect(withI18n).toBe(true);
			expect(withoutI18n).toBe(false);

			expect(result).toContain('lib-with-i18n');
			expect(result).not.toContain('lib-without-i18n');
		});

		it('should respect packages list when provided', () => {
			setupStaticDirMocks({
				'allowed-lib': { isDirectory: true },
				'not-allowed-lib': { isDirectory: true }
			});

			const result = discoverStaticPackages('/static/translations', {
				packages: ['allowed-lib']
			});

			expect(result).toContain('allowed-lib');
			expect(result).not.toContain('not-allowed-lib');
		});

		it('should handle non-existent static directory', () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);

			const result = discoverStaticPackages('/static/translations', {});

			expect(result).toEqual([]);
		});

		it('should skip files and only process directories', () => {
			setupStaticDirMocks({
				app: { isDirectory: true },
				'readme.md': { isDirectory: false },
				'.DS_Store': { isDirectory: false }
			});

			const result = discoverStaticPackages('/static/translations', {});

			expect(result).toContain('app');
			expect(result).not.toContain('readme.md');
			expect(result).not.toContain('.DS_Store');
		});

		it('should handle deeply nested scoped packages', () => {
			setupStaticDirMocks({
				'@company': {
					isDirectory: true,
					children: {
						'@team': {
							isDirectory: true,
							children: {
								lib: { isDirectory: true }
							}
						}
					}
				}
			});

			const result = discoverStaticPackages('/static/translations', {
				packages: ['@company/@team/lib']
			});

			// Note: The current implementation doesn't handle double-scoped packages
			// This test documents the current behavior
			expect(result).not.toContain('@company/@team/lib');
		});
	});

	describe('getPackageSchemaSource', () => {
		it('should prioritize local source schema', () => {
			setupSchemaMocks({
				'src/translations/my-package/en.json': {
					local: 'schema'
				},
				'node_modules/my-package/dist/translations/en.json': {
					dist: 'schema'
				}
			});

			const result = getPackageSchemaSource('my-package');

			expect(result.schema).toEqual({ local: 'schema' });
			expect(result.source).toContain('local source');
		});

		it('should use package dist schema as fallback', () => {
			setupSchemaMocks({
				'node_modules/my-package/dist/translations/en.json': {
					dist: 'schema'
				},
				'static/translations/my-package/en.json': {
					static: 'schema'
				}
			});

			const result = getPackageSchemaSource('my-package');

			expect(result.schema).toEqual({ dist: 'schema' });
			expect(result.source).toContain('package dist');
		});

		it('should use static schema as last resort', () => {
			setupSchemaMocks({
				'static/translations/my-package/en.json': {
					static: 'schema'
				}
			});

			const result = getPackageSchemaSource('my-package');

			expect(result.schema).toEqual({ static: 'schema' });
			expect(result.source).toContain('static');
		});

		it('should return null when no schema found', () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);

			const result = getPackageSchemaSource('non-existent');

			expect(result.schema).toBeNull();
			expect(result.source).toBe('');
		});

		it('should handle malformed JSON files', () => {
			vi.mocked(fs.existsSync).mockImplementation((path) => {
				return path.toString().includes('broken-package/en.json');
			});

			vi.mocked(fs.readFileSync).mockReturnValue('{ invalid json');

			const result = getPackageSchemaSource('broken-package');

			expect(result.schema).toBeNull();
			expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to parse'));
		});

		it('should try multiple paths in order', () => {
			const existsCalls: string[] = [];
			vi.mocked(fs.existsSync).mockImplementation((path) => {
				existsCalls.push(path.toString());
				return false;
			});

			getPackageSchemaSource('test-package');

			expect(existsCalls).toContain('src/translations/test-package/en.json');
			expect(existsCalls).toContain('node_modules/test-package/dist/translations/en.json');
			expect(existsCalls).toContain('node_modules/test-package/translations/en.json');
			expect(existsCalls).toContain('static/translations/test-package/en.json');
		});
	});

	// Helper functions
	function setupPackageMocks(
		packages: Record<
			string,
			{
				packageJson?: any;
				hasTranslations?: boolean;
			}
		>
	) {
		vi.mocked(fs.existsSync).mockImplementation((path) => {
			const pathStr = path.toString();

			for (const [pkgName, config] of Object.entries(packages)) {
				if (pathStr.includes(`${pkgName}/package.json`) && config.packageJson) {
					return true;
				}
				if (pathStr.includes(`${pkgName}/translations`) && config.hasTranslations) {
					return true;
				}
				if (pathStr.includes(`${pkgName}/dist/translations`) && config.hasTranslations) {
					return true;
				}
			}

			return false;
		});

		vi.mocked(fs.readFileSync).mockImplementation((path) => {
			const pathStr = path.toString();

			for (const [pkgName, config] of Object.entries(packages)) {
				if (pathStr.includes(`${pkgName}/package.json`) && config.packageJson) {
					return JSON.stringify(config.packageJson);
				}
			}

			return '{}';
		});
	}

	function setupStaticDirMocks(structure: Record<string, any>) {
		vi.mocked(fs.existsSync).mockImplementation((path) => {
			return path.toString().includes('/static/translations');
		});

		vi.mocked(fs.readdirSync).mockImplementation((dir) => {
			const dirStr = dir.toString();

			if (dirStr === '/static/translations') {
				return Object.entries(structure).map(([name, config]) => ({
					name,
					isDirectory: () => config.isDirectory
				})) as any;
			}

			// Handle scoped packages
			for (const [name, config] of Object.entries(structure)) {
				if (dirStr.endsWith(name) && config.children) {
					return Object.entries(config.children).map(([childName, childConfig]: [string, any]) => ({
						name: childName,
						isDirectory: () => childConfig.isDirectory
					})) as any;
				}
			}

			return [] as any;
		});
	}

	function setupSchemaMocks(schemas: Record<string, any>) {
		vi.mocked(fs.existsSync).mockImplementation((path) => {
			return schemas.hasOwnProperty(path.toString());
		});

		vi.mocked(fs.readFileSync).mockImplementation((path) => {
			const pathStr = path.toString();
			if (schemas[pathStr]) {
				return JSON.stringify(schemas[pathStr]);
			}
			return '{}';
		});
	}
});
