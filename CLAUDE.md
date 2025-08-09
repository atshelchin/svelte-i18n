# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Guidelines

**All code comments, documentation, and commit messages MUST be written in English only.**
**MUST use Svelte 5 Runes syntax (`$state`, `$derived`, `$effect`, etc.) for all reactive code.**

## Development Commands

### Core Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build library for production and run prepack
- `npm run preview` - Preview production build

### Code Quality

- `npm run check` - Type-check with svelte-check
- `npm run check:watch` - Type-check in watch mode
- `npm run lint` - Run Prettier check and ESLint
- `npm run format` - Format code with Prettier

### Testing

- `npm run test` - Run all tests (unit and e2e)
- `npm run test:unit` - Run Vitest unit tests
- `npm run test:unit -- --run` - Run unit tests once (no watch)
- `npm run test:e2e` - Run Playwright E2E tests

### Package Management

- `npm run prepack` - Prepare package for publishing (runs svelte-package and publint)
- `npm pack` - Build library for distribution

## Project Overview

This is a comprehensive i18n (internationalization) library for Svelte 5 applications.

### Core Requirements

1. **Type Safety**: Full TypeScript support with type definitions for translation keys
2. **Runtime Dynamic Loading**: Load language files dynamically at runtime
3. **Hot Language Switching**: Change languages without page reload
4. **Translation Validation**: Check `translations/*.json` files against type definitions at both development and runtime
5. **Namespace Support**: Distinguish between library and application translations to avoid conflicts when multiple packages use this library
6. **Simple API**: Minimal configuration with intuitive API design
7. **Post-Build Language Addition**: Support adding new languages via JSON files without recompiling the application
8. **Additional Essential Features**:
   - Interpolation support for dynamic values (`Hello {name}`)
   - Pluralization rules (`{count} item|{count} items`)
   - Nested translation keys (`user.profile.title`)
   - Lazy loading of language packs for better performance
   - Fallback language mechanism
   - Browser language detection
   - SSR (Server-Side Rendering) support
   - Missing translation handling with dev warnings
   - Date/number formatting based on locale
   - Translation key extraction tools for development

### Directory Structure

- `src/lib/` - Core i18n library implementation
  - `stores/` - Svelte stores for language state
  - `types/` - TypeScript type definitions
  - `utils/` - Helper functions and validators
  - `components/` - i18n-related Svelte components
- `src/routes/` - Demo application showcasing library features
- `translations/` - Translation JSON files (for demo/testing)
- `e2e/` - End-to-end tests using Playwright
- `dist/` - Built library output (generated, not in source control)

### Technology Stack

- **Framework**: Svelte 5 with SvelteKit
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (via @tailwindcss/vite)
- **Testing**:
  - Unit: Vitest with browser testing for Svelte components
  - E2E: Playwright
- **Type Checking**: TypeScript with svelte-check
- **Code Quality**: ESLint + Prettier

### Test Configuration

The project uses Vitest with two separate test projects:

- **Client tests**: Browser-based tests for Svelte components (`*.svelte.{test,spec}.{js,ts}`)
- **Server tests**: Node-based tests for non-component code

### Library Development

- Library exports are defined in `src/lib/index.ts`
- The library targets Svelte 5 as a peer dependency
- Built output includes TypeScript definitions
- Uses svelte-package for library bundling
