# Release Process

This project uses automated branch-based releases:

## Branches

- **`main`** - Development branch, automatically adds `-dev` suffix, publishes with `dev` tag
- **`prod`** - Production branch, uses clean version, publishes with `latest` tag

## Version Management

**You only need to maintain the base version in `package.json` (e.g., `0.0.1`)**

The workflow automatically:
- Adds `-dev` suffix when publishing from `main` branch
- Uses clean version when publishing from `prod` branch

## Release Workflow

### For Development Releases (main branch)

1. Update version in `package.json`:
   ```json
   "version": "0.0.2"
   ```

2. Commit and push to `main`:
   ```bash
   git add package.json
   git commit -m "chore: bump version to 0.0.2"
   git push origin main
   ```

3. GitHub Actions will automatically:
   - Run tests
   - Build the package
   - Publish to NPM as `0.0.2-dev` with `dev` tag
   - **No git tag created for dev releases**

### For Production Releases (prod branch)

1. Create/update `prod` branch from `main`:
   ```bash
   git checkout prod
   git merge main
   ```

2. Push to `prod` (version in package.json stays clean, e.g., `0.0.2`):
   ```bash
   git push origin prod
   ```

3. GitHub Actions will automatically:
   - Run tests
   - Build the package
   - Publish to NPM as `0.0.2` with `latest` tag
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