/**
 * Utility functions for CLI commands
 */

import fs from 'fs';
import path from 'path';

export interface ProjectType {
	isPackage: boolean;
	isApp: boolean;
	packageName?: string;
}

/**
 * Detect project type by checking package.json and directory structure
 */
export function detectProjectType(projectRoot: string = process.cwd()): ProjectType {
	const packageJsonPath = path.join(projectRoot, 'package.json');

	let isPackage = false;
	let isApp = false;
	let packageName: string | undefined;

	// Check package.json for signs of a package
	if (fs.existsSync(packageJsonPath)) {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

		// Check if it's a package (has exports or main/module fields for library)
		if (packageJson.exports || packageJson.main || packageJson.module || packageJson.svelte) {
			isPackage = true;
			packageName = packageJson.name;
		}

		// Check if it's a Svelte/SvelteKit app
		const deps = {
			...packageJson.dependencies,
			...packageJson.devDependencies
		};

		if (deps['@sveltejs/kit'] || deps['svelte'] || deps['vite']) {
			// Check for app structure
			if (
				fs.existsSync(path.join(projectRoot, 'src/routes')) ||
				fs.existsSync(path.join(projectRoot, 'src/App.svelte')) ||
				fs.existsSync(path.join(projectRoot, 'src/app.html'))
			) {
				isApp = true;
			}
		}
	}

	// Additional check for library structure
	if (
		fs.existsSync(path.join(projectRoot, 'src/lib/index.ts')) ||
		fs.existsSync(path.join(projectRoot, 'src/lib/index.js'))
	) {
		isPackage = true;
	}

	// If nothing detected, assume it's an app
	if (!isPackage && !isApp) {
		isApp = true;
	}

	return { isPackage, isApp, packageName };
}

/**
 * Generate TypeScript types from translation files
 */
export function generateTypeDefinitions(
	translationsDir: string,
	outputPath: string,
	typePrefix: string = 'I18nPath'
): string {
	if (!fs.existsSync(translationsDir)) {
		throw new Error(`Translations directory not found: ${translationsDir}`);
	}

	// Find the first JSON file to use as template
	const files = fs
		.readdirSync(translationsDir)
		.filter((f) => f.endsWith('.json'))
		.sort();

	if (files.length === 0) {
		throw new Error(`No translation files found in ${translationsDir}`);
	}

	const templateFile = path.join(translationsDir, files[0]);
	const translations = JSON.parse(fs.readFileSync(templateFile, 'utf8'));

	// Generate type paths from the translation structure
	const paths: string[] = [];

	function extractPaths(obj: any, prefix: string = '') {
		for (const key in obj) {
			const fullPath = prefix ? `${prefix}.${key}` : key;

			if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
				extractPaths(obj[key], fullPath);
			} else {
				paths.push(fullPath);
			}
		}
	}

	extractPaths(translations);

	// Generate TypeScript content
	const typeContent = `/**
 * Auto-generated i18n type definitions
 * Generated from: ${path.basename(templateFile)}
 * Generated at: ${new Date().toISOString()}
 */

// Type for all translation keys in your ${typePrefix === 'LibI18nPath' ? 'library' : 'application'}
export type ${typePrefix} = ${
		paths.length > 0 ? paths.map((p) => `\n\t| '${p}'`).join('') : '\n\t| never'
	};

// Helper type for typed translation function
export interface TypedTranslate {
	(key: ${typePrefix}, params?: Record<string, any>): string;
}
`;

	// Write the type file
	const outputDir = path.dirname(outputPath);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	fs.writeFileSync(outputPath, typeContent);

	return typeContent;
}
