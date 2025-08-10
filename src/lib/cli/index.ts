#!/usr/bin/env node

/**
 * Main CLI entry point for @shelchin/svelte-i18n
 */

import { extract } from './extract.js';
import { validate } from './validate.js';
import { generateTypes } from './generate-types.js';

const command = process.argv[2];
const args = process.argv.slice(3);

function showHelp() {
	console.log(`
@shelchin/svelte-i18n CLI

Commands:
  extract <srcDir> <outFile> [extensions...]
    Extract translation keys from source code
    
  validate <translationsDir> [--base <locale>] [--strict]
    Validate translation files for consistency
    
  generate-types <translationFile> <outFile> [--namespace <name>] [--module <name>]
    Generate TypeScript type definitions from translations

Examples:
  svelte-i18n extract ./src ./translations/template.json
  svelte-i18n validate ./static/translations --strict
  svelte-i18n generate-types ./translations/en.json ./src/i18n.d.ts

For more information, visit:
  https://github.com/atshelchin/svelte-i18n
`);
}

switch (command) {
	case 'extract':
		if (args.length < 2) {
			console.error('Usage: svelte-i18n extract <srcDir> <outFile> [extensions...]');
			process.exit(1);
		}
		extract({
			srcDir: args[0],
			outFile: args[1],
			extensions: args.slice(2).length > 0 ? args.slice(2) : undefined
		});
		break;

	case 'validate': {
		if (args.length < 1) {
			console.error('Usage: svelte-i18n validate <translationsDir> [options]');
			process.exit(1);
		}
		const validationOptions: {
			translationsDir: string;
			baseLocale?: string;
			strict?: boolean;
		} = {
			translationsDir: args[0]
		};
		for (let i = 1; i < args.length; i++) {
			if (args[i] === '--base' && args[i + 1]) {
				validationOptions.baseLocale = args[i + 1];
				i++;
			} else if (args[i] === '--strict') {
				validationOptions.strict = true;
			}
		}
		const isValid = validate(validationOptions);
		process.exit(isValid ? 0 : 1);
		break;
	}

	case 'generate-types': {
		if (args.length < 2) {
			console.error('Usage: svelte-i18n generate-types <translationFile> <outFile> [options]');
			process.exit(1);
		}
		const genOptions: {
			translationFile: string;
			outFile: string;
			namespace?: string;
			moduleName?: string;
		} = {
			translationFile: args[0],
			outFile: args[1]
		};
		for (let i = 2; i < args.length; i++) {
			if (args[i] === '--namespace' && args[i + 1]) {
				genOptions.namespace = args[i + 1];
				i++;
			} else if (args[i] === '--module' && args[i + 1]) {
				genOptions.moduleName = args[i + 1];
				i++;
			}
		}
		generateTypes(genOptions);
		break;
	}

	case 'help':
	case '--help':
	case '-h':
		showHelp();
		break;

	default:
		console.error(`Unknown command: ${command}`);
		showHelp();
		process.exit(1);
}
