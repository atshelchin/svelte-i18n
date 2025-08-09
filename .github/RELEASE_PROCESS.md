# Release Process

This document describes the release process for @shelchin/svelte-i18n.

## Overview

We have two separate GitHub Actions workflows:

1. **NPM Package Publishing** (`npm-publish.yml`) - Builds and publishes the library to NPM
2. **Documentation Deployment** (`docs-deploy.yml`) - Builds and deploys the documentation site to GitHub Pages

## Release Types

### 1. Production Release (Stable)

For stable releases (e.g., `v1.0.0`):

```bash
# 1. Update version in package.json
npm version minor  # or major, patch

# 2. Commit and push
git add package.json
git commit -m "chore: release v1.0.0"
git push origin main

# 3. Create and push tag
git tag v1.0.0
git push origin v1.0.0
```

The GitHub Action will:

- Run tests
- Build the library
- Publish to NPM with tag `latest`
- Create a GitHub Release
- Trigger documentation deployment

### 2. Pre-release (Beta/Alpha/RC)

For pre-releases (e.g., `v1.0.0-beta.1`):

```bash
# 1. Update version
npm version prerelease --preid=beta

# 2. Commit and push
git add package.json
git commit -m "chore: release v1.0.0-beta.1"
git push origin main

# 3. Create and push tag
git tag v1.0.0-beta.1
git push origin v1.0.0-beta.1
```

The GitHub Action will:

- Automatically detect the pre-release type
- Publish to NPM with appropriate tag (`beta`, `alpha`, or `next`)
- Create a pre-release on GitHub

### 3. Manual Release

You can manually trigger a release from GitHub Actions:

1. Go to Actions → "Publish to NPM"
2. Click "Run workflow"
3. Enter:
   - Version (e.g., `1.0.0`)
   - NPM tag (`latest`, `beta`, `next`, or `alpha`)
4. Click "Run workflow"

## Documentation Deployment

Documentation is automatically deployed when:

1. **Code changes** are pushed to `main` branch (if they affect docs)
2. **After NPM publish** succeeds (automatically triggered)
3. **Manual trigger** via GitHub Actions

### Manual Documentation Deployment

1. Go to Actions → "Deploy Documentation to GitHub Pages"
2. Click "Run workflow"
3. Select branch and run

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **Major** (`1.0.0` → `2.0.0`): Breaking changes
- **Minor** (`1.0.0` → `1.1.0`): New features, backward compatible
- **Patch** (`1.0.0` → `1.0.1`): Bug fixes, backward compatible
- **Pre-release** (`1.0.0-beta.1`): Testing versions

## Pre-release Identifiers

- `alpha`: Early development, unstable
- `beta`: Feature complete, testing
- `rc`: Release candidate, final testing
- Custom: `next`, `dev`, `canary`, etc.

## NPM Tags

- `latest`: Current stable version (default)
- `beta`: Latest beta version
- `alpha`: Latest alpha version
- `next`: Next major version preview

## Checklist Before Release

### Code Quality

- [ ] All tests passing (`pnpm test`)
- [ ] Linting passing (`pnpm lint`)
- [ ] Type checking passing (`pnpm check`)
- [ ] Build successful (`pnpm build`)

### Documentation

- [ ] CHANGELOG.md updated
- [ ] README.md version badges correct
- [ ] API documentation updated
- [ ] Migration guide (if breaking changes)

### Version Management

- [ ] package.json version updated
- [ ] Version follows semver
- [ ] Pre-release identifier appropriate

### Testing

- [ ] Manual testing completed
- [ ] E2E tests passing
- [ ] Demo site working

## Post-Release

After a successful release:

1. **Verify NPM Package**

   ```bash
   npm view @shelchin/svelte-i18n
   npm install @shelchin/svelte-i18n@latest
   ```

2. **Check Documentation**
   - Visit https://shelchin.github.io/svelte-i18n/
   - Verify version info is updated

3. **GitHub Release**
   - Check release notes on GitHub
   - Verify assets attached

4. **Announce** (if major release)
   - Twitter/X
   - Discord/Slack communities
   - Blog post

## Rollback Process

If a release has issues:

### 1. Deprecate Bad Version

```bash
npm deprecate @shelchin/svelte-i18n@1.0.0 "Critical bug, use 1.0.1"
```

### 2. Publish Fix

```bash
# Fix the issue
git add .
git commit -m "fix: critical bug"

# Release patch
npm version patch
git push origin main
git tag v1.0.1
git push origin v1.0.1
```

### 3. Unpublish (Last Resort)

```bash
# Only within 72 hours of publish
npm unpublish @shelchin/svelte-i18n@1.0.0
```

## Secrets Required

These secrets must be set in GitHub repository settings:

- `NPM_TOKEN`: NPM automation token for publishing
- GitHub Pages: Automatically configured

## Troubleshooting

### NPM Publish Fails

1. Check NPM_TOKEN is valid
2. Verify package.json is valid
3. Check for conflicting versions
4. Review build output

### Documentation Deploy Fails

1. Check GitHub Pages is enabled
2. Verify build output exists
3. Check for build errors
4. Review workflow logs

### Tag Already Exists

```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# Recreate tag
git tag v1.0.0
git push origin v1.0.0
```

## Useful Commands

```bash
# View all tags
git tag -l

# View NPM versions
npm view @shelchin/svelte-i18n versions

# Test publish locally
npm pack

# Preview what will be published
npm publish --dry-run

# Check package contents
tar -tf shelchin-svelte-i18n-*.tgz
```
