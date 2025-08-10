# CLI Tools Documentation

The `@shelchin/svelte-i18n` library provides three powerful command-line tools to help manage your internationalization workflow. These tools help you extract translation keys, validate translation files, and generate TypeScript types for type-safe translations.

## Installation

The CLI tools are included when you install the package:

```bash
npm install @shelchin/svelte-i18n
```

## Available Commands

### 1. Extract Translation Keys (`cli:extract`)

Automatically scan your codebase and extract all translation keys used in your application.

#### Usage

```bash
npm run cli:extract <source-directory> <output-file>
```

#### Example

```bash
npm run cli:extract ./src ./translations/template.json
```

#### What it does

The extract tool scans your source files for translation function calls and creates a JSON template with all discovered keys. It recognizes the following patterns:

- `i18n.t('key.path')`
- `$t('key.path')` (Svelte reactive syntax)
- `getI18n().t('key.path')`
- `<Trans key="key.path">`
- Standalone `t('key.path')` (when clearly a translation function)

#### Output Format

The tool generates a nested JSON structure with placeholder values:

```json
{
  "demo": {
    "title": "[TODO: Add translation]",
    "features": "[TODO: Add translation]",
    "settings": {
      "language": "[TODO: Add translation]",
      "theme": "[TODO: Add translation]"
    }
  }
}
```

#### Features

- **Smart Detection**: Filters out false positives like file paths and URLs
- **Nested Structure**: Automatically creates nested objects from dot-notation keys
- **Conflict Resolution**: Handles key conflicts gracefully with warnings
- **Multiple Extensions**: Supports `.svelte`, `.ts`, `.js`, `.tsx`, `.jsx` files

### 2. Validate Translations (`cli:validate`)

Ensure consistency across all your translation files by validating them against a base language.

#### Usage

```bash
npm run cli:validate [options]
```

#### Options

- `--dir <path>`: Directory containing translation files (default: `./src/translations`)
- `--base <locale>`: Base locale for comparison (default: `en`)
- `--strict`: Enable strict validation mode
- `--help`: Show help information

#### Examples

```bash
# Validate with default settings
npm run cli:validate

# Validate a specific directory
npm run cli:validate -- --dir ./static/translations

# Use strict validation with custom base locale
npm run cli:validate -- --dir ./src/translations/app --base en --strict

# Show help
npm run cli:validate -- --help
```

#### Validation Checks

The validator performs the following checks:

1. **Missing Keys**: Identifies keys present in the base language but missing in other languages
2. **Type Mismatches**: Ensures value types match across languages (string vs object)
3. **Extra Keys**: Warns about keys present in translations but not in the base language
4. **Structural Consistency**: Validates the nested structure matches across all files

#### Output Example

```
🔍 Validating translations...
  Directory: ./src/translations/app
  Base locale: en
  Strict mode: No
  Found 5 translation files

✅ fr: No issues found
❌ es:
  ❌ Errors:
    • Missing key: demo.newFeature
    • Type mismatch at settings.theme: expected string, got object
  ⚠️  Warnings:
    • Extra key (warning): legacy.oldFeature

✅ de: No issues found
✅ ja: No issues found

❌ Validation failed!
```

### 3. Generate TypeScript Types (`cli:generate-types`)

Generate type-safe TypeScript definitions from your translation files for compile-time safety and IntelliSense support.

#### Usage

```bash
npm run cli:generate-types [options]
```

#### Options

- `--mode <mode>`: Generation mode - `library`, `app`, or `all` (default: `all`)
- `--no-validate`: Skip validation of translation files
- `--help`: Show help information

#### Examples

```bash
# Generate all types with validation
npm run cli:generate-types

# Generate only app types
npm run cli:generate-types -- --mode app

# Generate only library types
npm run cli:generate-types -- --mode library

# Skip validation for faster generation
npm run cli:generate-types -- --no-validate

# Show help
npm run cli:generate-types -- --help
```

#### Output Files

The generator creates TypeScript definition files at:

- **Library types**: `src/lib/types/library-i18n-generated.ts`
- **App types**: `src/types/app-i18n-generated.ts`

#### Generated Type Features

The generated types provide:

1. **Type-safe Keys**: All translation keys as literal types
2. **Parameter Types**: Typed parameters for interpolated values
3. **IntelliSense**: Full auto-completion in your IDE
4. **Compile-time Validation**: TypeScript errors for invalid keys

#### Example Generated Types

```typescript
// Auto-generated i18n type definitions
export interface I18nKeys {
  demo: {
    title: string;
    welcome: ParamsKey<{ name: string }>;
    items: {
      count: ParamsKey<{ count: number }>;
    };
  };
}

export type I18nPath = 
  | "demo.title"
  | "demo.welcome"
  | "demo.items.count";

// Type-safe translation function
export interface TypedI18n {
  <P extends I18nPath>(
    key: P,
    ...params: ExtractParams<GetValue<I18nKeys, P>>
  ): string;
}
```

#### Using Generated Types

```typescript
import { getI18n } from '@shelchin/svelte-i18n';

const i18n = getI18n();

// ✅ TypeScript provides auto-completion
i18n.t('demo.title');

// ✅ TypeScript enforces correct parameters
i18n.t('demo.welcome', { name: 'World' });

// ❌ TypeScript error: invalid key
i18n.t('demo.invalid');

// ❌ TypeScript error: missing required parameter
i18n.t('demo.welcome');
```

## Configuration

### Validation Configuration

Create an `i18n-validation.config.json` file in your project root for custom validation settings:

```json
{
  "packages": ["@shelchin/svelte-i18n", "my-package"],
  "autoDiscover": true,
  "validationRules": {
    "allowExtraKeys": false,
    "requireAllKeys": true
  }
}
```

## Best Practices

1. **Regular Extraction**: Run `cli:extract` regularly during development to keep your translation template up-to-date

2. **CI/CD Integration**: Add validation to your CI pipeline:
   ```yaml
   - name: Validate translations
     run: npm run cli:validate -- --strict
   ```

3. **Pre-commit Hooks**: Generate types before committing:
   ```json
   {
     "husky": {
       "hooks": {
         "pre-commit": "npm run cli:generate-types"
       }
     }
   }
   ```

4. **Development Workflow**:
   - Extract keys when adding new UI text
   - Validate after translators add new languages
   - Generate types before building for production

## Troubleshooting

### Common Issues

1. **Extract tool finds too many false positives**
   - The tool filters out paths and URLs automatically
   - Check that you're not using `t()` for non-translation purposes

2. **Validation fails on optional keys**
   - Use `--strict` mode only for production validation
   - Consider allowing extra keys in development

3. **Type generation fails**
   - Ensure your base language file (usually `en.json`) is valid JSON
   - Check that all translation files are in the correct directory

### Getting Help

For issues or questions about the CLI tools:

1. Run with `--help` flag for command-specific help
2. Check the [GitHub Issues](https://github.com/shelchin/svelte-i18n/issues)
3. Refer to the examples in this documentation

## Examples

### Complete Workflow Example

```bash
# 1. Extract all translation keys from your code
npm run cli:extract ./src ./translations/template.json

# 2. Copy template to create English translations
cp ./translations/template.json ./src/translations/app/en.json
# Edit en.json to add actual translations

# 3. Validate translations are complete
npm run cli:validate -- --dir ./src/translations/app

# 4. Generate TypeScript types
npm run cli:generate-types

# 5. Use type-safe translations in your code
# TypeScript now provides full IntelliSense!
```

### Multi-package Monorepo Example

```bash
# Extract keys for each package
npm run cli:extract ./packages/ui/src ./packages/ui/translations/template.json
npm run cli:extract ./packages/admin/src ./packages/admin/translations/template.json

# Validate all packages
npm run cli:validate -- --dir ./packages/ui/translations
npm run cli:validate -- --dir ./packages/admin/translations

# Generate types for all packages
npm run cli:generate-types -- --mode all
```

## Summary

The CLI tools provide a complete workflow for managing translations:

1. **Extract** → Discover all translation keys in your code
2. **Validate** → Ensure consistency across languages
3. **Generate** → Create type-safe TypeScript definitions

This workflow ensures your translations are complete, consistent, and type-safe throughout your development process.