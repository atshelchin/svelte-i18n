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

	// 1. Try SvelteKit's runtime configuration (most reliable for SvelteKit apps)
	try {
		// SvelteKit generates a unique ID for each build, look for any __sveltekit_* global
		const globalKeys = Object.keys(globalThis).filter((key) => key.startsWith('__sveltekit_'));
		for (const key of globalKeys) {
			const sveltekitConfig = (globalThis as any)[key];
			if (sveltekitConfig?.base !== undefined) {
				console.debug('[i18n] Base path from SvelteKit runtime:', sveltekitConfig.base);
				return sveltekitConfig.base;
			}
		}

		// Also check for SvelteKit base in config
		const sveltekit = (globalThis as Record<string, unknown>).__sveltekit as
			| { env?: { PUBLIC_BASE_PATH?: string } }
			| undefined;
		if (sveltekit?.env?.PUBLIC_BASE_PATH) {
			console.debug('[i18n] Base path from env:', sveltekit.env.PUBLIC_BASE_PATH);
			return sveltekit.env.PUBLIC_BASE_PATH;
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

	// 4. For all other deployments, don't auto-detect base path from URL
	// Let SvelteKit or explicit configuration handle it

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
