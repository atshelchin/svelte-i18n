#!/usr/bin/env node

/**
 * Generate TypeScript type definitions from translation files
 * Automatically detects project type and generates appropriate types
 */

import fs from 'fs';
import path from 'path';
import { detectProjectType, generateTypeDefinitions } from './utils.js';

// ANSI color codes
const colors = {
	reset: '\x1b[0m',
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m'
};

function success(message: string) {
	console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function error(message: string) {
	console.error(`${colors.red}❌ ${message}${colors.reset}`);
}

function info(message: string) {
	console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function warn(message: string) {
	console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

export interface GenerateTypesOptions {
	translationsDir?: string;
	outFile?: string;
	defaultLocale?: string;
	validate?: boolean;
	lib?: boolean;
}

/**
 * Validate translation files for consistency
 */
function validateTranslations(translationsDir: string, baseLocale: string = 'en'): boolean {
	if (!fs.existsSync(translationsDir)) {
		error(`Translations directory not found: ${translationsDir}`);
		return false;
	}
	
	const files = fs.readdirSync(translationsDir)
		.filter(f => f.endsWith('.json'))
		.sort();
		
	if (files.length === 0) {
		warn('No translation files found');
		return true;
	}
	
	// Load base translation
	const basePath = path.join(translationsDir, `${baseLocale}.json`);
	if (!fs.existsSync(basePath)) {
		error(`Base locale file not found: ${basePath}`);
		return false;
	}
	
	const baseTranslation = JSON.parse(fs.readFileSync(basePath, 'utf8'));
	const baseKeys = new Set<string>();
	
	function extractKeys(obj: any, prefix: string = '') {
		for (const key in obj) {
			const fullPath = prefix ? `${prefix}.${key}` : key;
			if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
				extractKeys(obj[key], fullPath);
			} else {
				baseKeys.add(fullPath);
			}
		}
	}
	
	extractKeys(baseTranslation);
	
	// Validate other files
	let hasErrors = false;
	for (const file of files) {
		if (file === `${baseLocale}.json`) continue;
		
		const filePath = path.join(translationsDir, file);
		const translation = JSON.parse(fs.readFileSync(filePath, 'utf8'));
		const fileKeys = new Set<string>();
		
		extractKeys(translation);
		
		// Check for missing keys
		const missingKeys = Array.from(baseKeys).filter(k => !fileKeys.has(k));
		const extraKeys = Array.from(fileKeys).filter(k => !baseKeys.has(k));
		
		if (missingKeys.length > 0) {
			error(`${file}: Missing keys: ${missingKeys.join(', ')}`);
			hasErrors = true;
		}
		
		if (extraKeys.length > 0) {
			warn(`${file}: Extra keys: ${extraKeys.join(', ')}`);
		}
	}
	
	return !hasErrors;
}

export async function generateTypes(options: GenerateTypesOptions = {}): Promise<boolean> {
	const projectRoot = process.cwd();
	
	// Detect project type if not explicitly specified
	const projectType = detectProjectType(projectRoot);
	
	// Determine what to generate based on options and project type
	let generateApp = false;
	let generateLib = false;
	
	if (options.lib) {
		// Explicitly requested library types
		generateLib = true;
	} else if (options.translationsDir || options.outFile) {
		// Custom paths provided - use them
		const translationsDir = options.translationsDir || 'src/translations/locales';
		const outFile = options.outFile || 'src/types/app-i18n-generated.d.ts';
		
		info(`Generating types from ${translationsDir}...`);
		
		try {
			generateTypeDefinitions(
				path.join(projectRoot, translationsDir),
				path.join(projectRoot, outFile),
				'I18nPath'
			);
			success(`Generated types at ${outFile}`);
			
			if (options.validate !== false) {
				info('Validating translations...');
				const isValid = validateTranslations(
					path.join(projectRoot, translationsDir),
					options.defaultLocale || 'en'
				);
				if (!isValid) {
					error('Translation validation failed');
					return false;
				}
				success('All translations are valid');
			}
			
			return true;
		} catch (err: any) {
			error(`Failed to generate types: ${err.message}`);
			return false;
		}
	} else {
		// Auto-detect what to generate
		if (projectType.isApp) generateApp = true;
		if (projectType.isPackage) generateLib = true;
	}
	
	let allSuccess = true;
	
	// Generate application types
	if (generateApp) {
		const appTranslationsDir = path.join(projectRoot, 'src/translations/locales');
		const appTypesPath = path.join(projectRoot, 'src/types/app-i18n-generated.d.ts');
		
		if (fs.existsSync(appTranslationsDir)) {
			info('Generating application types...');
			try {
				generateTypeDefinitions(appTranslationsDir, appTypesPath, 'I18nPath');
				success(`Generated app types at ${appTypesPath}`);
				
				if (options.validate !== false) {
					info('Validating app translations...');
					const isValid = validateTranslations(appTranslationsDir, options.defaultLocale || 'en');
					if (!isValid) {
						error('App translation validation failed');
						allSuccess = false;
					} else {
						success('App translations are valid');
					}
				}
			} catch (err: any) {
				error(`Failed to generate app types: ${err.message}`);
				allSuccess = false;
			}
		} else {
			warn('Application translations not found. Run "svelte-i18n init" first.');
		}
	}
	
	// Generate library types
	if (generateLib) {
		const libTranslationsDir = path.join(projectRoot, 'src/lib/translations/locales');
		const libTypesPath = path.join(projectRoot, 'src/lib/types/lib-i18n-generated.d.ts');
		
		if (fs.existsSync(libTranslationsDir)) {
			info('Generating library types...');
			try {
				generateTypeDefinitions(libTranslationsDir, libTypesPath, 'LibI18nPath');
				success(`Generated library types at ${libTypesPath}`);
				
				if (options.validate !== false) {
					info('Validating library translations...');
					const isValid = validateTranslations(libTranslationsDir, options.defaultLocale || 'en');
					if (!isValid) {
						error('Library translation validation failed');
						allSuccess = false;
					} else {
						success('Library translations are valid');
					}
				}
			} catch (err: any) {
				error(`Failed to generate library types: ${err.message}`);
				allSuccess = false;
			}
		} else {
			warn('Library translations not found. Run "svelte-i18n init" first.');
		}
	}
	
	if (!generateApp && !generateLib) {
		error('No translations found. Run "svelte-i18n init" first to set up i18n.');
		return false;
	}
	
	return allSuccess;
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
	const args = process.argv.slice(2);
	const options: GenerateTypesOptions = {};
	
	// Parse command line arguments
	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case '--dir':
			case '-d':
				options.translationsDir = args[++i];
				break;
			case '--out':
			case '-o':
				options.outFile = args[++i];
				break;
			case '--locale':
			case '-l':
				options.defaultLocale = args[++i];
				break;
			case '--no-validate':
				options.validate = false;
				break;
			case '--lib':
				options.lib = true;
				break;
		}
	}
	
	generateTypes(options)
		.then(success => {
			process.exit(success ? 0 : 1);
		})
		.catch(error => {
			console.error('Error:', error);
			process.exit(1);
		});
}