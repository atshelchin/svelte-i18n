# GitHub Pages Deployment Guide

This guide explains how to deploy the Svelte i18n demo site to GitHub Pages.

## Automatic Deployment

The project is configured with GitHub Actions to automatically deploy to GitHub Pages whenever you push to the `main` branch.

### Setup Steps

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **The workflow will automatically:**
   - Build the project using `pnpm vite build`
   - Upload the build artifacts
   - Deploy to GitHub Pages

3. **Access your deployed site:**
   - Your site will be available at: `https://[your-username].github.io/[repository-name]/`
   - For example: `https://shelchin.github.io/svelte-i18n/`

## Manual Deployment

If you want to deploy manually:

```bash
# 1. Install dependencies
pnpm install

# 2. Build with the correct base path
BASE_PATH=/your-repo-name pnpm vite build

# 3. The build output will be in the `build` directory
```

## Configuration Details

### GitHub Actions Workflow

The deployment is handled by `.github/workflows/deploy.yml`:

- **Trigger:** Pushes to `main` branch or manual workflow dispatch
- **Build:** Uses pnpm and Node.js 20
- **Base Path:** Automatically set to match your repository name
- **Artifact:** Uploads the `build` directory

### SvelteKit Configuration

The `svelte.config.js` is configured for static site generation:

- **Adapter:** `@sveltejs/adapter-static`
- **Base Path:** Reads from `BASE_PATH` environment variable
- **Fallback:** 404.html for client-side routing

### Important Files

- `.nojekyll` - Tells GitHub Pages not to process files with Jekyll
- `404.html` - Fallback page for client-side routing
- `build/` - Static build output directory

## Troubleshooting

### Build Warnings

The build may show some Svelte warnings (accessibility, unused CSS selectors). These are non-critical and don't prevent deployment.

### Base Path Issues

If assets are not loading correctly:

1. Ensure the `BASE_PATH` environment variable matches your repository name
2. Check that all links use relative paths or the `base` store from SvelteKit

### 404 Errors

If you're getting 404 errors on routes:

1. Make sure the `404.html` fallback is included in the build
2. Verify that client-side routing is working correctly

## Development vs Production

- **Development:** Run `pnpm run dev` (no base path)
- **Production:** Deployed with base path matching repository name

## Updating the Demo

1. Make your changes locally
2. Test with `pnpm run preview`
3. Commit and push to `main`
4. GitHub Actions will automatically deploy

## Custom Domain

To use a custom domain:

1. Add a `CNAME` file to the `static` directory with your domain
2. Configure DNS settings as per GitHub's documentation
3. Update the base path configuration if needed
