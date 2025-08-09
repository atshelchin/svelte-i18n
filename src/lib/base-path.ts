/**
 * Get the base path for the application
 * This handles various deployment scenarios including GitHub Pages
 */
export function getAppBasePath(): string {
	// Server-side: use environment variable
	if (typeof window === 'undefined') {
		return process.env.BASE_PATH || '';
	}

	// Client-side: multiple detection strategies

	// 1. Try SvelteKit's app.paths.base (most reliable for SvelteKit apps)
	try {
		// @ts-expect-error - SvelteKit runtime global
		const app = globalThis.__sveltekit_app || globalThis.__sveltekit;
		if (app?.paths?.base) {
			console.debug('[i18n] Base path from SvelteKit:', app.paths.base);
			return app.paths.base;
		}

		// Also check for SvelteKit base in config
		// @ts-expect-error - SvelteKit runtime global
		if (globalThis.__sveltekit?.env?.PUBLIC_BASE_PATH) {
			console.debug('[i18n] Base path from env:', globalThis.__sveltekit.env.PUBLIC_BASE_PATH);
			return globalThis.__sveltekit.env.PUBLIC_BASE_PATH;
		}
	} catch {
		// Not in SvelteKit environment
	}

	// 2. Check for custom base path global
	const globalWithBasePath = globalThis as typeof globalThis & { __BASE_PATH?: string };
	if (globalWithBasePath.__BASE_PATH) {
		console.debug('[i18n] Base path from global:', globalWithBasePath.__BASE_PATH);
		return globalWithBasePath.__BASE_PATH;
	}

	// 3. Try to detect from <base> tag
	const baseElement = document.querySelector('base');
	if (baseElement?.href) {
		try {
			const baseUrl = new URL(baseElement.href);
			const basePath = baseUrl.pathname.replace(/\/$/, '');
			if (basePath) {
				console.debug('[i18n] Base path from <base> tag:', basePath);
				return basePath;
			}
		} catch {
			// Invalid base URL
		}
	}

	// 4. Auto-detect from URL for GitHub Pages and similar deployments
	const pathname = window.location.pathname;
	const hostname = window.location.hostname;

	// Check if we're on GitHub Pages (*.github.io)
	if (hostname.endsWith('.github.io')) {
		// Extract the repository name from the path
		const segments = pathname.split('/').filter(Boolean);
		if (segments.length > 0 && segments[0] !== 'translations') {
			const basePath = `/${segments[0]}`;
			console.debug('[i18n] Base path detected from GitHub Pages URL:', basePath);
			return basePath;
		}
	}

	// Check for other subdirectory deployments
	if (pathname !== '/' && !pathname.startsWith('/translations/')) {
		const segments = pathname.split('/').filter(Boolean);
		// If the first segment looks like a project name (no dots, not a file)
		if (segments.length > 0) {
			const firstSegment = segments[0];
			if (firstSegment && !firstSegment.includes('.') && firstSegment.length > 2) {
				const basePath = `/${firstSegment}`;
				console.debug('[i18n] Base path detected from URL:', basePath);
				return basePath;
			}
		}
	}

	console.debug('[i18n] No base path detected, using root');
	return '';
}

/**
 * Build a full URL for a static asset, accounting for base path
 */
export function buildAssetUrl(path: string): string {
	const basePath = getAppBasePath();
	// Ensure path starts with /
	const assetPath = path.startsWith('/') ? path : `/${path}`;
	// Combine base and asset path, avoiding double slashes
	const fullPath = basePath + assetPath;
	console.debug(`[i18n] Asset URL: ${fullPath} (base: ${basePath}, asset: ${assetPath})`);
	return fullPath;
}
