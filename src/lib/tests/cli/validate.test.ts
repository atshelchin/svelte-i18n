import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { validate } from '$lib/cli/validate.js';

// Mock fs and path modules
vi.mock('fs');
vi.mock('path');

// Mock console to capture output
const mockConsole = {
	log: vi.fn(),
	error: vi.fn(),
	warn: vi.fn()
};

describe('CLI Validate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Replace console methods
		vi.spyOn(console, 'log').mockImplementation(mockConsole.log);
		vi.spyOn(console, 'error').mockImplementation(mockConsole.error);
		vi.spyOn(console, 'warn').mockImplementation(mockConsole.warn);

		// Setup path mocks
		vi.mocked(path.resolve).mockImplementation((...args) => args.join('/'));
		vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
		vi.mocked(path.basename).mockImplementation((file, ext) => {
			const parts = file.split('/');
			let name = parts[parts.length - 1];
			if (ext && name.endsWith(ext)) {
				name = name.slice(0, -ext.length);
			}
			return name;
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('validate function', () => {
		it('should validate consistent translations successfully', () => {
			const translations = {
				'en.json': {
					welcome: 'Welcome',
					user: {
						name: 'Name',
						email: 'Email'
					}
				},
				'zh.json': {
					welcome: '欢迎',
					user: {
						name: '姓名',
						email: '邮箱'
					}
				}
			};

			setupTranslationMocks(translations);

			const result = validate({
				translationsDir: 'translations',
				baseLocale: 'en',
				strict: false
			});

			expect(result).toBe(true);
			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('✅ All translations are valid!')
			);
		});

		it('should detect missing keys', () => {
			const translations = {
				'en.json': {
					welcome: 'Welcome',
					user: {
						name: 'Name',
						email: 'Email'
					},
					footer: 'Footer text'
				},
				'zh.json': {
					welcome: '欢迎',
					user: {
						name: '姓名'
						// Missing: user.email and footer
					}
				}
			};

			setupTranslationMocks(translations);

			const result = validate({
				translationsDir: 'translations',
				baseLocale: 'en',
				strict: false
			});

			expect(result).toBe(false);
			expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('❌ Errors:'));
			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('Missing translation: user.email')
			);
			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('Missing translation: footer')
			);
		});

		it('should detect extra keys in strict mode', () => {
			const translations = {
				'en.json': {
					welcome: 'Welcome'
				},
				'zh.json': {
					welcome: '欢迎',
					extra: '额外的键'
				}
			};

			setupTranslationMocks(translations);

			const result = validate({
				translationsDir: 'translations',
				baseLocale: 'en',
				strict: true
			});

			expect(result).toBe(false);
			expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('⚠️  Warnings:'));
			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('Extra key not in base locale: extra')
			);
		});

		it('should validate placeholder consistency', () => {
			const translations = {
				'en.json': {
					greeting: 'Hello {name}!',
					count: 'You have {count} items'
				},
				'zh.json': {
					greeting: '你好！', // Missing {name} placeholder
					count: '你有 {count} 个项目'
				}
			};

			setupTranslationMocks(translations);

			const result = validate({
				translationsDir: 'translations',
				baseLocale: 'en',
				strict: false
			});

			expect(result).toBe(false);
			expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('❌ Errors:'));
			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('Missing placeholder {name} in greeting')
			);
		});

		it('should handle multiple placeholder formats', () => {
			const translations = {
				'en.json': {
					complex: 'User {name} has {count} items and {unread} messages'
				},
				'zh.json': {
					complex: '用户 {name} 有 {count} 个项目和 {unread} 条未读消息'
				}
			};

			setupTranslationMocks(translations);

			const result = validate({
				translationsDir: 'translations',
				baseLocale: 'en',
				strict: false
			});

			expect(result).toBe(true);
		});

		it('should detect mismatched placeholders', () => {
			const translations = {
				'en.json': {
					message: 'Hello {firstName} {lastName}'
				},
				'zh.json': {
					message: '你好 {fullName}' // Different placeholders
				}
			};

			setupTranslationMocks(translations);

			const result = validate({
				translationsDir: 'translations',
				baseLocale: 'en',
				strict: false
			});

			expect(result).toBe(false);
			expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('❌ Errors:'));
		});

		it('should handle nested translation structures', () => {
			const translations = {
				'en.json': {
					deep: {
						nested: {
							structure: {
								key: 'Value'
							}
						}
					}
				},
				'zh.json': {
					deep: {
						nested: {
							structure: {
								key: '值'
							}
						}
					}
				}
			};

			setupTranslationMocks(translations);

			const result = validate({
				translationsDir: 'translations',
				baseLocale: 'en',
				strict: false
			});

			expect(result).toBe(true);
		});

		it('should report type mismatches', () => {
			const translations = {
				'en.json': {
					key: 'String value',
					nested: {
						item: 'Nested string'
					}
				},
				'zh.json': {
					key: { unexpected: 'object' }, // Type mismatch: string vs object
					nested: 'String instead of object' // Type mismatch: object vs string
				}
			};

			setupTranslationMocks(translations);

			const result = validate({
				translationsDir: 'translations',
				baseLocale: 'en',
				strict: false
			});

			expect(result).toBe(false);
			expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('❌ Errors:'));
		});

		it('should handle empty translation files', () => {
			const translations = {
				'en.json': {},
				'zh.json': {}
			};

			setupTranslationMocks(translations);

			const result = validate({
				translationsDir: 'translations',
				baseLocale: 'en',
				strict: false
			});

			expect(result).toBe(true);
			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('✅ All translations are valid!')
			);
		});

		it('should handle missing base locale file', () => {
			const translations = {
				'zh.json': {
					welcome: '欢迎'
				}
			};

			setupTranslationMocks(translations);

			expect(() =>
				validate({
					translationsDir: 'translations',
					baseLocale: 'en', // Missing en.json
					strict: false
				})
			).toThrow('Base locale "en" not found');
		});

		it('should skip non-JSON files', () => {
			const translations = {
				'en.json': {
					welcome: 'Welcome'
				},
				'zh.json': {
					welcome: '欢迎'
				},
				'README.md': 'This is not a translation file',
				'.DS_Store': 'System file'
			};

			setupTranslationMocks(translations);

			const result = validate({
				translationsDir: 'translations',
				baseLocale: 'en',
				strict: false
			});

			expect(result).toBe(true);
			// Should only process JSON files
			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('Found 2 translation files')
			);
		});

		it('should handle malformed JSON gracefully', () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue(['en.json', 'zh.json'] as any);
			vi.mocked(fs.statSync).mockImplementation((_path) => {
				return {
					isFile: () => true,
					isDirectory: () => false
				} as any;
			});
			vi.mocked(fs.readFileSync).mockImplementation((file) => {
				if (file.toString().includes('en.json')) {
					return '{"valid": "json"}';
				}
				return '{ invalid json }';
			});

			expect(() =>
				validate({
					translationsDir: 'translations',
					baseLocale: 'en',
					strict: false
				})
			).toThrow();
		});

		it('should validate array values correctly', () => {
			const translations = {
				'en.json': {
					items: ['Item 1', 'Item 2', 'Item 3'],
					messages: {
						list: ['Message 1', 'Message 2']
					}
				},
				'zh.json': {
					items: ['项目 1', '项目 2', '项目 3'],
					messages: {
						list: ['消息 1', '消息 2']
					}
				}
			};

			setupTranslationMocks(translations);

			const result = validate({
				translationsDir: 'translations',
				baseLocale: 'en',
				strict: false
			});

			expect(result).toBe(true);
		});

		it('should detect array length mismatches', () => {
			const translations = {
				'en.json': {
					items: ['Item 1', 'Item 2', 'Item 3']
				},
				'zh.json': {
					items: ['项目 1', '项目 2'] // Missing one item
				}
			};

			setupTranslationMocks(translations);

			const result = validate({
				translationsDir: 'translations',
				baseLocale: 'en',
				strict: false
			});

			expect(result).toBe(false);
			expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('❌ Errors:'));
		});

		it('should provide summary of validation results', () => {
			const translations = {
				'en.json': {
					key1: 'Value 1',
					key2: 'Value 2'
				},
				'zh.json': {
					key1: '值 1'
					// Missing key2
				},
				'ja.json': {
					key1: '値 1',
					key2: '値 2'
				}
			};

			setupTranslationMocks(translations);

			validate({
				translationsDir: 'translations',
				baseLocale: 'en',
				strict: false
			});

			expect(mockConsole.log).toHaveBeenCalledWith(
				expect.stringContaining('❌ Validation failed!')
			);
		});
	});

	// Helper function to setup translation file mocks
	function setupTranslationMocks(translations: Record<string, any>) {
		const files = Object.keys(translations);

		vi.mocked(fs.existsSync).mockImplementation((path) => {
			const pathStr = path.toString();
			if (pathStr.includes('translations')) return true;
			return files.some((file) => pathStr.includes(file));
		});

		vi.mocked(fs.readdirSync).mockReturnValue(files as any);

		vi.mocked(fs.statSync).mockImplementation((path) => {
			const pathStr = path?.toString() || '';
			const isFile = files.some((f) => pathStr.includes(f));
			return {
				isFile: () => isFile,
				isDirectory: () => !isFile
			} as any;
		});

		vi.mocked(fs.readFileSync).mockImplementation((file) => {
			const fileStr = file.toString();
			const fileName = files.find((f) => fileStr.includes(f));
			if (fileName) {
				const content = translations[fileName];
				return typeof content === 'string' ? content : JSON.stringify(content);
			}
			return '{}';
		});
	}
});
