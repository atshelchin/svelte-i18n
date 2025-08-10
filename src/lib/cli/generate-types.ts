#!/usr/bin/env node

/**
 * Generate TypeScript type definitions and validate translation files
 * Ensures type safety and consistency across all language files
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import * as fs from 'fs';
import path from 'path';
import { discoverStaticPackages, getPackageSchemaSource } from './package-discovery.js';

export interface GenerateTypesOptions {
	mode?: 'library' | 'app' | 'all';
	validate?: boolean;
	watch?: boolean;
}

interface ValidationError {
	file: string;
	errors: string[];
}

interface TranslationSource {
	name: string;
	dir: string;
	outputPath: string;
	defaultLocale: string;
}

interface ValidationConfig {
	packages?: string[];
	autoDiscover?: boolean;
	validationRules?: {
		allowExtraKeys?: boolean;
		requireAllKeys?: boolean;
	};
}

/**
 * Load validation configuration
 */
function loadValidationConfig(): ValidationConfig {
	const configPath = 'i18n-validation.config.json';

	if (existsSync(configPath)) {
		try {
			const content = readFileSync(configPath, 'utf-8');
			return JSON.parse(content);
		} catch {
			console.warn('⚠️ Failed to load i18n-validation.config.json, using defaults');
		}
	}

	// Default configuration
	return {
		packages: [],
		autoDiscover: true,
		validationRules: {
			allowExtraKeys: false,
			requireAllKeys: true
		}
	};
}

/**
 * Discover all packages in src/translations directory
 */
function discoverPackages(): string[] {
	const packages: string[] = [];
	const translationsDir = 'src/translations';

	if (!existsSync(translationsDir)) {
		return packages;
	}

	const entries = readdirSync(translationsDir, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.isDirectory()) {
			if (entry.name.startsWith('@')) {
				// Scoped package - check subdirectories
				const scopeDir = path.join(translationsDir, entry.name);
				const subEntries = readdirSync(scopeDir, { withFileTypes: true });

				for (const subEntry of subEntries) {
					if (subEntry.isDirectory()) {
						packages.push(`${entry.name}/${subEntry.name}`);
					}
				}
			} else if (entry.name !== 'app') {
				// Regular package (not app)
				packages.push(entry.name);
			}
		}
	}

	return packages;
}

/**
 * Get translation sources based on mode
 */
function getTranslationSources(mode: string): TranslationSource[] {
	const sources: TranslationSource[] = [];

	// Library translations (in src/translations)
	if (mode === 'library' || mode === 'all') {
		// Dynamically discover all packages
		const packages = discoverPackages();

		for (const packageName of packages) {
			const packageDir = `src/translations/${packageName}`;
			if (existsSync(packageDir)) {
				// For @shelchin/svelte-i18n, use special output path
				const outputPath =
					packageName === '@shelchin/svelte-i18n'
						? 'src/lib/types/library-i18n-generated.ts'
						: `src/types/${packageName.replace(/[/]/g, '-')}-i18n-generated.ts`;

				sources.push({
					name: packageName,
					dir: packageDir,
					outputPath,
					defaultLocale: 'en'
				});
			}
		}
	}

	// Application translations (in src/translations)
	if (mode === 'app' || mode === 'all') {
		// Only generate types from src/translations, not static
		if (existsSync('src/translations/app')) {
			sources.push({
				name: 'app',
				dir: 'src/translations/app',
				outputPath: 'src/types/app-i18n-generated.ts', // Outside lib directory
				defaultLocale: 'en'
			});
		}
	}

	// Note: We don't generate types from static/translations
	// Those are only for validation against src/translations schemas

	return sources;
}

/**
 * Recursively validate translation structure
 */
function validateStructure(
	source: Record<string, unknown>,
	target: Record<string, unknown>,
	path = '',
	errors: string[] = []
): string[] {
	// Check missing keys
	for (const key in source) {
		if (key === '_meta') continue;

		const fullPath = path ? `${path}.${key}` : key;

		if (!(key in target)) {
			errors.push(`Missing key: ${fullPath}`);
		} else if (typeof source[key] === 'object' && source[key] !== null) {
			if (typeof target[key] !== 'object' || target[key] === null) {
				errors.push(`Type mismatch at ${fullPath}: expected object, got ${typeof target[key]}`);
			} else {
				validateStructure(
					source[key] as Record<string, unknown>,
					target[key] as Record<string, unknown>,
					fullPath,
					errors
				);
			}
		} else if (typeof source[key] !== typeof target[key]) {
			errors.push(
				`Type mismatch at ${fullPath}: expected ${typeof source[key]}, got ${typeof target[key]}`
			);
		}
	}

	// Check extra keys (warnings)
	for (const key in target) {
		if (key === '_meta') continue;
		if (!(key in source)) {
			const fullPath = path ? `${path}.${key}` : key;
			errors.push(`Extra key (warning): ${fullPath}`);
		}
	}

	return errors;
}

/**
 * Generate TypeScript interface from JSON structure
 */
function generateInterface(obj: Record<string, unknown>, indent = ''): string {
	const lines: string[] = [];

	for (const [key, value] of Object.entries(obj)) {
		if (key === '_meta') continue;

		const safeKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : `"${key}"`;

		if (typeof value === 'string') {
			// Extract parameters
			const params = extractParams(value);
			if (params.length > 0) {
				lines.push(
					`${indent}${safeKey}: ParamsKey<{ ${params.map((p) => `${p}: string | number`).join('; ')} }>;`
				);
			} else {
				lines.push(`${indent}${safeKey}: string;`);
			}
		} else if (typeof value === 'object' && value !== null) {
			lines.push(`${indent}${safeKey}: {`);
			lines.push(generateInterface(value as Record<string, unknown>, indent + '\t'));
			lines.push(`${indent}};`);
		}
	}

	return lines.join('\n');
}

/**
 * Extract parameter names from a translation string
 */
function extractParams(str: string): string[] {
	const params = new Set<string>();
	const regex = /\{([^},]+)/g;
	let match;

	while ((match = regex.exec(str)) !== null) {
		const param = match[1].trim();
		// Remove any pluralization/format info
		const cleanParam = param.split(',')[0].trim();
		if (cleanParam) {
			params.add(cleanParam);
		}
	}

	return Array.from(params);
}

/**
 * Generate all possible paths from the translation object
 */
function generatePaths(obj: Record<string, unknown>, prefix = ''): string[] {
	const paths: string[] = [];

	for (const [key, value] of Object.entries(obj)) {
		if (key === '_meta') continue;

		const fullPath = prefix ? `${prefix}.${key}` : key;

		if (typeof value === 'string') {
			paths.push(fullPath);
		} else if (typeof value === 'object' && value !== null) {
			// Also add the object path itself if it has direct string values
			const hasDirectStrings = Object.values(value as Record<string, unknown>).some(
				(v) => typeof v === 'string'
			);
			if (hasDirectStrings) {
				paths.push(fullPath);
			}
			paths.push(...generatePaths(value as Record<string, unknown>, fullPath));
		}
	}

	return paths;
}

/**
 * Process a single translation source
 */
async function processTranslationSource(
	source: TranslationSource,
	validate: boolean
): Promise<boolean> {
	console.log(`\n🔍 Processing ${source.name} translations...`);
	console.log(`   Directory: ${source.dir}`);
	console.log(`   Output: ${source.outputPath}`);

	// Check if translations directory exists
	if (!existsSync(source.dir)) {
		console.log(`   ⚠️ Directory not found, skipping...`);
		return true;
	}

	// Find default language file
	const defaultFile = path.join(source.dir, `${source.defaultLocale}.json`);
	if (!existsSync(defaultFile)) {
		console.error(`   ❌ Default language file not found: ${defaultFile}`);
		return false;
	}

	// Load default language
	const defaultContent = readFileSync(defaultFile, 'utf-8');
	const defaultLang = JSON.parse(defaultContent);

	// Validate other languages if requested
	if (validate) {
		console.log(`\n   📋 Validating translations for ${source.name}...`);

		const files = readdirSync(source.dir).filter(
			(f) => f.endsWith('.json') && f !== `${source.defaultLocale}.json` && f !== 'index.json'
		);

		const validationErrors: ValidationError[] = [];

		for (const file of files) {
			const filePath = path.join(source.dir, file);
			const content = readFileSync(filePath, 'utf-8');
			const lang = JSON.parse(content);

			const errors = validateStructure(defaultLang, lang);
			if (errors.length > 0) {
				validationErrors.push({ file, errors });
			}
		}

		// Display validation results
		for (const { file, errors } of validationErrors) {
			const missingKeys = errors.filter((e) => e.includes('Missing key'));
			const warnings = errors.filter((e) => e.includes('warning'));
			const otherErrors = errors.filter(
				(e) => !e.includes('Missing key') && !e.includes('warning')
			);

			if (missingKeys.length > 0 || otherErrors.length > 0) {
				console.log(`   ❌ ${file}`);
				[...missingKeys, ...otherErrors].forEach((e) => console.log(`      ${e}`));
			} else {
				console.log(`   ✅ ${file}`);
			}

			if (warnings.length > 0) {
				warnings.forEach((w) => console.log(`      ${w}`));
			}
		}

		// Check if we should fail
		const hasErrors = validationErrors.some(({ errors }) =>
			errors.some((e) => e.includes('Missing key') || e.includes('Type mismatch'))
		);

		if (hasErrors) {
			console.log(
				`\n   ❌ Validation failed for ${source.name}! Fix missing keys before continuing.`
			);
			return false;
		}
	}

	// Generate TypeScript types
	console.log(`\n   📝 Generating TypeScript types for ${source.name}...`);

	// Ensure output directory exists
	const outputDir = path.dirname(source.outputPath);
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	// Generate interface
	const interfaceContent = generateInterface(defaultLang, '\t');
	const paths = generatePaths(defaultLang);

	// Create type definitions
	const typeContent = `/**
 * Auto-generated i18n type definitions for ${source.name}
 * DO NOT EDIT MANUALLY
 * 
 * Generated from: ${path.relative(process.cwd(), defaultFile)}
 * Generated at: ${new Date().toISOString()}
 */

// Helper type for parameters
type ParamsKey<T> = { key: string; params: T };

// Main translation structure
export interface I18nKeys {
${interfaceContent}
}

// All translation paths
export type I18nPath = ${paths.map((p) => `"${p}"`).join(' | ') || 'never'};

// Get value type for a path
type GetValue<T, P extends string> = P extends keyof T
	? T[P]
	: P extends \`\${infer K}.\${infer R}\`
		? K extends keyof T
			? T[K] extends Record<string, unknown>
				? GetValue<T[K], R>
				: never
			: never
		: never;

// Extract params from value
type ExtractParams<V> = V extends ParamsKey<infer P> ? P : never;

// Type-safe translation function
export interface TypedI18n {
	<P extends I18nPath>(
		key: P,
		...params: ExtractParams<GetValue<I18nKeys, P>> extends never
			? []
			: [ExtractParams<GetValue<I18nKeys, P>>]
	): string;
}

// Create typed i18n instance
export function createTypedI18n(t: (key: string, params?: Record<string, unknown>) => string): TypedI18n {
	return ((key: string, params?: Record<string, unknown>) => t(key, params)) as TypedI18n;
}

// Export all paths for runtime validation
export const I18N_PATHS = ${JSON.stringify(paths, null, '\t')} as const;
`;

	// Write the file
	writeFileSync(source.outputPath, typeContent, 'utf-8');

	console.log(`   ✅ Generated ${paths.length} type-safe translation paths`);
	console.log(`   ✅ Written to ${path.relative(process.cwd(), source.outputPath)}`);

	// Generate module augmentation - detect if we're in development or using npm package
	if (source.name === 'app') {
		// Check if we're in the svelte-i18n development project or an external project
		const isInternalDev =
			process.cwd().includes('svelte-i18n') && fs.existsSync(path.join(process.cwd(), 'src/lib'));

		// Determine the module to augment
		const moduleToAugment = isInternalDev ? '$lib' : '@shelchin/svelte-i18n';
		// Always import types from the main export, not internal paths
		const importFrom = isInternalDev ? '$lib' : '@shelchin/svelte-i18n';

		const augmentationContent = `/**
 * Module augmentation for type-safe i18n
 * Auto-generated - DO NOT EDIT MANUALLY
 * 
 * Note: For better type safety, consider using createTypedI18n instead:
 * import { createTypedI18n } from '@shelchin/svelte-i18n';
 * export const { getI18n, setupI18n } = createTypedI18n<I18nPath>();
 */

import type { I18nPath } from './app-i18n-generated';
import type { 
	I18nConfig,
	LanguageMeta,
	InterpolationParams,
	TranslationSchema,
	TranslationFile
} from '${importFrom}';

declare module '${moduleToAugment}' {
	export interface I18nInstance {
		locale: string;
		locales: string[];
		isLoading: boolean;
		errors: Record<string, string[]>;
		meta: Record<string, LanguageMeta>;
		t(key: I18nPath, params?: InterpolationParams): string;
		setLocale(locale: string): Promise<void>;
		loadLanguage(locale: string, source?: string | TranslationSchema | TranslationFile): Promise<void>;
		validateTranslations(locale: string, schema?: TranslationSchema): boolean;
		formatDate(date: Date | number | string, preset?: string): string;
		formatTime(date: Date | number | string, preset?: string): string;
		formatNumber(num: number, preset?: string): string;
		formatCurrency(num: number, currency?: string): string;
		formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string;
		formatList(items: string[], type?: 'conjunction' | 'disjunction' | 'unit'): string;
		detectBrowserLanguage(): string | null;
		getNamespace(): string | undefined;
		canShowValidationPopup(): boolean;
		setActiveValidationPopup(active: boolean): void;
		clientLoad(): Promise<void>;
	}
	
	export function getI18n(): I18nInstance;
	export function setupI18n(config: I18nConfig): I18nInstance;
}

export {};
`;

		const augmentationPath = path.join(outputDir, 'i18n-augmentation.d.ts');
		writeFileSync(augmentationPath, augmentationContent, 'utf-8');
		console.log(
			`   ✅ Generated module augmentation (${moduleToAugment}) at ${path.relative(process.cwd(), augmentationPath)}`
		);

		if (!isInternalDev) {
			// For external users, also show how to use createTypedI18n
			console.log(`
   ℹ️  For better type safety, consider using createTypedI18n instead:
   
   // src/lib/i18n.ts
   import { createTypedI18n } from '@shelchin/svelte-i18n';
   import type { I18nPath } from './types/i18n-generated';
   
   export const { getI18n, setupI18n } = createTypedI18n<I18nPath>();
			`);
		}
	}

	return true;
}

/**
 * Validate static translation files against generated types
 */
async function validateStaticTranslations(): Promise<boolean> {
	console.log('\n📋 Validating static translations...');

	const staticDir = 'static/translations';
	if (!existsSync(staticDir)) {
		console.log('   No static/translations directory found');
		return true;
	}

	// Load validation configuration
	const config = loadValidationConfig();

	// Discover packages to validate
	const packagesToValidate = discoverStaticPackages(staticDir, config);

	if (packagesToValidate.length === 0) {
		console.log('   No packages found to validate');
		return true;
	}

	console.log(
		`   Found ${packagesToValidate.length} package(s) to validate: ${packagesToValidate.join(', ')}`
	);

	let hasErrors = false;

	for (const packageName of packagesToValidate) {
		// Build the actual directory path
		let actualTranslationDir: string;
		if (packageName.includes('/')) {
			// Scoped package
			const [scope, name] = packageName.split('/');
			actualTranslationDir = path.join(staticDir, scope, name);
		} else {
			actualTranslationDir = path.join(staticDir, packageName);
		}

		console.log(`\n   Validating ${packageName} static translations...`);

		// Validate each static translation file
		const staticFiles = existsSync(actualTranslationDir)
			? readdirSync(actualTranslationDir).filter((f) => f.endsWith('.json') && f !== 'index.json')
			: [];

		if (staticFiles.length === 0) {
			console.log(`   No translation files found in ${packageName}`);
			continue;
		}

		// Get schema for validation
		let { schema, source: schemaSource } = getPackageSchemaSource(packageName);

		// Fallback: use en.json from static if no schema found
		if (!schema) {
			const staticDefaultFile = path.join(actualTranslationDir, 'en.json');
			if (existsSync(staticDefaultFile)) {
				const content = readFileSync(staticDefaultFile, 'utf-8');
				schema = JSON.parse(content);
				schemaSource = `static ${packageName}/en.json`;
			} else if (staticFiles.length > 0) {
				// Last resort: use first file as reference
				const firstFile = staticFiles[0];
				const firstFilePath = path.join(actualTranslationDir, firstFile);
				const content = readFileSync(firstFilePath, 'utf-8');
				schema = JSON.parse(content);
				schemaSource = `first file ${packageName}/${firstFile}`;
			}
		}

		if (!schema) {
			console.log(`   ⚠️ No schema available for validation`);
			continue;
		}

		console.log(`   Using schema: ${schemaSource}`);

		// Validate each file against the schema
		for (const file of staticFiles) {
			// Skip the file if it was used as schema
			if (schemaSource.includes(file)) {
				console.log(`   ✅ ${packageName}/${file} (used as schema)`);
				continue;
			}

			const filePath = path.join(actualTranslationDir, file);
			const content = readFileSync(filePath, 'utf-8');
			const translations = JSON.parse(content);

			const errors = validateStructure(schema, translations);

			if (errors.length > 0) {
				const missingKeys = errors.filter((e) => e.includes('Missing key'));
				const otherErrors = errors.filter(
					(e) => !e.includes('Missing key') && !e.includes('warning')
				);

				if (missingKeys.length > 0 || otherErrors.length > 0) {
					console.log(`   ❌ ${packageName}/${file}`);
					[...missingKeys, ...otherErrors].forEach((e) => console.log(`      ${e}`));
					hasErrors = true;
				} else {
					console.log(`   ✅ ${packageName}/${file}`);
				}
			} else {
				console.log(`   ✅ ${packageName}/${file}`);
			}
		}
	}

	return !hasErrors;
}

/**
 * Main function to generate types for all translation sources
 */
export async function generateTypes(options: GenerateTypesOptions = {}): Promise<boolean> {
	const { mode = 'all', validate = true } = options;

	console.log('🌍 svelte-i18n Type Generator');
	console.log('=============================');

	// Get translation sources based on mode
	const sources = getTranslationSources(mode);

	if (sources.length === 0) {
		console.error('❌ No translation sources found in src/translations!');
		console.log('   Types are generated from src/translations, not static/translations');
		return false;
	}

	console.log(`\n📂 Found ${sources.length} translation source(s):`);
	sources.forEach((s) => console.log(`   - ${s.name} (${s.dir})`));

	// Process each source
	let allSuccess = true;
	for (const source of sources) {
		const success = await processTranslationSource(source, validate);
		if (!success) {
			allSuccess = false;
		}
	}

	// Validate static translations if validation is enabled
	if (validate) {
		const staticValid = await validateStaticTranslations();
		if (!staticValid) {
			console.log('\n⚠️ Some static translations have validation errors');
			allSuccess = false;
		}
	}

	if (allSuccess) {
		console.log('\n✨ All type definitions generated and validations passed!');
		console.log('\n📘 Usage:');
		console.log(
			'   For library types: import { I18nPath } from "$lib/types/library-i18n-generated"'
		);
		console.log('   For app types: import { I18nPath } from "src/types/app-i18n-generated"');
		console.log('\n   The default getI18n from "$lib" is now type-safe!');
	} else {
		console.log('\n⚠️ Some operations failed. Please check the errors above.');
	}

	return allSuccess;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
	const args = process.argv.slice(2);
	const options: GenerateTypesOptions = {};

	// Parse arguments
	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case '--mode':
				options.mode = args[++i] as 'library' | 'app' | 'all';
				break;
			case '--no-validate':
				options.validate = false;
				break;
			case '--watch':
				options.watch = true;
				break;
			case '--help':
				console.log(`
Usage: generate-types [options]

Options:
  --mode <mode>     Generate types for: library, app, or all (default: all)
  --no-validate     Skip validation of other language files
  --watch           Watch for changes and regenerate (not implemented yet)
  --help            Show this help message

Examples:
  npm run i18n:types                    # Generate all types with validation
  npm run i18n:types -- --mode app      # Generate only app types
  npm run i18n:types -- --no-validate   # Skip validation
`);
				process.exit(0);
		}
	}

	generateTypes(options).then((success) => {
		process.exit(success ? 0 : 1);
	});
}
