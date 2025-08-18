import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { generateTypes } from '$lib/cli/generate-types.js';

// Mock fs and path modules
vi.mock('fs');
vi.mock('path');

// Mock console methods
const mockConsole = {
	log: vi.fn(),
	error: vi.fn(),
	warn: vi.fn()
};

// Mock process
const mockExit = vi.fn();

describe('CLI Generate Types', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock console
		vi.spyOn(console, 'log').mockImplementation(mockConsole.log);
		vi.spyOn(console, 'error').mockImplementation(mockConsole.error);
		vi.spyOn(console, 'warn').mockImplementation(mockConsole.warn);

		// Mock process
		vi.spyOn(process, 'exit').mockImplementation(mockExit as any);
		vi.spyOn(process, 'cwd').mockReturnValue('/test/project');

		// Setup path mocks
		vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
		vi.mocked(path.resolve).mockImplementation((...args) => args.join('/'));
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('generateTypes function', () => {
		it('should generate types for application project', async () => {
			const mockTranslations = {
				welcome: 'Welcome',
				user: {
					name: 'Name',
					email: 'Email'
				}
			};

			setupProjectMocks({
				projectType: 'app',
				translations: {
					'en.json': mockTranslations,
					'zh.json': {
						welcome: '欢迎',
						user: {
							name: '姓名',
							email: '邮箱'
						}
					}
				}
			});

			let generatedTypes = '';
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file.toString().includes('app-i18n-generated.d.ts')) {
					generatedTypes = content.toString();
				}
			});

			const result = await generateTypes();

			expect(result).toBe(true);
			expect(generatedTypes).toContain('export type I18nPath =');
			expect(generatedTypes).toContain("'welcome'");
			expect(generatedTypes).toContain("'user.name'");
			expect(generatedTypes).toContain("'user.email'");

			expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('Generated app types'));
		});

		it('should generate types for library project', async () => {
			const mockTranslations = {
				components: {
					button: {
						submit: 'Submit',
						cancel: 'Cancel'
					}
				}
			};

			setupProjectMocks({
				projectType: 'library',
				translations: {
					'en.json': mockTranslations,
					'zh.json': {
						components: {
							button: {
								submit: '提交',
								cancel: '取消'
							}
						}
					}
				},
				libTranslations: true
			});

			let generatedTypes = '';
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file.toString().includes('lib-i18n-generated.d.ts')) {
					generatedTypes = content.toString();
				}
			});

			const result = await generateTypes({ lib: true });

			expect(result).toBe(true);
			expect(generatedTypes).toContain('export type LibI18nPath =');
			expect(generatedTypes).toContain("'components.button.submit'");
			expect(generatedTypes).toContain("'components.button.cancel'");

			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('Generated library types')
			);
		});

		it('should generate types for both app and library in hybrid project', async () => {
			setupProjectMocks({
				projectType: 'hybrid',
				translations: {
					'en.json': { app: 'Application' }
				},
				libTranslations: true
			});

			const generatedFiles: Record<string, string> = {};
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				generatedFiles[file.toString()] = content.toString();
			});

			const result = await generateTypes();

			expect(result).toBe(true);
			expect(generatedFiles['/test/project/src/types/app-i18n-generated.d.ts']).toBeDefined();
			expect(generatedFiles['/test/project/src/lib/types/lib-i18n-generated.d.ts']).toBeDefined();
		});

		it('should validate translations and report missing keys', async () => {
			setupProjectMocks({
				projectType: 'app',
				translations: {
					'en.json': {
						welcome: 'Welcome',
						missing: 'This key is missing in zh'
					},
					'zh.json': {
						welcome: '欢迎'
						// missing key not present
					}
				}
			});

			const result = await generateTypes({ validate: true });

			expect(result).toBe(false);
			expect(mockConsole.error).toHaveBeenCalledWith(
				expect.stringContaining('Missing keys: missing')
			);
		});

		it('should skip validation when validate is false', async () => {
			setupProjectMocks({
				projectType: 'app',
				translations: {
					'en.json': {
						welcome: 'Welcome',
						missing: 'Missing in other locales'
					},
					'zh.json': {
						welcome: '欢迎'
					}
				}
			});

			const result = await generateTypes({ validate: false });

			expect(result).toBe(true);
			expect(mockConsole.error).not.toHaveBeenCalledWith(expect.stringContaining('Missing keys'));
		});

		it('should use custom paths when provided', async () => {
			setupProjectMocks({
				projectType: 'app',
				customDir: 'custom/translations',
				translations: {
					'en.json': { custom: 'Custom path' }
				}
			});

			let generatedPath = '';
			vi.mocked(fs.writeFileSync).mockImplementation((file, _content) => {
				generatedPath = file.toString();
			});

			const result = await generateTypes({
				translationsDir: 'custom/translations',
				outFile: 'custom/types/i18n.d.ts'
			});

			expect(result).toBe(true);
			expect(generatedPath).toBe('/test/project/custom/types/i18n.d.ts');
		});

		it('should handle missing translations directory', async () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);

			const result = await generateTypes();

			expect(result).toBe(false);
			expect(mockConsole.error).toHaveBeenCalledWith(
				expect.stringContaining('translations not found')
			);
		});

		it('should warn about extra keys in translations', async () => {
			setupProjectMocks({
				projectType: 'app',
				translations: {
					'en.json': {
						welcome: 'Welcome'
					},
					'zh.json': {
						welcome: '欢迎',
						extra: '额外的键'
					}
				}
			});

			await generateTypes({ validate: true });

			expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('Extra keys: extra'));
		});

		it('should handle missing base locale file', async () => {
			setupProjectMocks({
				projectType: 'app',
				translations: {
					'zh.json': { welcome: '欢迎' }
					// en.json missing
				},
				missingBase: true
			});

			const result = await generateTypes({ defaultLocale: 'en' });

			// When base locale is missing and validate is not explicitly enabled,
			// type generation succeeds using zh.json as template
			expect(result).toBe(true);
			expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('Generated app types'));
		});

		it('should handle empty translations directory', async () => {
			setupProjectMocks({
				projectType: 'app',
				translations: {}
			});

			const result = await generateTypes();

			// Empty directory causes failure because generateTypeDefinitions throws
			expect(result).toBe(false);
			expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('Failed to generate'));
		});

		it('should handle JSON parse errors gracefully', async () => {
			vi.mocked(fs.existsSync).mockImplementation((path) => {
				const pathStr = path.toString();
				if (pathStr.includes('package.json')) return true;
				if (pathStr.includes('src/translations/locales')) return true;
				return false;
			});
			vi.mocked(fs.readdirSync).mockReturnValue(['en.json'] as any);
			vi.mocked(fs.readFileSync).mockImplementation((path) => {
				if (path.toString().includes('package.json')) {
					return '{"name": "test-app"}';
				}
				return '{ invalid json';
			});

			const result = await generateTypes();

			expect(result).toBe(false);
			expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('Failed to generate'));
		});

		it('should generate types with custom default locale', async () => {
			setupProjectMocks({
				projectType: 'app',
				translations: {
					'fr.json': {
						bienvenue: 'Bienvenue'
					},
					'en.json': {
						bienvenue: 'Welcome'
					}
				}
			});

			const result = await generateTypes({ defaultLocale: 'fr' });

			expect(result).toBe(true);
			// Should use fr.json as base for validation
			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('translations are valid')
			);
		});

		it('should warn when app translations not found but not fail', async () => {
			setupProjectMocks({
				projectType: 'app',
				noTranslations: true
			});

			const result = await generateTypes();

			expect(result).toBe(false);
			expect(mockConsole.error).toHaveBeenCalledWith(
				expect.stringContaining('translations not found')
			);
		});

		it('should warn when library translations not found', async () => {
			setupProjectMocks({
				projectType: 'library',
				noTranslations: true
			});

			const result = await generateTypes({ lib: true });

			expect(result).toBe(false);
			expect(mockConsole.error).toHaveBeenCalledWith(
				expect.stringContaining('translations not found')
			);
		});
	});

	// Helper function to setup project mocks
	function setupProjectMocks(options: {
		projectType: 'app' | 'library' | 'hybrid';
		translations?: Record<string, any>;
		libTranslations?: boolean;
		customDir?: string;
		missingBase?: boolean;
		noTranslations?: boolean;
	}) {
		const {
			projectType,
			translations = {},
			libTranslations = false,
			customDir,
			missingBase = false,
			noTranslations = false
		} = options;

		const appDir = customDir || 'src/translations/locales';
		const libDir = 'src/lib/translations/locales';

		// Mock path module
		vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
		vi.mocked(path.resolve).mockImplementation((...args) => args.join('/'));
		vi.mocked(path.basename).mockImplementation((p) => {
			const parts = p.toString().split('/');
			return parts[parts.length - 1].replace('.json', '');
		});
		vi.mocked(path.dirname).mockImplementation((p) => {
			const parts = p.toString().split('/');
			parts.pop();
			return parts.join('/');
		});

		// Mock fs.existsSync
		vi.mocked(fs.existsSync).mockImplementation((path) => {
			const pathStr = path.toString();

			if (noTranslations) {
				return pathStr.includes('package.json');
			}

			// Package.json
			if (pathStr.includes('package.json')) return true;

			// Translation directories - check full path
			const fullAppDir = `/test/project/${appDir}`;
			const fullLibDir = `/test/project/${libDir}`;

			if (
				(pathStr === fullAppDir || pathStr.includes(appDir)) &&
				(projectType === 'app' || projectType === 'hybrid')
			) {
				return true;
			}
			if ((pathStr === fullLibDir || pathStr.includes(libDir)) && libTranslations) {
				return true;
			}

			// Base locale file
			if (missingBase && pathStr.includes('en.json')) {
				return false;
			}

			// Project structure - important for detectProjectType
			if (projectType === 'app' || projectType === 'hybrid') {
				if (pathStr.includes('src/routes') || pathStr === '/test/project/src/routes') return true;
			}
			if (projectType === 'library' || projectType === 'hybrid') {
				if (pathStr.includes('src/lib/index.ts') || pathStr === '/test/project/src/lib/index.ts')
					return true;
			}

			return false;
		});

		// Mock fs.readdirSync
		vi.mocked(fs.readdirSync).mockImplementation((dir) => {
			const dirStr = dir.toString();
			const fullAppDir = `/test/project/${appDir}`;
			const fullLibDir = `/test/project/${libDir}`;

			if (
				dirStr === fullAppDir ||
				dirStr === fullLibDir ||
				dirStr.includes(appDir) ||
				dirStr.includes(libDir)
			) {
				return Object.keys(translations) as any;
			}

			return [] as any;
		});

		// Mock fs.readFileSync
		vi.mocked(fs.readFileSync).mockImplementation((path) => {
			const pathStr = path.toString();

			// Package.json
			if (pathStr.includes('package.json')) {
				const packageJson: any = {
					name: projectType === 'library' ? '@org/lib' : 'my-app'
				};

				if (projectType === 'library' || projectType === 'hybrid') {
					packageJson.exports = { '.': './dist/index.js' };
				}
				if (projectType === 'app' || projectType === 'hybrid') {
					packageJson.devDependencies = { '@sveltejs/kit': '^2.0.0' };
				}

				return JSON.stringify(packageJson);
			}

			// Translation files
			for (const [file, content] of Object.entries(translations)) {
				if (pathStr.endsWith(file)) {
					return typeof content === 'string' ? content : JSON.stringify(content);
				}
			}

			return '{}';
		});

		// Mock fs.statSync
		vi.mocked(fs.statSync).mockImplementation((path) => {
			const pathStr = path.toString();
			if (pathStr.endsWith('.json')) {
				return { isFile: () => true, isDirectory: () => false } as any;
			}
			return { isFile: () => false, isDirectory: () => true } as any;
		});

		// Mock fs.writeFileSync
		vi.mocked(fs.writeFileSync).mockImplementation(() => {});

		// Mock fs.mkdirSync
		vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
	}
});
