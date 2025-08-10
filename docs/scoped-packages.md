# Scoped Packages Support

The svelte-i18n library fully supports scoped npm packages (e.g., `@org/package-name`) with automatic namespace isolation to prevent naming conflicts.

## How It Works

When using auto-discovery with scoped packages, the scope becomes part of the directory structure in your translation files. This ensures that packages with the same name but different scopes don't conflict.

## File Structure Examples

### Non-Scoped Package

For a package named `my-component`:

```
static/translations/
├── my-component.en.json
├── my-component.zh.json
└── my-component.fr.json
```

### Scoped Package

For a package named `@shelchin/my-component`:

```
static/translations/
├── @shelchin/
│   ├── my-component.en.json
│   ├── my-component.zh.json
│   └── my-component.fr.json
```

## Avoiding Naming Conflicts

This structure prevents conflicts when multiple packages have the same name but different scopes:

```
static/translations/
├── @org1/
│   └── shared-lib.en.json    # Translations for @org1/shared-lib
├── @org2/
│   └── shared-lib.en.json    # Translations for @org2/shared-lib
└── shared-lib.en.json         # Translations for non-scoped shared-lib
```

## Usage in Your Package

When initializing i18n with a scoped package name:

```typescript
import { setupI18n } from '@shelchin/svelte-i18n';

// For a scoped package
const i18n = setupI18n({
    namespace: '@myorg/awesome-package',  // Include the full scope
    defaultLocale: 'en',
    autoDiscovery: true  // Will look in /translations/@myorg/awesome-package.{locale}.json
});

// For a non-scoped package
const i18n = setupI18n({
    namespace: 'my-package',
    defaultLocale: 'en',
    autoDiscovery: true  // Will look in /translations/my-package.{locale}.json
});
```

## Translation File Patterns

The auto-discovery system will try these patterns in order:

1. `{namespace}.{locale}.json` - e.g., `@org/package.en.json`
2. `{namespace}/{locale}.json` - e.g., `@org/package/en.json`
3. `{namespace}-{locale}.json` - e.g., `@org/package-en.json`
4. `packages/{namespace}.{locale}.json`
5. `components/{namespace}.{locale}.json`

## Custom Patterns

You can also define custom patterns:

```typescript
const i18n = setupI18n({
    namespace: '@myorg/lib',
    autoDiscovery: {
        patterns: [
            'i18n/{namespace}/{locale}.json',
            'locales/{namespace}.{locale}.json'
        ]
    }
});
```

## Best Practices

1. **Always use the full package name** including scope as your namespace
2. **Maintain the same directory structure** as the package scope in your translations folder
3. **Test with multiple scoped packages** to ensure no conflicts
4. **Use consistent naming** across all your translation files

## Example Directory Structure

For a project using multiple packages:

```
static/translations/
├── @shelchin/
│   ├── ui-kit.en.json
│   ├── ui-kit.zh.json
│   ├── form-lib.en.json
│   └── form-lib.zh.json
├── @company/
│   ├── analytics.en.json
│   └── analytics.zh.json
├── my-app.en.json           # Main app translations
└── my-app.zh.json
```

This structure keeps translations organized and prevents any naming conflicts between packages.