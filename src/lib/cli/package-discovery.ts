/**
 * Package discovery utilities for i18n validation
 * Automatically finds packages that use @shelchin/svelte-i18n
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import path from 'path';

/**
 * Check if a package uses @shelchin/svelte-i18n
 */
export function packageUsesI18n(packageName: string): boolean {
	// Check package.json for dependencies
	const possiblePackageJsonPaths = [
		`node_modules/${packageName}/package.json`,
		`../${packageName}/package.json`,
		`../../${packageName}/package.json`
	];

	for (const packageJsonPath of possiblePackageJsonPaths) {
		if (existsSync(packageJsonPath)) {
			try {
				const content = readFileSync(packageJsonPath, 'utf-8');
				const packageJson = JSON.parse(content);

				// Check if it has @shelchin/svelte-i18n as dependency
				const deps = {
					...packageJson.dependencies,
					...packageJson.devDependencies,
					...packageJson.peerDependencies
				};

				if ('@shelchin/svelte-i18n' in deps) {
					return true;
				}
			} catch {
				// Continue checking other paths
			}
		}
	}

	// Check if package has i18n translations in standard locations
	const translationPaths = [
		`node_modules/${packageName}/translations`,
		`node_modules/${packageName}/dist/translations`,
		`node_modules/${packageName}/static/translations`
	];

	for (const translationPath of translationPaths) {
		if (existsSync(translationPath)) {
			return true;
		}
	}

	return false;
}

/**
 * Discover all packages in static/translations that need validation
 */
export function discoverStaticPackages(
	staticDir: string,
	config: { packages?: string[]; autoDiscover?: boolean }
): string[] {
	const packages: string[] = [];

	if (!existsSync(staticDir)) {
		return packages;
	}

	const entries = readdirSync(staticDir, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.isDirectory()) {
			if (entry.name === 'app') {
				// Always validate app translations
				packages.push('app');
			} else if (entry.name.startsWith('@')) {
				// Scoped packages
				const scopeDir = path.join(staticDir, entry.name);
				const subEntries = readdirSync(scopeDir, { withFileTypes: true });

				for (const subEntry of subEntries) {
					if (subEntry.isDirectory()) {
						const fullPackageName = `${entry.name}/${subEntry.name}`;

						// Check if package is in config or auto-discover is enabled
						if (
							config.packages?.includes(fullPackageName) ||
							(config.autoDiscover && packageUsesI18n(fullPackageName))
						) {
							packages.push(fullPackageName);
						}
					}
				}
			} else {
				// Regular packages
				if (
					config.packages?.includes(entry.name) ||
					(config.autoDiscover && packageUsesI18n(entry.name))
				) {
					packages.push(entry.name);
				}
			}
		}
	}

	return packages;
}

/**
 * Get the schema source for a package
 */
export function getPackageSchemaSource(packageName: string): {
	schema: Record<string, unknown> | null;
	source: string;
} {
	// Priority order for finding schemas:
	// 1. Local src/translations (for packages in current project)
	// 2. Package's exported schema from node_modules
	// 3. Static translations as fallback

	const searchPaths = [
		// Local source
		{ path: `src/translations/${packageName}/en.json`, label: 'local source' },
		// Package dist
		{ path: `node_modules/${packageName}/dist/translations/en.json`, label: 'package dist' },
		{ path: `node_modules/${packageName}/translations/en.json`, label: 'package' },
		// Static fallback
		{ path: `static/translations/${packageName}/en.json`, label: 'static' }
	];

	for (const { path: schemaPath, label } of searchPaths) {
		if (existsSync(schemaPath)) {
			try {
				const content = readFileSync(schemaPath, 'utf-8');
				const schema = JSON.parse(content);
				return {
					schema,
					source: `${label} (${schemaPath})`
				};
			} catch (error) {
				console.warn(`Failed to parse ${schemaPath}: ${error}`);
			}
		}
	}

	return { schema: null, source: '' };
}
