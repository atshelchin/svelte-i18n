import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { extract } from '$lib/cli/extract.js';

// Mock fs and path modules
vi.mock('fs');
vi.mock('path');

describe('CLI Extract', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Setup default mocks
		vi.mocked(path.resolve).mockImplementation((...args) => args.join('/'));
		vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
		vi.mocked(path.extname).mockImplementation((file) => {
			const parts = file.split('.');
			return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
		});
	});

	describe('extract function', () => {
		it('should extract translation keys from Svelte files', () => {
			const mockFileContent = `
				<script>
					import { i18n } from './i18n';
					const message = i18n.t('welcome.message');
					const user = $t('user.name');
				</script>
				
				<h1>{$t('page.title')}</h1>
				<p>{i18n.t('page.description')}</p>
			`;

			setupFileMocks({
				'src/routes/+page.svelte': mockFileContent
			});

			let capturedOutput: any;
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file?.toString().includes('extracted.json')) {
					capturedOutput = JSON.parse(content?.toString() || '{}');
				}
			});

			extract({
				outFile: 'extracted.json',
				srcDir: 'src',
				extensions: ['.svelte']
			});

			expect(capturedOutput).toEqual({
				welcome: {
					message: '[TODO: Add translation]'
				},
				user: {
					name: '[TODO: Add translation]'
				},
				page: {
					title: '[TODO: Add translation]',
					description: '[TODO: Add translation]'
				}
			});
		});

		it('should extract keys from TypeScript files', () => {
			const mockFileContent = `
				import { getI18n } from '@shelchin/svelte-i18n';
				
				const i18n = getI18n();
				
				function test() {
					const msg1 = i18n.t('error.notFound');
					const msg2 = t('error.unauthorized');
					return getI18n().t('error.serverError');
				}
			`;

			setupFileMocks({
				'src/lib/utils.ts': mockFileContent
			});

			let capturedOutput: any;
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file?.toString().includes('extracted.json')) {
					capturedOutput = JSON.parse(content?.toString() || '{}');
				}
			});

			extract({
				outFile: 'extracted.json',
				srcDir: 'src',
				extensions: ['.ts']
			});

			expect(capturedOutput).toEqual({
				error: {
					notFound: '[TODO: Add translation]',
					unauthorized: '[TODO: Add translation]',
					serverError: '[TODO: Add translation]'
				}
			});
		});

		it('should handle Trans component syntax', () => {
			const mockFileContent = `
				<Trans key="welcome.hero" />
				<Trans key="features.item1">Default text</Trans>
				<Trans key="features.item2" params={{name: 'John'}} />
			`;

			setupFileMocks({
				'src/components/Home.svelte': mockFileContent
			});

			let capturedOutput: any;
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file?.toString().includes('extracted.json')) {
					capturedOutput = JSON.parse(content?.toString() || '{}');
				}
			});

			extract({
				outFile: 'extracted.json',
				srcDir: 'src',
				extensions: ['.svelte']
			});

			expect(capturedOutput).toEqual({
				welcome: {
					hero: '[TODO: Add translation]'
				},
				features: {
					item1: '[TODO: Add translation]',
					item2: '[TODO: Add translation]'
				}
			});
		});

		it('should merge keys from multiple files', () => {
			setupFileMocks({
				'src/page1.svelte': `{$t('common.title')} {$t('page1.content')}`,
				'src/page2.svelte': `{$t('common.title')} {$t('page2.content')}`,
				'src/page3.ts': `t('common.footer'); t('page3.data');`
			});

			let capturedOutput: any;
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file?.toString().includes('extracted.json')) {
					capturedOutput = JSON.parse(content?.toString() || '{}');
				}
			});

			extract({
				outFile: 'extracted.json',
				srcDir: 'src',
				extensions: ['.svelte', '.ts']
			});

			expect(capturedOutput).toEqual({
				common: {
					title: '[TODO: Add translation]',
					footer: '[TODO: Add translation]'
				},
				page1: {
					content: '[TODO: Add translation]'
				},
				page2: {
					content: '[TODO: Add translation]'
				},
				page3: {
					data: '[TODO: Add translation]'
				}
			});
		});

		it('should exclude node_modules and build directories', () => {
			const mockFiles = {
				'src/app.svelte': `{$t('app.title')}`,
				'node_modules/pkg/index.js': `t('should.not.extract')`,
				'.svelte-kit/file.js': `t('should.not.extract')`,
				'dist/bundle.js': `t('should.not.extract')`,
				'build/output.js': `t('should.not.extract')`
			};

			setupFileMocks(mockFiles);
			
			// Mock path.join to work correctly with the scanner
			vi.mocked(path.join).mockImplementation((...args) => {
				return args.filter(a => a).join('/');
			});

			let capturedOutput: any;
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file?.toString().includes('extracted.json')) {
					capturedOutput = JSON.parse(content?.toString() || '{}');
				}
			});

			extract({
				outFile: 'extracted.json',
				srcDir: '.',
				extensions: ['.svelte', '.js']
			});

			expect(capturedOutput).toEqual({
				app: {
					title: '[TODO: Add translation]'
				}
			});
			expect(capturedOutput).not.toHaveProperty('should');
		});

		it('should handle deeply nested keys', () => {
			const mockFileContent = `
				{$t('level1.level2.level3.level4.key')}
				{$t('level1.level2.another')}
				{$t('level1.different.branch')}
			`;

			setupFileMocks({
				'src/deep.svelte': mockFileContent
			});

			let capturedOutput: any;
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file?.toString().includes('extracted.json')) {
					capturedOutput = JSON.parse(content?.toString() || '{}');
				}
			});

			extract({
				outFile: 'extracted.json',
				srcDir: 'src',
				extensions: ['.svelte']
			});

			expect(capturedOutput).toEqual({
				level1: {
					level2: {
						level3: {
							level4: {
								key: '[TODO: Add translation]'
							}
						},
						another: '[TODO: Add translation]'
					},
					different: {
						branch: '[TODO: Add translation]'
					}
				}
			});
		});

		it('should handle keys with special characters', () => {
			const mockFileContent = `
				{$t('special-key.with-dash')}
				{$t('key_with_underscore')}
				{$t('key123.with456.numbers789')}
			`;

			setupFileMocks({
				'src/special.svelte': mockFileContent
			});

			let capturedOutput: any;
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file?.toString().includes('extracted.json')) {
					capturedOutput = JSON.parse(content?.toString() || '{}');
				}
			});

			extract({
				outFile: 'extracted.json',
				srcDir: 'src',
				extensions: ['.svelte']
			});

			expect(capturedOutput).toEqual({
				'special-key': {
					'with-dash': '[TODO: Add translation]'
				},
				'key_with_underscore': '[TODO: Add translation]',
				'key123': {
					'with456': {
						'numbers789': '[TODO: Add translation]'
					}
				}
			});
		});

		it('should handle empty directory gracefully', () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue([]);
			vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

			let capturedOutput: any;
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file?.toString().includes('extracted.json')) {
					capturedOutput = JSON.parse(content?.toString() || '{}');
				}
			});

			extract({
				outFile: 'extracted.json',
				srcDir: 'src',
				extensions: ['.svelte']
			});

			expect(capturedOutput).toEqual({});
		});

		it('should not extract keys from comments', () => {
			const mockFileContent = `
				// This is a comment with t('comment.key')
				/* Multi-line comment
				   with $t('another.comment.key')
				*/
				const real = t('real.key');
				<!-- HTML comment {$t('html.comment')} -->
			`;

			setupFileMocks({
				'src/comments.svelte': mockFileContent
			});

			let capturedOutput: any;
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file?.toString().includes('extracted.json')) {
					capturedOutput = JSON.parse(content?.toString() || '{}');
				}
			});

			extract({
				outFile: 'extracted.json',
				srcDir: 'src',
				extensions: ['.svelte']
			});

			// Should only extract the real key, not from comments
			expect(capturedOutput).toEqual({
				real: {
					key: '[TODO: Add translation]'
				}
			});
		});

		it('should handle duplicate keys', () => {
			const mockFileContent = `
				{$t('duplicate.key')}
				{$t('duplicate.key')}
				{i18n.t('duplicate.key')}
			`;

			setupFileMocks({
				'src/duplicates.svelte': mockFileContent
			});

			let capturedOutput: any;
			vi.mocked(fs.writeFileSync).mockImplementation((file, content) => {
				if (file?.toString().includes('extracted.json')) {
					capturedOutput = JSON.parse(content?.toString() || '{}');
				}
			});

			extract({
				outFile: 'extracted.json',
				srcDir: 'src',
				extensions: ['.svelte']
			});

			// Should only have one entry for duplicate key
			expect(capturedOutput).toEqual({
				duplicate: {
					key: '[TODO: Add translation]'
				}
			});
		});
	});

	// Helper function to setup file system mocks
	function setupFileMocks(files: Record<string, string>) {
		const fileEntries = Object.entries(files);
		
		vi.mocked(fs.existsSync).mockImplementation((path) => {
			const pathStr = path?.toString() || '';
			// Check if it's a file
			if (fileEntries.some(([file]) => pathStr.endsWith(file))) {
				return true;
			}
			// Check if it's a directory that contains files
			if (fileEntries.some(([file]) => file.startsWith(pathStr))) {
				return true;
			}
			// Check for excluded directories
			if (pathStr.includes('node_modules') || 
				pathStr.includes('.svelte-kit') || 
				pathStr.includes('dist') || 
				pathStr.includes('build')) {
				return true;
			}
			return false;
		});

		vi.mocked(fs.statSync).mockImplementation((path) => {
			const pathStr = path?.toString() || '';
			const isFile = fileEntries.some(([file]) => pathStr.endsWith(file));
			return {
				isDirectory: () => !isFile,
				isFile: () => isFile
			} as any;
		});

		vi.mocked(fs.readdirSync).mockImplementation((dir) => {
			const dirStr = dir?.toString() || '';
			
			// Special handling for excluded directories
			if (dirStr.includes('node_modules') || 
				dirStr.includes('.svelte-kit') || 
				dirStr.includes('dist') || 
				dirStr.includes('build')) {
				return [] as any;
			}
			
			// Handle root directory
			if (dirStr === '.' || dirStr === '') {
				// Return top-level directories and files
				const topLevel = new Set<string>();
				fileEntries.forEach(([file]) => {
					const firstPart = file.split('/')[0];
					topLevel.add(firstPart);
				});
				return Array.from(topLevel) as any;
			}
			
			// Return files that belong to this directory
			const filesInDir = fileEntries
				.filter(([file]) => {
					const fileDir = file.substring(0, file.lastIndexOf('/'));
					return fileDir === dirStr;
				})
				.map(([file]) => {
					const parts = file.split('/');
					return parts[parts.length - 1];
				});
			
			// Add subdirectories
			const subDirs = new Set<string>();
			fileEntries.forEach(([file]) => {
				if (file.startsWith(dirStr + '/')) {
					const relativePath = file.substring(dirStr.length + 1);
					const firstPart = relativePath.split('/')[0];
					if (firstPart && !filesInDir.includes(firstPart) && !firstPart.includes('/')) {
						subDirs.add(firstPart);
					}
				}
			});
			
			return [...Array.from(subDirs), ...filesInDir] as any;
		});

		vi.mocked(fs.readFileSync).mockImplementation((file) => {
			const fileStr = file?.toString() || '';
			const entry = fileEntries.find(([f]) => fileStr.endsWith(f));
			return entry ? entry[1] : '';
		});

		vi.mocked(fs.writeFileSync).mockImplementation(() => {});
	}
});