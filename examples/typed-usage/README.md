# Type-Safe i18n Example

This directory shows how external applications should use the type-safe features of `@shelchin/svelte-i18n`.

## Files

- `app-i18n.ts` - Example of how to create a typed i18n module in your application
- `example-component.svelte` - Example of using the typed i18n in a component

## Important Note

These files are **examples only**. External applications should:

1. Generate their own types using `npx @shelchin/svelte-i18n generate-types`
2. Create their own `i18n.ts` module using the `createTypedI18n` factory
3. Import from their own module, not from the package directly

## Why This Approach?

- **Separation of concerns**: The package doesn't know about your app's translations
- **Type safety**: Your app gets full type checking based on YOUR translation files
- **Flexibility**: You can organize your files however you want
- **No bloat**: The package doesn't include any app-specific types
