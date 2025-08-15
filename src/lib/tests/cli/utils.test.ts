import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { detectProjectType, generateTypeDefinitions } from '$lib/cli/utils.js';

// Mock fs and path modules
vi.mock('fs');
vi.mock('path');

describe('CLI Utils', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Setup path mocks
		vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
		vi.mocked(path.dirname).mockImplementation((p) => {
			const parts = p.split('/');
			parts.pop();
			return parts.join('/');
		});
		vi.mocked(path.basename).mockImplementation((p) => {
			const parts = p.split('/');
			return parts[parts.length - 1];
		});
	});

	describe('detectProjectType', () => {
		it('should detect library project with exports field', () => {
			const mockPackageJson = {
				name: 'my-ui-lib',
				exports: {
					'.': './dist/index.js'
				}
			};

			vi.mocked(fs.existsSync).mockImplementation((filePath) => {
				const pathStr = filePath.toString();
				if (pathStr.includes('package.json')) return true;
				if (pathStr.includes('src/lib/index.ts')) return true;
				return false;
			});

			vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
				if (filePath.toString().includes('package.json')) {
					return JSON.stringify(mockPackageJson);
				}
				return '';
			});

			const result = detectProjectType('/test/project');
			expect(result.isPackage).toBe(true);
			expect(result.isApp).toBe(false);
			expect(result.packageName).toBe('my-ui-lib');
		});

		it('should detect application project with SvelteKit', () => {
			const mockPackageJson = {
				name: 'my-app',
				devDependencies: {
					'@sveltejs/kit': '^2.0.0'
				}
			};

			vi.mocked(fs.existsSync).mockImplementation((filePath) => {
				const pathStr = filePath.toString();
				if (pathStr.includes('package.json')) return true;
				if (pathStr.includes('src/routes')) return true;
				return false;
			});

			vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
				if (filePath.toString().includes('package.json')) {
					return JSON.stringify(mockPackageJson);
				}
				return '';
			});

			const result = detectProjectType('/test/project');
			expect(result.isApp).toBe(true);
			expect(result.isPackage).toBe(false);
		});

		it('should detect hybrid project', () => {
			const mockPackageJson = {
				name: 'my-hybrid',
				exports: {
					'.': './dist/index.js'
				},
				devDependencies: {
					'@sveltejs/kit': '^2.0.0'
				}
			};

			vi.mocked(fs.existsSync).mockImplementation((filePath) => {
				const pathStr = filePath.toString();
				if (pathStr.includes('package.json')) return true;
				if (pathStr.includes('src/routes')) return true;
				if (pathStr.includes('src/lib/index.ts')) return true;
				return false;
			});

			vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
				if (filePath.toString().includes('package.json')) {
					return JSON.stringify(mockPackageJson);
				}
				return '';
			});

			const result = detectProjectType('/test/project');
			expect(result.isPackage).toBe(true);
			expect(result.isApp).toBe(true);
		});

		it('should return unknown for non-standard projects', () => {
			const mockPackageJson = {
				name: 'basic-project'
			};

			vi.mocked(fs.existsSync).mockImplementation((filePath) => {
				const pathStr = filePath.toString();
				if (pathStr.includes('package.json')) return true;
				return false;
			});

			vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
				if (filePath.toString().includes('package.json')) {
					return JSON.stringify(mockPackageJson);
				}
				return '';
			});

			const result = detectProjectType('/test/project');
			expect(result.isPackage).toBe(false);
			expect(result.isApp).toBe(true);
		});

		it('should handle missing package.json gracefully', () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);

			const result = detectProjectType('/test/project');
			expect(result.isPackage).toBe(false);
			expect(result.isApp).toBe(true); // Defaults to app when nothing detected
		});

		it('should handle malformed package.json', () => {
			vi.mocked(fs.existsSync).mockImplementation((filePath) => {
				const pathStr = filePath.toString();
				if (pathStr.includes('package.json')) return true;
				return false;
			});

			vi.mocked(fs.readFileSync).mockReturnValue('{ invalid json');

			expect(() => detectProjectType('/test/project')).toThrow();
		});
	});

	describe('generateTypeDefinitions', () => {
		it('should generate type definitions from translation files', () => {
			const mockTranslations = {
				welcome: 'Welcome',
				user: {
					name: 'Name',
					email: 'Email',
					profile: {
						title: 'Profile'
					}
				},
				items: {
					count: '{count} items'
				}
			};

			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue(['en.json', 'zh.json'] as any);
			vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
				return JSON.stringify(mockTranslations);
			});
			vi.mocked(fs.writeFileSync).mockImplementation(() => {});

			const result = generateTypeDefinitions('/test/translations', '/test/output.d.ts', 'I18nPath');

			expect(result).toContain('export type I18nPath =');
			expect(result).toContain("'welcome'");
			expect(result).toContain("'user.name'");
			expect(result).toContain("'user.email'");
			expect(result).toContain("'user.profile.title'");
			expect(result).toContain("'items.count'");

			expect(fs.writeFileSync).toHaveBeenCalledWith(
				'/test/output.d.ts',
				expect.stringContaining('export type I18nPath =')
			);
		});

		it('should handle empty translation files', () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue(['en.json'] as any);
			vi.mocked(fs.readFileSync).mockReturnValue('{}');
			vi.mocked(fs.writeFileSync).mockImplementation(() => {});

			const result = generateTypeDefinitions('/test/translations', '/test/output.d.ts', 'I18nPath');

			expect(result).toContain('export type I18nPath =');
			expect(result).toContain('never');
		});

		it('should skip non-JSON files', () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue(['en.json', 'readme.md', '.DS_Store'] as any);
			vi.mocked(fs.readFileSync).mockReturnValue('{"test": "value"}');
			vi.mocked(fs.writeFileSync).mockImplementation(() => {});

			generateTypeDefinitions('/test/translations', '/test/output.d.ts', 'I18nPath');

			// Should only read the JSON file
			expect(fs.readFileSync).toHaveBeenCalledTimes(1);
			expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('en.json'), 'utf8');
		});

		it('should handle nested objects with arrays and special characters', () => {
			const mockTranslations = {
				'special.key-name': 'Value',
				nested: {
					deep: {
						key: 'value'
					}
				}
			};

			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue(['en.json'] as any);
			vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockTranslations));
			vi.mocked(fs.writeFileSync).mockImplementation(() => {});

			const result = generateTypeDefinitions('/test/translations', '/test/output.d.ts', 'I18nPath');

			expect(result).toContain("'special.key-name'");
			expect(result).toContain("'nested.deep.key'");
		});

		it('should throw error when translations directory does not exist', () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);

			expect(() => {
				generateTypeDefinitions('/test/translations', '/test/output.d.ts', 'I18nPath');
			}).toThrow();
		});

		it('should handle malformed JSON files gracefully', () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue(['en.json'] as any);
			vi.mocked(fs.readFileSync).mockReturnValue('{ invalid json');

			expect(() => {
				generateTypeDefinitions('/test/translations', '/test/output.d.ts', 'I18nPath');
			}).toThrow();
		});

		it('should use the most complete translation file as template', () => {
			const smallTranslations = {
				welcome: 'Welcome'
			};

			const largeTranslations = {
				welcome: 'Welcome',
				user: {
					name: 'Name',
					email: 'Email'
				},
				extra: 'Extra key'
			};

			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue(['zh.json', 'en.json'] as any);

			vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
				if (filePath.toString().includes('en.json')) {
					return JSON.stringify(largeTranslations);
				}
				return JSON.stringify(smallTranslations);
			});

			vi.mocked(fs.writeFileSync).mockImplementation(() => {});

			const result = generateTypeDefinitions('/test/translations', '/test/output.d.ts', 'I18nPath');

			// Should use en.json as template (even if not largest)
			expect(result).toContain("'user.name'");
			expect(result).toContain("'user.email'");
			expect(result).toContain("'extra'");
		});
	});
});
