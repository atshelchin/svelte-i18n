#!/usr/bin/env node

/**
 * Generate TypeScript type definitions from translation files
 * Creates strongly-typed translation keys
 */

import { readFileSync, writeFileSync } from 'fs';

interface GenerateTypesOptions {
	translationFile: string;
	outFile: string;
	namespace?: string;
	moduleName?: string;
}

function generateTypeFromObject(obj: Record<string, unknown>, indent = ''): string {
	const lines: string[] = [];

	for (const [key, value] of Object.entries(obj)) {
		// Skip _meta field
		if (key === '_meta') continue;

		// Escape key if needed
		const safeKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : `"${key}"`;

		if (typeof value === 'string') {
			lines.push(`${indent}${safeKey}: string;`);
		} else if (typeof value === 'object' && value !== null) {
			lines.push(`${indent}${safeKey}: {`);
			lines.push(generateTypeFromObject(value as Record<string, unknown>, indent + '  '));
			lines.push(`${indent}};`);
		}
	}

	return lines.join('\n');
}

function generatePathKeys(obj: Record<string, unknown>, prefix = ''): string[] {
	const paths: string[] = [];

	for (const [key, value] of Object.entries(obj)) {
		// Skip _meta field
		if (key === '_meta') continue;

		const fullPath = prefix ? `${prefix}.${key}` : key;

		if (typeof value === 'string') {
			paths.push(`"${fullPath}"`);
		} else if (typeof value === 'object' && value !== null) {
			paths.push(`"${fullPath}"`);
			paths.push(...generatePathKeys(value as Record<string, unknown>, fullPath));
		}
	}

	return paths;
}

function generateParameterTypes(obj: Record<string, unknown>): Map<string, Set<string>> {
	const paramTypes = new Map<string, Set<string>>();

	function extractParams(str: string): Set<string> {
		const params = new Set<string>();
		const regex = /\{([^}]+)\}/g;
		let match;

		while ((match = regex.exec(str)) !== null) {
			params.add(match[1]);
		}

		return params;
	}

	function scan(current: Record<string, unknown>, path = '') {
		for (const [key, value] of Object.entries(current)) {
			if (key === '_meta') continue;

			const fullPath = path ? `${path}.${key}` : key;

			if (typeof value === 'string') {
				const params = extractParams(value);
				if (params.size > 0) {
					paramTypes.set(fullPath, params);
				}
			} else if (typeof value === 'object' && value !== null) {
				scan(value as Record<string, unknown>, fullPath);
			}
		}
	}

	scan(obj);
	return paramTypes;
}

export function generateTypes(options: GenerateTypesOptions): void {
	console.log('🔨 Generating TypeScript types...');
	console.log(`  Source: ${options.translationFile}`);

	// Load translation file
	const content = readFileSync(options.translationFile, 'utf-8');
	const translations = JSON.parse(content);

	// Generate types
	const schemaType = generateTypeFromObject(translations);
	const pathKeys = generatePathKeys(translations);
	const paramTypes = generateParameterTypes(translations);

	// Build TypeScript module
	const moduleName = options.moduleName || 'TranslationTypes';
	const namespace = options.namespace || 'default';

	let output = `/**
 * Auto-generated translation types
 * Generated from: ${options.translationFile}
 * Namespace: ${namespace}
 */

`;

	// Generate main translation schema interface
	output += `export interface ${moduleName}Schema {\n`;
	output += schemaType;
	output += '\n}\n\n';

	// Generate path keys type
	output += `export type ${moduleName}Keys =\n`;
	if (pathKeys.length > 0) {
		output += '  | ' + pathKeys.join('\n  | ');
	} else {
		output += '  never';
	}
	output += ';\n\n';

	// Generate parameter types for each key
	if (paramTypes.size > 0) {
		output += `export interface ${moduleName}Params {\n`;
		for (const [key, params] of paramTypes) {
			const paramList = Array.from(params)
				.map((p) => `${p}: string | number`)
				.join('; ');
			output += `  "${key}": { ${paramList} };\n`;
		}
		output += '}\n\n';

		// Generate typed translation function
		output += `export type ${moduleName}Function = {\n`;
		output += `  <K extends keyof ${moduleName}Params>(key: K, params: ${moduleName}Params[K]): string;\n`;
		output += `  (key: Exclude<${moduleName}Keys, keyof ${moduleName}Params>): string;\n`;
		output += '};\n\n';
	} else {
		// Simple translation function without params
		output += `export type ${moduleName}Function = (key: ${moduleName}Keys) => string;\n\n`;
	}

	// Add namespace registration if specified
	if (options.namespace && options.namespace !== 'default') {
		output += `// Register namespace types\n`;
		output += `declare module '@shelchin/svelte-i18n' {\n`;
		output += `  interface NamespaceTypes {\n`;
		output += `    "${options.namespace}": {\n`;
		output += `      schema: ${moduleName}Schema;\n`;
		output += `      keys: ${moduleName}Keys;\n`;
		if (paramTypes.size > 0) {
			output += `      params: ${moduleName}Params;\n`;
		}
		output += `    };\n`;
		output += `  }\n`;
		output += `}\n`;
	}

	// Write output file
	writeFileSync(options.outFile, output, 'utf-8');

	console.log(`✅ Generated ${pathKeys.length} type-safe keys`);
	if (paramTypes.size > 0) {
		console.log(`✅ Generated parameter types for ${paramTypes.size} keys`);
	}
	console.log(`📝 Written to ${options.outFile}`);
}

// CLI interface
if (require.main === module) {
	const args = process.argv.slice(2);

	if (args.length < 2) {
		console.error('Usage: generate-types <translationFile> <outFile> [options]');
		console.error('Options:');
		console.error('  --namespace <name>  Namespace for the types');
		console.error('  --module <name>     Module name prefix (default: TranslationTypes)');
		console.error(
			'Example: generate-types ./translations/en.json ./src/i18n-types.ts --namespace myapp'
		);
		process.exit(1);
	}

	const [translationFile, outFile] = args;
	let namespace = 'default';
	let moduleName = 'TranslationTypes';

	for (let i = 2; i < args.length; i++) {
		if (args[i] === '--namespace' && args[i + 1]) {
			namespace = args[i + 1];
			i++;
		} else if (args[i] === '--module' && args[i + 1]) {
			moduleName = args[i + 1];
			i++;
		}
	}

	generateTypes({
		translationFile,
		outFile,
		namespace,
		moduleName
	});
}
