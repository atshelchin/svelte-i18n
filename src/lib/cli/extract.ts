#!/usr/bin/env node

/**
 * Extract translation keys from source code
 * Scans for t('key') and i18n.t('key') patterns
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface ExtractOptions {
	srcDir: string;
	outFile: string;
	extensions?: string[];
	exclude?: string[];
}

const DEFAULT_EXTENSIONS = ['.svelte', '.ts', '.js', '.tsx', '.jsx'];
const DEFAULT_EXCLUDE = ['node_modules', '.svelte-kit', 'dist', 'build'];

function extractKeysFromFile(filePath: string): Set<string> {
	const keys = new Set<string>();
	let content = readFileSync(filePath, 'utf-8');

	// Remove comments before extracting keys
	// Remove single-line comments
	content = content.replace(/\/\/.*$/gm, '');
	// Remove multi-line comments
	content = content.replace(/\/\*[\s\S]*?\*\//g, '');
	// Remove HTML comments
	content = content.replace(/<!--[\s\S]*?-->/g, '');

	// Match patterns like:
	// i18n.t('key')
	// i18n.t("key")
	// $t('key')
	// t('key') - but only when it's likely a translation function
	// <Trans key="key">

	// More precise patterns to avoid false positives
	const patterns = [
		// i18n.t() or any variable ending with i18n.t()
		/\bi18n\.t\s*\(\s*['"]([^'"]+)['"]/g,
		// $t() in Svelte files
		/\$t\s*\(\s*['"]([^'"]+)['"]/g,
		// Standalone t() but not import/export statements
		/(?<!export\s+)(?<!import\s+)(?<!\w)t\s*\(\s*['"]([^'"]+)['"]/g,
		// Trans component
		/<Trans\s+key\s*=\s*['"]([^'"]+)['"]/g,
		// getI18n().t()
		/getI18n\(\)\.t\s*\(\s*['"]([^'"]+)['"]/g
	];

	patterns.forEach((pattern) => {
		let match;
		while ((match = pattern.exec(content)) !== null) {
			const key = match[1];
			// Filter out obvious non-translation keys (file paths, URLs, etc.)
			if (!key.includes('/') && !key.includes('\\') && !key.startsWith('http')) {
				keys.add(key);
			}
		}
	});

	return keys;
}

function scanDirectory(dir: string, options: ExtractOptions): Set<string> {
	const allKeys = new Set<string>();

	function scan(currentDir: string) {
		const files = readdirSync(currentDir);

		for (const file of files) {
			const filePath = join(currentDir, file);
			const stats = statSync(filePath);

			if (stats.isDirectory()) {
				// Skip excluded directories
				if (options.exclude?.some((exc) => filePath.includes(exc))) {
					continue;
				}
				scan(filePath);
			} else if (stats.isFile()) {
				const ext = extname(file);
				if (options.extensions?.includes(ext)) {
					const keys = extractKeysFromFile(filePath);
					keys.forEach((key) => allKeys.add(key));
				}
			}
		}
	}

	scan(dir);
	return allKeys;
}

interface TranslationObject {
	[key: string]: string | TranslationObject;
}

function buildTranslationObject(keys: Set<string>): TranslationObject {
	const result: TranslationObject = {};

	keys.forEach((key) => {
		const parts = key.split('.');
		let current: TranslationObject = result;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];

			if (i === parts.length - 1) {
				// Last part - set the value
				if (!current[part]) {
					current[part] = '[TODO: Add translation]';
				}
			} else {
				// Intermediate part - create nested object
				if (!current[part]) {
					current[part] = {};
				} else if (typeof current[part] === 'string') {
					// If current[part] is a string (from a previous key), convert to object
					console.warn(
						`⚠️  Key conflict: "${key}" conflicts with existing key. Converting to nested structure.`
					);
					current[part] = {};
				}
				current = current[part] as TranslationObject;
			}
		}
	});

	return result;
}

export function extract(options: ExtractOptions): void {
	const config = {
		...options,
		extensions: options.extensions || DEFAULT_EXTENSIONS,
		exclude: options.exclude || DEFAULT_EXCLUDE
	};

	console.log('🔍 Extracting translation keys...');
	console.log(`  Source: ${config.srcDir}`);
	console.log(`  Extensions: ${config.extensions.join(', ')}`);

	const keys = scanDirectory(config.srcDir, config);
	console.log(`✅ Found ${keys.size} unique keys`);

	const translations = buildTranslationObject(keys);

	writeFileSync(config.outFile, JSON.stringify(translations, null, 2), 'utf-8');

	console.log(`📝 Written to ${config.outFile}`);
}

// CLI interface
// Check if this file is being run directly (ES module style)
if (import.meta.url === `file://${process.argv[1]}`) {
	const args = process.argv.slice(2);

	if (args.length < 2) {
		console.error('Usage: extract <srcDir> <outFile> [extensions...]');
		console.error('Example: extract ./src ./translations/template.json .svelte .ts');
		process.exit(1);
	}

	const [srcDir, outFile, ...extensions] = args;

	extract({
		srcDir,
		outFile,
		extensions: extensions.length > 0 ? extensions : undefined
	});
}
