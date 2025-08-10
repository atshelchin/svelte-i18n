#!/usr/bin/env node

/**
 * Validate translation files
 * Checks for missing keys, type mismatches, and consistency
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { validateSchema } from '../lib/domain/services/utils.js';
import type { TranslationSchema } from '../lib/domain/models/types.js';

interface ValidateOptions {
	translationsDir: string;
	baseLocale?: string;
	strict?: boolean;
	namespace?: string;
}

interface ValidationResult {
	locale: string;
	errors: string[];
	warnings: string[];
}

function loadTranslationFile(filePath: string): Record<string, unknown> {
	try {
		const content = readFileSync(filePath, 'utf-8');
		return JSON.parse(content);
	} catch (error) {
		throw new Error(`Failed to load ${filePath}: ${error}`);
	}
}

function getTranslationFiles(dir: string): Map<string, Record<string, unknown>> {
	const translations = new Map<string, Record<string, unknown>>();
	const files = readdirSync(dir);

	for (const file of files) {
		const filePath = join(dir, file);
		const stats = statSync(filePath);

		if (stats.isFile() && file.endsWith('.json')) {
			const locale = basename(file, '.json');
			const content = loadTranslationFile(filePath);

			// Remove _meta field for validation
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { _meta, ...translationContent } = content;
			translations.set(locale, translationContent);
		}
	}

	return translations;
}

function validateTranslations(
	translations: Map<string, Record<string, unknown>>,
	options: ValidateOptions
): ValidationResult[] {
	const results: ValidationResult[] = [];

	// Determine base locale
	const baseLocale = options.baseLocale || 'en';
	const baseTranslations = translations.get(baseLocale);

	if (!baseTranslations) {
		throw new Error(`Base locale "${baseLocale}" not found`);
	}

	// Validate each locale against the base
	for (const [locale, content] of translations) {
		if (locale === baseLocale) continue;

		const result: ValidationResult = {
			locale,
			errors: [],
			warnings: []
		};

		// Use the validateSchema utility
		const schemaErrors = validateSchema(content, baseTranslations as TranslationSchema);
		result.errors.push(...schemaErrors);

		// Additional validations
		if (options.strict) {
			// Check for extra keys not in base
			const extraKeys = findExtraKeys(content, baseTranslations);
			extraKeys.forEach((key) => {
				result.warnings.push(`Extra key not in base locale: ${key}`);
			});

			// Check for placeholder mismatches
			const placeholderErrors = checkPlaceholders(content, baseTranslations);
			result.errors.push(...placeholderErrors);
		}

		results.push(result);
	}

	return results;
}

function findExtraKeys(
	obj: Record<string, unknown>,
	base: Record<string, unknown>,
	prefix = ''
): string[] {
	const extra: string[] = [];

	for (const key in obj) {
		const fullKey = prefix ? `${prefix}.${key}` : key;

		if (!(key in base)) {
			extra.push(fullKey);
		} else if (
			typeof obj[key] === 'object' &&
			obj[key] !== null &&
			typeof base[key] === 'object' &&
			base[key] !== null
		) {
			extra.push(
				...findExtraKeys(
					obj[key] as Record<string, unknown>,
					base[key] as Record<string, unknown>,
					fullKey
				)
			);
		}
	}

	return extra;
}

function checkPlaceholders(obj: Record<string, unknown>, base: Record<string, unknown>): string[] {
	const errors: string[] = [];

	function extractPlaceholders(str: string): Set<string> {
		const placeholders = new Set<string>();
		const regex = /\{([^}]+)\}/g;
		let match;

		while ((match = regex.exec(str)) !== null) {
			placeholders.add(match[1]);
		}

		return placeholders;
	}

	function check(current: Record<string, unknown>, reference: Record<string, unknown>, path = '') {
		for (const key in reference) {
			const fullPath = path ? `${path}.${key}` : key;

			if (typeof reference[key] === 'string' && typeof current[key] === 'string') {
				const refPlaceholders = extractPlaceholders(reference[key]);
				const curPlaceholders = extractPlaceholders(current[key]);

				// Check if all reference placeholders exist in current
				refPlaceholders.forEach((placeholder) => {
					if (!curPlaceholders.has(placeholder)) {
						errors.push(`Missing placeholder {${placeholder}} in ${fullPath}`);
					}
				});

				// Check for extra placeholders
				curPlaceholders.forEach((placeholder) => {
					if (!refPlaceholders.has(placeholder)) {
						errors.push(`Extra placeholder {${placeholder}} in ${fullPath}`);
					}
				});
			} else if (
				typeof reference[key] === 'object' &&
				reference[key] !== null &&
				typeof current[key] === 'object' &&
				current[key] !== null
			) {
				check(
					current[key] as Record<string, unknown>,
					reference[key] as Record<string, unknown>,
					fullPath
				);
			}
		}
	}

	check(obj, base);
	return errors;
}

export function validate(options: ValidateOptions): boolean {
	console.log('🔍 Validating translations...');
	console.log(`  Directory: ${options.translationsDir}`);
	console.log(`  Base locale: ${options.baseLocale || 'en'}`);
	console.log(`  Strict mode: ${options.strict ? 'Yes' : 'No'}`);

	const translations = getTranslationFiles(options.translationsDir);
	console.log(`  Found ${translations.size} translation files`);

	const results = validateTranslations(translations, options);

	let hasErrors = false;

	results.forEach((result) => {
		if (result.errors.length > 0 || result.warnings.length > 0) {
			console.log(`\n📋 ${result.locale}:`);

			if (result.errors.length > 0) {
				hasErrors = true;
				console.log('  ❌ Errors:');
				result.errors.forEach((error) => {
					console.log(`    • ${error}`);
				});
			}

			if (result.warnings.length > 0) {
				console.log('  ⚠️  Warnings:');
				result.warnings.forEach((warning) => {
					console.log(`    • ${warning}`);
				});
			}
		} else {
			console.log(`✅ ${result.locale}: No issues found`);
		}
	});

	if (!hasErrors) {
		console.log('\n✅ All translations are valid!');
		return true;
	} else {
		console.log('\n❌ Validation failed!');
		return false;
	}
}

// CLI interface
// Check if this file is being run directly (ES module style)
if (import.meta.url === `file://${process.argv[1]}`) {
	const args = process.argv.slice(2);

	if (args.length < 1) {
		console.error('Usage: validate <translationsDir> [options]');
		console.error('Options:');
		console.error('  --base <locale>  Base locale for comparison (default: en)');
		console.error('  --strict         Enable strict validation');
		console.error('Example: validate ./static/translations --base en --strict');
		process.exit(1);
	}

	const translationsDir = args[0];
	let baseLocale = 'en';
	let strict = false;

	for (let i = 1; i < args.length; i++) {
		if (args[i] === '--base' && args[i + 1]) {
			baseLocale = args[i + 1];
			i++;
		} else if (args[i] === '--strict') {
			strict = true;
		}
	}

	const isValid = validate({
		translationsDir,
		baseLocale,
		strict
	});

	process.exit(isValid ? 0 : 1);
}
