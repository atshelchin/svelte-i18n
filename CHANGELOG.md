# Changelog

All notable changes to @shelchin/svelte-i18n will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-08-09

### Added

- **🎯 Enhanced Type Safety** - Full auto-completion support for translation keys
  - IDE suggestions when typing `i18n.t('...')`
  - Parameter validation for interpolated values
  - `createTypedI18n` function for type-safe instances
  - Real-time type checking in development

- **💾 Translation Caching & Resume** - Never lose translation work
  - Auto-save to browser IndexedDB
  - Resume incomplete translations anytime
  - Export/import with `_cache` metadata
  - Task history with one-click restore

- **📥 Flexible Import Options** - Multiple ways to load translations
  - Import from local files
  - Load from URLs
  - Resume saved work
  - Support for multiple source languages

- **📊 Smart Progress Tracking** - Accurate translation progress
  - Empty fields counted as untranslated
  - Any content (including `[TODO]` markers) counted as translated
  - Real-time progress updates
  - Visual status indicators

- **🔍 Auto-Discovery API** - Revolutionary automatic translation loading
  - Packages auto-find translations from `/static/translations/`
  - No code changes needed to add languages
  - Configurable patterns and namespaces
  - Perfect for component libraries and enterprise apps

### Changed

- Translation progress detection now correctly identifies any non-empty content as translated
- `setLocale` is now async and attempts auto-discovery before warning
- Translation Editor UI improvements for better user experience
- Enhanced validation logic for more accurate results

### Fixed

- Fixed infinite loop in Translation Editor effects
- Corrected progress calculation for nested translation structures
- Fixed save button availability conditions
- Improved text color contrast in progress indicators

## [1.0.0] - 2025-01-08

### 🎉 Initial Release

#### Features

- **Core i18n Engine** - Reactive store built with Svelte 5 runes
- **Type Safety** - Auto-generated TypeScript definitions for all translation keys
- **AI Translation Editor** - Web-based tool with OpenAI integration
- **Auto-Loading** - Automatic language discovery and loading
- **Namespace Isolation** - Support for micro-frontends and library isolation
- **Validation System** - Runtime validation with beautiful error UI
- **Persistence** - Automatic saving of user language preferences
- **Global Formatting** - Support for 100+ locales via native Intl API
  - Number formatting (standard, percent, compact, scientific)
  - Currency formatting with auto-detection
  - Date and time formatting
  - Relative time formatting
  - List formatting

#### Components

- `<Trans>` - Inline translation component
- `<LanguageSwitcher>` - Beautiful language selector
- `<ValidationPopup>` - Development-time validation UI
- `<TypeSafetyDemo>` - Demo component for type safety

#### CLI Tools

- `extract` - Extract translation keys from source code
- `validate` - Validate translation completeness
- `generate-types` - Generate TypeScript definitions

#### Supported Languages (12)

- 🇬🇧 English
- 🇨🇳 Chinese (Simplified & Traditional)
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇷🇺 Russian
- 🇸🇦 Arabic
- 🇵🇹 Portuguese
- 🇮🇳 Hindi
- 🇮🇹 Italian

#### Developer Experience

- Zero configuration setup
- Hot-reload support
- Comprehensive documentation
- 90%+ test coverage
- GitHub Actions CI/CD
- Auto npm publishing

### Notes

This is the first stable release of @shelchin/svelte-i18n, a modern i18n library built specifically for Svelte 5 applications. It provides a complete solution for internationalization with features that go beyond traditional i18n libraries.
