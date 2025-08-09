# Release Process

This project uses automated branch-based releases:

## Branches

- **`main`** - Development branch, publishes with `dev` tag
- **`prod`** - Production branch, publishes with `latest` tag

## Version Format

- **Development**: `X.Y.Z-dev` or `X.Y.Z-dev.N` (e.g., `0.0.1-dev`, `1.0.0-dev.2`)
- **Production**: `X.Y.Z` (e.g., `1.0.0`, `2.1.3`)

## Release Workflow

### For Development Releases (main branch)

1. Update version in `package.json` to a dev version:
   ```json
   "version": "0.0.2-dev"
   ```

2. Commit and push to `main`:
   ```bash
   git add package.json
   git commit -m "chore: bump version to 0.0.2-dev"
   git push origin main
   ```

3. GitHub Actions will automatically:
   - Run tests
   - Build the package
   - Publish to NPM with `dev` tag
   - Create a git tag `v0.0.2-dev`
   - Create a GitHub release

### For Production Releases (prod branch)

1. Create/update `prod` branch from `main`:
   ```bash
   git checkout prod
   git merge main
   ```

2. Update version in `package.json` to stable version (remove `-dev`):
   ```json
   "version": "0.0.2"
   ```

3. Commit and push to `prod`:
   ```bash
   git add package.json
   git commit -m "chore: release version 0.0.2"
   git push origin prod
   ```

4. GitHub Actions will automatically:
   - Run tests
   - Build the package
   - Publish to NPM with `latest` tag
   - Create a git tag `v0.0.2`
   - Create a GitHub release

## Installation

Users can install versions using:

```bash
# Latest stable version
npm install @shelchin/svelte-i18n

# Latest development version
npm install @shelchin/svelte-i18n@dev

# Specific version
npm install @shelchin/svelte-i18n@0.0.1-dev
```

## Important Notes

1. **Always update the version** in `package.json` before pushing
2. **Version must be unique** - NPM doesn't allow republishing the same version
3. **main branch** should only contain `-dev` versions
4. **prod branch** should only contain stable versions (no suffix)
5. The workflow only triggers when `package.json` or source files change

## Version Bump Guidelines

- **Patch** (0.0.X): Bug fixes, minor updates
- **Minor** (0.X.0): New features, backward compatible
- **Major** (X.0.0): Breaking changes

For development versions, you can use additional numbers:
- `0.0.1-dev.1`, `0.0.1-dev.2`, etc. for multiple dev releases