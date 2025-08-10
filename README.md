# @shelchin/svelte-i18n

<div align="center">

**🌍 The Last i18n Library You'll Ever Need for Svelte**

[![npm version](https://img.shields.io/npm/v/@shelchin/svelte-i18n.svg)](https://www.npmjs.com/package/@shelchin/svelte-i18n)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00.svg)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg)](https://www.typescriptlang.org/)

**Zero-config • Type-safe • AI-powered • Enterprise Features**

[Demo](https://svelte-i18n-demo.vercel.app) • [Documentation](#documentation) • [Translation Editor](#translation-editor) • [中文文档](./README_zh.md)

</div>

> [!WARNING]
> **⚠️ DEVELOPMENT STATUS: This library is currently in active development and is NOT ready for production use.**
>
> While we're excited about the features and actively working on stability, please be aware:
>
> - APIs may change without notice
> - Some features are experimental
> - Bugs and breaking changes are expected
>
> **For production applications, please wait for the stable v2.0.0 release.**
>
> Feel free to experiment, provide feedback, and contribute! Follow our progress in [Issues](https://github.com/shelchin/svelte-i18n/issues).

---

## 🚀 Why @shelchin/svelte-i18n?

> **Stop wrestling with i18n libraries.** We've built the one that just works.

### 🎯 8 Reasons This Changes Everything:

1. **🤖 AI-Powered Translation Editor** - Non-developers can create translations with OpenAI integration. No JSON editing, no technical knowledge required.

2. **⚡ True Zero-Config** - Auto-discovers languages, auto-loads translations from static files, auto-detects user preferences. It literally just works.

3. **🔒 100% Type-Safe** - Every translation key is typed with auto-completion. Get suggestions as you type `i18n.t('...')`. Typos are compile-time errors.

4. **🎨 Svelte 5 Native** - Built with runes from the ground up. Not a port, not a wrapper - pure Svelte 5.

5. **🌐 Global Formatting** - Format dates, numbers, currencies for 100+ locales using native Intl API. Zero dependencies.

6. **📦 Enterprise-Ready** - Namespace isolation for micro-frontends, SSR support, post-build language addition via auto-discovery, comprehensive testing.

7. **💾 Translation Caching** - Save and resume translation work anytime. Browser-based IndexedDB storage keeps your progress safe.

8. **📂 Flexible Import Options** - Import from files, URLs, or resume incomplete translations. Supports multiple source languages for context.

---

## 💫 Quick Start

```bash
npm install @shelchin/svelte-i18n
```

**30 seconds to i18n:**

```typescript
// Setup
import { setupI18n } from '@shelchin/svelte-i18n';

const i18n = setupI18n({
	defaultLocale: 'en'
});

// Use
i18n.t('welcome', { name: 'World' }); // "Welcome, World!"
i18n.formatCurrency(99.99); // "$99.99" / "99,99 €" / "¥100"
i18n.formatRelativeTime(-2, 'day'); // "2 days ago" / "hace 2 días"
```

**That's it.** Seriously.

---

## 🔍 Auto-Discovery: Add Languages Without Touching Code

**Revolutionary for teams:** Translators can add new languages by simply dropping JSON files in `/static/translations/`. No code changes, no rebuilds, no deployments.

```typescript
// Package author enables auto-discovery
const i18n = setupI18n({
	namespace: 'my-package',
	autoDiscovery: true // ✨ Magic enabled
});
```

```json
// Anyone can add translations: /static/translations/my-package.fr.json
{
	"welcome": "Bienvenue",
	"goodbye": "Au revoir"
}
```

**The package automatically finds and loads it!** Perfect for:

- 📚 Component libraries that need user-provided translations
- 🏢 Enterprise apps where different teams manage translations
- 🚀 SaaS products with customer-specific translations
- 🎨 UI kits that ship without forcing specific languages

[Learn more about Auto-Discovery →](./docs/auto-discovery-api.md)

---

## ✨ Features That Will Spoil You

### 📝 Smart Translation Progress Tracking

```typescript
// Intelligent progress detection
// - Empty fields are untranslated
// - Any content (even "[TODO: translate]") counts as translated
// - Accurate progress percentage
// - Visual indicators for translation status
```

### 🤖 AI Translation Editor

```typescript
// Non-developers can translate your entire app
// 1. Upload your base translation file (or multiple for context)
// 2. AI translates everything with context awareness
// 3. Save progress and resume anytime
// 4. Export perfect JSON when ready
// Zero technical knowledge required
```

**New Features:**

- 📥 Import from files, URLs, or resume saved work
- 💬 Multiple source languages for better context
- 💾 Auto-save with browser caching
- 📊 Real-time progress tracking
- 🔄 Resume incomplete translations

### 🎯 Type Safety That Feels Like Magic

```typescript
// Auto-generated types with IDE auto-completion
import { createTypedI18n } from '@shelchin/svelte-i18n';

const i18n = createTypedI18n<TranslationSchema>(baseI18n);

// Start typing and get suggestions!
i18n.t('u'); // IDE suggests: 'user', 'user.profile', 'user.settings'...
i18n.t('user.profile.name'); // ✅ TypeScript knows this exists
i18n.t('user.proflie.name'); // ❌ TypeScript catches the typo
i18n.t('nonexistent.key'); // ❌ Compile error - ship with confidence

// Parameter validation too!
i18n.t('welcome', { name: 'World' }); // ✅ Correct parameters
i18n.t('welcome', { username: 'World' }); // ❌ Wrong parameter name
```

### 🔄 Hot-Reload Everything

```typescript
// Add languages without rebuilding
// Just drop a new JSON file in /translations
// It's instantly available - even in production!
```

### 💾 Translation Caching & Resume

```typescript
// Never lose your work
// - Auto-saves to browser IndexedDB
// - Resume from where you left off
// - Export/import incomplete translations
// - Includes metadata and progress
```

### 🏗️ Namespace Isolation for Micro-Frontends

```typescript
// Your app's translations
const app = setupI18n({ namespace: 'app' });

// Third-party library's translations
const lib = setupI18n({ namespace: 'library' });

// They never conflict. Ever.
```

### 📊 Global Formatting (100+ Locales)

```typescript
// One API for all formatting needs
i18n.formatNumber(1234567.89); // "1,234,567.89" / "1.234.567,89"
i18n.formatCurrency(99.99); // Auto-detects: "$99.99" / "99,99 €"
i18n.formatDate(new Date(), 'long'); // "January 9, 2025" / "9 de enero de 2025"
i18n.formatList(['A', 'B', 'C']); // "A, B, and C" / "A, B y C"
```

---

## 🛠️ Complete Example

```typescript
// 1. Setup (once in your app)
import { setupI18n, autoLoadLanguages } from '@shelchin/svelte-i18n';

const i18n = setupI18n({
  defaultLocale: 'en',
  fallbackLocale: 'en'
});

// Auto-discover and load all languages
await autoLoadLanguages(i18n);

// 2. Use in components
<script lang="ts">
  import { getI18n } from '@shelchin/svelte-i18n';

  const i18n = getI18n();
  const { t, locale, formatDate } = i18n;

  let name = $state('World');
</script>

<h1>{t('welcome', { name })}</h1>
<p>{t('today')}: {formatDate(new Date())}</p>

<button onclick={() => i18n.setLocale('es')}>
  Español
</button>
```

---

## 🎮 CLI Tools

Three powerful CLI tools to streamline your i18n workflow:

### 1. Extract Translation Keys

Scan your codebase and extract all translation keys to create a template:

```bash
# Extract keys from source code
npm run cli:extract ./src ./translations/template.json

# This will find patterns like:
# - i18n.t('demo.title')
# - $t('welcome')
# - getI18n().t('messages.error')
# - <Trans key="about.description">
```

**Output:** A JSON template with all discovered keys set to `[TODO: Add translation]`

### 2. Validate Translations

Ensure all translation files have consistent structure and no missing keys:

```bash
# Validate with default settings (src/translations directory)
npm run cli:validate

# Validate a specific directory
npm run cli:validate -- --dir ./static/translations

# Use strict validation with custom base locale
npm run cli:validate -- --dir ./src/translations/app --base en --strict

# Show help
npm run cli:validate -- --help
```

**Checks:**
- Missing translation keys
- Type mismatches between languages
- Extra keys (warnings)
- Structural consistency

### 3. Generate TypeScript Types

Auto-generate type-safe definitions from your translation files:

```bash
# Generate all types (library + app) with validation
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

**Output:**
- Library types: `src/lib/types/library-i18n-generated.ts`
- App types: `src/types/app-i18n-generated.ts`

**Benefits:**
- Full IntelliSense support
- Compile-time error checking
- Auto-completion for all translation keys
- Type-safe parameters for interpolated values

---

## 📦 What's Included

- ✅ **Core i18n Engine** - Reactive store with Svelte 5 runes
- ✅ **Translation Components** - `<Trans>`, `<LanguageSwitcher>`
- ✅ **Validation UI** - Beautiful popup showing missing translations
- ✅ **CLI Tools** - Extract, validate, generate types
- ✅ **AI Translation Editor** - Web-based translation tool
- ✅ **100+ Locale Support** - Via native Intl API
- ✅ **Full TypeScript** - Complete type definitions
- ✅ **Comprehensive Tests** - 90%+ coverage
- ✅ **SSR Support** - SvelteKit ready

---

## 🌍 Cross-Platform Support

### Universal i18n JSON Standard

This library follows the **Universal i18n JSON Standard** - a cross-platform standard that works with:

- 🦀 **Rust** - Generate structs with serde
- 🟢 **Node.js** - Native JSON support
- 🍎 **Swift/iOS** - Codable protocol support
- 🎯 **Flutter/Dart** - JSON serialization
- ⚛️ **React/Vue** - Direct compatibility
- 🤖 **Android** - Export to strings.xml

**One JSON format, all platforms.** [Learn more →](./docs/universal-i18n-standard.md)

### Supported Languages

Includes translations for 12 major languages out of the box:

- 🇬🇧 English
- 🇨🇳 中文 (Simplified & Traditional)
- 🇪🇸 Español
- 🇫🇷 Français
- 🇩🇪 Deutsch
- 🇯🇵 日本語
- 🇰🇷 한국어
- 🇷🇺 Русский
- 🇸🇦 العربية
- 🇵🇹 Português
- 🇮🇳 हिन्दी

Add any language post-deployment without rebuilding!

---

## 📖 Documentation

### Basic Usage

- [Quick Start Guide](./docs/quick-start.md)
- [Configuration](./docs/configuration.md)
- [Translation Files](./docs/translations.md)

### Advanced Features

- [Auto-Discovery API](./docs/auto-discovery-api.md) - 🆕 Automatic translation loading
- [Type Safety](./docs/type-safety.md)
- [Namespace Isolation](./docs/namespaces.md)
- [SSR with SvelteKit](./docs/ssr.md)
- [AI Translation Editor](./docs/editor.md)

### Universal Standards

- [Universal i18n JSON Standard](./docs/universal-i18n-standard.md) - Cross-platform i18n standard for Rust, Node.js, Swift, Flutter
- [Universal Translation Editor](./docs/translation-editor-standalone.md) - Standalone editor for any platform

### API Reference

- [Core API](./docs/api/core.md)
- [Formatting API](./docs/api/formatting.md)
- [Components](./docs/api/components.md)
- [CLI Tools](./docs/api/cli.md)

---

## 🤝 Contributing

We love contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development

```bash
# Clone and install
git clone https://github.com/atshelchin/svelte-i18n.git
cd svelte-i18n
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build
npm run build
```

---

## 📄 License

MIT © [Shelchin](https://github.com/atshelchin)

---

## 🙏 Acknowledgments

Built with ❤️ using:

- [Svelte 5](https://svelte.dev) - The best framework
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Vite](https://vitejs.dev) - Lightning fast builds

---

<div align="center">

**Stop searching. Start shipping.**

```bash
npm install @shelchin/svelte-i18n
```

[⭐ Star on GitHub](https://github.com/atshelchin/svelte-i18n) • [🐛 Report Bug](https://github.com/atshelchin/svelte-i18n/issues) • [💡 Request Feature](https://github.com/atshelchin/svelte-i18n/issues)

</div>
