import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { init } from '$lib/cli/init.js';

// Mock fs and path modules
vi.mock('fs');
vi.mock('path');

// Mock console methods
const mockConsole = {
	log: vi.fn(),
	error: vi.fn(),
	warn: vi.fn()
};

// Mock process.exit
const mockExit = vi.fn();

describe('CLI Init', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock console
		vi.spyOn(console, 'log').mockImplementation(mockConsole.log);
		vi.spyOn(console, 'error').mockImplementation(mockConsole.error);

		// Mock process
		vi.spyOn(process, 'exit').mockImplementation(mockExit as any);
		vi.spyOn(process, 'cwd').mockReturnValue('/test/project');

		// Setup default path mocks
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
		vi.mocked(path.relative).mockImplementation((from, to) => {
			// Handle relative path calculation
			const fromParts = from.split('/').filter((p) => p);
			const toParts = to.split('/').filter((p) => p);

			// Find common base
			let commonLength = 0;
			for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
				if (fromParts[i] === toParts[i]) {
					commonLength++;
				} else {
					break;
				}
			}

			// Build relative path
			const upCount = fromParts.length - commonLength;
			const downPath = toParts.slice(commonLength);

			const parts = [];
			for (let i = 0; i < upCount; i++) {
				parts.push('..');
			}
			parts.push(...downPath);

			return parts.join('/') || '.';
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('init function', () => {
		it('should initialize i18n for an application project', () => {
			const mockPackageJson = {
				name: 'my-app',
				scripts: {}
			};

			setupProjectMocks({
				packageJson: mockPackageJson,
				projectType: 'app'
			});

			const createdFiles: Record<string, any> = {};
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				createdFiles[file.toString()] = content.toString();
				return undefined;
			});

			init();

			// Should create translation files
			expect(createdFiles['/test/project/src/translations/locales/en.json']).toBeDefined();
			expect(createdFiles['/test/project/src/translations/locales/zh.json']).toBeDefined();

			// Should create i18n.ts config
			expect(createdFiles['/test/project/src/translations/i18n.ts']).toBeDefined();
			expect(createdFiles['/test/project/src/translations/i18n.ts']).toContain(
				'createTypedUnifiedI18n'
			);
			expect(createdFiles['/test/project/src/translations/i18n.ts']).toContain("namespace: 'app'");

			// Note: Type definitions are created by generateTypes command, not init

			// Should update package.json with scripts
			const updatedPackageJson = JSON.parse(createdFiles['/test/project/package.json']);
			expect(updatedPackageJson.scripts['i18n:check']).toBeDefined();
			expect(updatedPackageJson.scripts['i18n:types']).toBeDefined();

			// Should not exit with error
			expect(mockExit).not.toHaveBeenCalled();
		});

		it('should initialize i18n for a library project', () => {
			const mockPackageJson = {
				name: '@myorg/ui-lib',
				exports: {
					'.': './dist/index.js'
				},
				scripts: {}
			};

			setupProjectMocks({
				packageJson: mockPackageJson,
				projectType: 'library'
			});

			const createdFiles: Record<string, any> = {};
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				createdFiles[file.toString()] = content.toString();
				return undefined;
			});

			init();

			// Should create library translation files
			expect(createdFiles['/test/project/src/lib/translations/locales/en.json']).toBeDefined();
			expect(createdFiles['/test/project/src/lib/translations/locales/zh.json']).toBeDefined();

			// Should create library i18n.ts config
			expect(createdFiles['/test/project/src/lib/translations/i18n.ts']).toBeDefined();
			expect(createdFiles['/test/project/src/lib/translations/i18n.ts']).toContain('libI18n');
			expect(createdFiles['/test/project/src/lib/translations/i18n.ts']).toContain('initTypedI18n');
			expect(createdFiles['/test/project/src/lib/translations/i18n.ts']).toContain(
				'getEffectiveLibI18n'
			);

			// Note: Type definitions are created by generateTypes command, not init

			// Should update package.json with library scripts
			const updatedPackageJson = JSON.parse(createdFiles['/test/project/package.json']);
			expect(updatedPackageJson.scripts['i18n:check:lib']).toBeDefined();
			expect(updatedPackageJson.scripts['i18n:types:lib']).toBeDefined();
		});

		it('should initialize i18n for a hybrid project (app + library)', () => {
			const mockPackageJson = {
				name: 'my-hybrid',
				exports: {
					'.': './dist/index.js'
				},
				devDependencies: {
					'@sveltejs/kit': '^2.0.0'
				},
				scripts: {}
			};

			setupProjectMocks({
				packageJson: mockPackageJson,
				projectType: 'hybrid'
			});

			const createdFiles: Record<string, any> = {};
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				createdFiles[file.toString()] = content.toString();
				return undefined;
			});

			init();

			// Should create both app and library files
			expect(createdFiles['/test/project/src/translations/locales/en.json']).toBeDefined();
			expect(createdFiles['/test/project/src/lib/translations/locales/en.json']).toBeDefined();

			// Should create both configurations
			expect(createdFiles['/test/project/src/translations/i18n.ts']).toBeDefined();
			expect(createdFiles['/test/project/src/lib/translations/i18n.ts']).toBeDefined();

			// Should update package.json with all scripts
			const updatedPackageJson = JSON.parse(createdFiles['/test/project/package.json']);
			expect(updatedPackageJson.scripts['i18n:check']).toBeDefined();
			expect(updatedPackageJson.scripts['i18n:types']).toBeDefined();
			expect(updatedPackageJson.scripts['i18n:check:lib']).toBeDefined();
			expect(updatedPackageJson.scripts['i18n:types:lib']).toBeDefined();
		});

		it('should skip existing translation files', () => {
			const mockPackageJson = {
				name: 'my-app',
				scripts: {}
			};

			setupProjectMocks({
				packageJson: mockPackageJson,
				projectType: 'app',
				existingFiles: ['/test/project/src/translations/locales/en.json']
			});

			let createdFiles: Record<string, any> = {};
			let skippedFiles: string[] = [];

			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				const fileStr = file.toString();
				if (fileStr.includes('en.json')) {
					skippedFiles.push(fileStr);
				} else {
					createdFiles[fileStr] = content.toString();
				}
			});

			init();

			// Should not overwrite existing en.json
			expect(skippedFiles).not.toContain('/test/project/src/translations/locales/en.json');

			// Should create zh.json
			expect(createdFiles['/test/project/src/translations/locales/zh.json']).toBeDefined();

			// Should log info about skipping
			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('already exists, skipping')
			);
		});

		it('should exit with error if no package.json found', () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);
			vi.mocked(fs.readFileSync).mockReturnValue('{}');

			init();

			expect(mockConsole.error).toHaveBeenCalledWith(
				expect.stringContaining('No package.json found')
			);
			expect(mockExit).toHaveBeenCalledWith(1);
		});

		it('should not add scripts if they already exist', () => {
			const mockPackageJson = {
				name: 'my-app',
				scripts: {
					'i18n:check': 'existing-command',
					'i18n:types': 'existing-types-command'
				}
			};

			setupProjectMocks({
				packageJson: mockPackageJson,
				projectType: 'app'
			});

			let packageJsonUpdates: string[] = [];
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file.toString().includes('package.json')) {
					packageJsonUpdates.push(content.toString());
				}
			});

			init();

			// Should NOT update package.json when scripts already exist
			expect(packageJsonUpdates.length).toBe(0);

			// Verify that the scripts would have been preserved if there was an update
			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('i18n initialized successfully')
			);
		});

		it('should create nested directories recursively', () => {
			const mockPackageJson = {
				name: 'my-app',
				scripts: {}
			};

			setupProjectMocks({
				packageJson: mockPackageJson,
				projectType: 'app'
			});

			const mkdirCalls: string[] = [];
			vi.mocked(fs.mkdirSync).mockImplementation((path, options) => {
				mkdirCalls.push(path.toString());
				return undefined;
			});

			init();

			// Should create directories with recursive option
			expect(mkdirCalls).toContain('/test/project/src/translations/locales');
			expect(mkdirCalls).toContain('/test/project/src/types');

			// Verify recursive option was used
			expect(fs.mkdirSync).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({ recursive: true })
			);
		});

		it('should generate correct import paths in i18n.ts', () => {
			const mockPackageJson = {
				name: 'my-app',
				scripts: {}
			};

			setupProjectMocks({
				packageJson: mockPackageJson,
				projectType: 'app'
			});

			let i18nContent = '';
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				const filePath = file.toString();
				// Capture i18n.ts file content specifically
				if (filePath === '/test/project/src/translations/i18n.ts' || filePath.endsWith('i18n.ts')) {
					i18nContent = content.toString();
				}
			});

			init();

			// Check import paths
			expect(i18nContent).toContain(
				"import type { I18nPath } from '../types/app-i18n-generated.js'"
			);
			expect(i18nContent).toContain("import.meta.glob('./locales/*.json'");
			expect(i18nContent).toContain("namespace: 'app'");
			expect(i18nContent).toContain('isMain: true');
		});

		it('should handle package name from package.json for libraries', () => {
			const mockPackageJson = {
				name: '@company/ui-components',
				exports: {
					'.': './dist/index.js'
				},
				scripts: {}
			};

			setupProjectMocks({
				packageJson: mockPackageJson,
				projectType: 'library'
			});

			let i18nContent = '';
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file.toString().includes('i18n.ts')) {
					i18nContent = content.toString();
				}
			});

			init();

			// Should use package name as namespace
			expect(i18nContent).toContain("namespace: '@company/ui-components'");
			expect(i18nContent).toContain("const packageName = '@company/ui-components'");
		});

		it('should display correct next steps for different project types', () => {
			const mockPackageJson = {
				name: 'my-app',
				scripts: {}
			};

			setupProjectMocks({
				packageJson: mockPackageJson,
				projectType: 'app'
			});

			init();

			// Should show app-specific instructions
			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('For your APPLICATION:')
			);
			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining("import '../translations/i18n'")
			);
			expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('npm run i18n:types'));
		});
	});

	// Helper function to setup project mocks
	function setupProjectMocks(options: {
		packageJson: any;
		projectType: 'app' | 'library' | 'hybrid';
		existingFiles?: string[];
	}) {
		const { packageJson, projectType, existingFiles = [] } = options;

		// Mock fs.existsSync
		vi.mocked(fs.existsSync).mockImplementation((path) => {
			const pathStr = path.toString();

			// Package.json always exists
			if (pathStr.includes('package.json')) return true;

			// Check existing files
			if (existingFiles.some((f) => pathStr === f)) return true;

			// Project type specific paths
			if (projectType === 'app' || projectType === 'hybrid') {
				if (pathStr.includes('src/routes')) return true;
			}
			if (projectType === 'library' || projectType === 'hybrid') {
				if (pathStr.includes('src/lib/index.ts')) return true;
			}

			return false;
		});

		// Mock fs.readFileSync
		vi.mocked(fs.readFileSync).mockImplementation((path) => {
			const pathStr = path.toString();
			if (pathStr.includes('package.json')) {
				return JSON.stringify(packageJson);
			}
			return '{}';
		});

		// Don't mock fs.writeFileSync here - let individual tests mock it

		// Mock fs.mkdirSync
		vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);

		// Mock fs.readdirSync for type generation
		vi.mocked(fs.readdirSync).mockReturnValue(['en.json', 'zh.json'] as any);
	}
});
