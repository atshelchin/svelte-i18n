/**
 * Type discovery utilities for third-party packages
 * Automatically finds and loads i18n types from packages
 */

import { existsSync, readFileSync } from 'fs';

/**
 * Try to discover i18n types from a package
 * @param packageName - Name of the package to check
 * @returns The I18N_PATHS array if found, or null
 */
export async function discoverPackageTypes(packageName: string): Promise<string[] | null> {
	try {
		// Try standard export path first
		const typesModule = await import(`${packageName}/i18n-types`);
		if (typesModule.I18N_PATHS) {
			console.log(`   ✅ Found types from ${packageName}/i18n-types`);
			return typesModule.I18N_PATHS;
		}
	} catch {
		// Try alternative paths
	}

	// Try to find package.json and check exports
	try {
		const packageJsonPath = require.resolve(`${packageName}/package.json`);
		const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

		// Check if package has i18n-types export
		if (packageJson.exports?.['./i18n-types']) {
			const typesPath = packageJson.exports['./i18n-types'];
			console.log(`   Found i18n-types export in package.json: ${typesPath}`);
		}
	} catch {
		// Package not found or no exports
	}

	return null;
}

/**
 * Get validation schema for a package
 * First tries to get TypeScript types, then falls back to JSON schema
 */
export async function getPackageSchema(packageName: string): Promise<{
	paths?: string[];
	schema?: Record<string, unknown>;
	source: string;
} | null> {
	// Try to get TypeScript types first
	const paths = await discoverPackageTypes(packageName);
	if (paths) {
		return {
			paths,
			source: `TypeScript types from ${packageName}/i18n-types`
		};
	}

	// Fall back to JSON schema from default language file
	const possiblePaths = [
		`node_modules/${packageName}/dist/translations/en.json`,
		`node_modules/${packageName}/translations/en.json`,
		`src/translations/${packageName}/en.json`
	];

	for (const schemaPath of possiblePaths) {
		if (existsSync(schemaPath)) {
			const content = readFileSync(schemaPath, 'utf-8');
			const schema = JSON.parse(content);
			console.log(`   Using JSON schema from ${schemaPath}`);
			return {
				schema,
				source: `JSON schema from ${schemaPath}`
			};
		}
	}

	return null;
}

/**
 * Validate translations against package types or schema
 */
export function validateAgainstPackage(
	translations: Record<string, unknown>,
	packageInfo: { paths?: string[]; schema?: Record<string, unknown> }
): string[] {
	const errors: string[] = [];

	if (packageInfo.paths) {
		// Validate against TypeScript paths
		const translationPaths = extractPaths(translations);

		// Check for missing paths
		for (const requiredPath of packageInfo.paths) {
			if (!translationPaths.includes(requiredPath)) {
				errors.push(`Missing key: ${requiredPath}`);
			}
		}

		// Check for extra paths (warnings)
		for (const path of translationPaths) {
			if (!packageInfo.paths.includes(path)) {
				errors.push(`Extra key (warning): ${path}`);
			}
		}
	} else if (packageInfo.schema) {
		// Use existing schema validation
		return validateStructure(packageInfo.schema, translations);
	}

	return errors;
}

/**
 * Extract all paths from a translation object
 */
function extractPaths(obj: Record<string, unknown>, prefix = ''): string[] {
	const paths: string[] = [];

	for (const [key, value] of Object.entries(obj)) {
		if (key === '_meta') continue;

		const fullPath = prefix ? `${prefix}.${key}` : key;

		if (typeof value === 'string') {
			paths.push(fullPath);
		} else if (typeof value === 'object' && value !== null) {
			paths.push(...extractPaths(value as Record<string, unknown>, fullPath));
		}
	}

	return paths;
}

/**
 * Validate structure (existing function, for reference)
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
