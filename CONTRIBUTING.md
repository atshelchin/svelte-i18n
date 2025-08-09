# Contributing to @shelchin/svelte-i18n

First off, thank you for considering contributing to @shelchin/svelte-i18n! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Your environment (OS, Node version, Svelte version)
- Code samples or a minimal reproduction

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

- A clear and descriptive title
- Detailed description of the proposed feature
- Use cases and examples
- Why this enhancement would be useful

### Adding Language Support

To add a new language translation:

1. Use the Translation Editor at `/editor` in the demo
2. Upload an existing language file (e.g., `en.json`)
3. Translate all keys to your target language
4. Submit a PR with your new language file

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Simple issues perfect for beginners
- `help wanted` - Issues where we need community help
- `documentation` - Help improve our docs

## Development Setup

```bash
# Clone the repository
git clone https://github.com/atshelchin/svelte-i18n.git
cd svelte-i18n

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Type checking
npm run check

# Linting
npm run lint
```

## Project Structure

```
svelte-i18n/
├── src/
│   ├── lib/           # Core library code
│   │   ├── store.svelte.ts    # Main i18n store
│   │   ├── formatter.ts       # Formatting utilities
│   │   ├── namespace.ts       # Namespace isolation
│   │   └── components/        # Svelte components
│   ├── cli/           # CLI tools
│   │   ├── extract.ts         # Key extraction
│   │   ├── validate.ts        # Translation validation
│   │   └── generate-types.ts  # Type generation
│   └── routes/        # Demo and editor pages
├── static/
│   └── translations/  # Translation files
└── tests/            # Test files
```

## Pull Request Process

1. **Fork and Clone**: Fork the repo and clone your fork
2. **Branch**: Create a branch (`git checkout -b feature/amazing-feature`)
3. **Code**: Make your changes
4. **Test**: Ensure all tests pass (`npm test`)
5. **Lint**: Fix any linting issues (`npm run lint`)
6. **Commit**: Use descriptive commit messages
7. **Push**: Push to your fork
8. **PR**: Open a Pull Request

### Commit Message Guidelines

We follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Maintenance tasks

Examples:

```
feat: add Arabic language support
fix: correct pluralization for Russian
docs: update TypeScript examples
```

## Style Guide

### TypeScript/JavaScript

- Use TypeScript for all new code
- Enable strict mode
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Svelte

- Use Svelte 5 runes (`$state`, `$derived`, etc.)
- Keep components small and focused
- Use TypeScript in `<script lang="ts">`
- Follow accessibility best practices

### CSS

- Use CSS custom properties for theming
- Mobile-first responsive design
- Ensure RTL language support

## Testing

We use Vitest for testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:unit

# Run specific test file
npm test src/lib/store.test.ts
```

### Writing Tests

- Write tests for all new features
- Maintain >80% code coverage
- Test edge cases and error conditions
- Use descriptive test names

Example:

```typescript
describe('formatNumber', () => {
	it('should format numbers with locale-specific separators', () => {
		expect(formatNumber(1234.56, 'en')).toBe('1,234.56');
		expect(formatNumber(1234.56, 'de')).toBe('1.234,56');
	});
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for all public functions
- Include parameter descriptions and return types
- Add examples for complex functionality

### README Updates

- Update README.md for new features
- Keep examples current
- Update the feature list

### Translation Documentation

- Document any new translation keys
- Update the Translation Editor guide
- Add examples for new formatting options

## CLI Development

When working on CLI tools:

1. Update `src/cli/` files
2. Build CLI: `npm run build:cli`
3. Test locally: `node dist/cli/index.js [command]`
4. Update help text and examples

## Release Process

Releases are automated via GitHub Actions:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a GitHub release
4. CI/CD automatically publishes to npm

## Questions?

Feel free to:

- Open an issue for questions
- Join discussions in existing issues
- Contact maintainers

Thank you for contributing! 🙏
