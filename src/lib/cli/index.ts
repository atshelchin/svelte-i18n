#!/usr/bin/env node

/**
 * Main CLI entry point for @shelchin/svelte-i18n
 */

import { extract } from './extract.js';
import { validate } from './validate.js';
import { generateTypes } from './generate-types.js';
import { init } from './init.js';

const command = process.argv[2];
const args = process.argv.slice(3);

function showHelp() {
	console.log(`
@shelchin/svelte-i18n CLI

Commands:
  init
    Initialize i18n in your project (creates config files and directories)
    
  extract <srcDir> <outFile> [extensions...]
    Extract translation keys from source code
    
  validate <translationsDir> [--base <locale>] [--strict]
    Validate translation files for consistency
    
  generate-types [options]
    Generate TypeScript type definitions from translations
    Options:
      -d, --dir <path>       Translations directory (default: src/translations/app)
      -o, --out <path>       Output TypeScript file (default: src/lib/types/i18n-generated.ts)
      -l, --locale <code>    Default locale (default: en)
      --no-validate          Skip validation of other language files

Examples:
  svelte-i18n init
  svelte-i18n extract ./src ./translations/template.json
  svelte-i18n validate ./static/translations --strict
  svelte-i18n generate-types
  svelte-i18n generate-types --dir ./translations --out ./types/i18n.ts
  svelte-i18n generate-types --locale zh --no-validate

For more information, visit:
  https://github.com/atshelchin/svelte-i18n
`);
}

switch (command) {
	case 'init':
		init();
		break;
		
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
		const genOptions: {
			translationsDir?: string;
			outFile?: string;
			defaultLocale?: string;
			validate?: boolean;
		} = {};

		for (let i = 0; i < args.length; i++) {
			switch (args[i]) {
				case '--dir':
				case '-d':
					genOptions.translationsDir = args[++i];
					break;
				case '--out':
				case '-o':
					genOptions.outFile = args[++i];
					break;
				case '--locale':
				case '-l':
					genOptions.defaultLocale = args[++i];
					break;
				case '--no-validate':
					genOptions.validate = false;
					break;
			}
		}

		generateTypes(genOptions)
			.then((success) => {
				process.exit(success ? 0 : 1);
			})
			.catch((error) => {
				console.error('Error:', error);
				process.exit(1);
			});
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
