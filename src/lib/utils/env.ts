/**
 * Simple environment detection without external dependencies
 * This is used to avoid adding dependencies like esm-env
 */

// Check if we're in development mode
// This works for most bundlers including Vite, Webpack, Rollup
export const DEV = (() => {
	// Check common ways to detect dev mode
	if (typeof process !== 'undefined' && process.env) {
		return process.env.NODE_ENV !== 'production';
	}

	// For browser environments without process
	// We use try-catch because import.meta is a syntax construct
	try {
		if (import.meta && import.meta.env) {
			return import.meta.env.DEV === true || import.meta.env.MODE === 'development';
		}
	} catch {
		// import.meta doesn't exist in this environment
	}

	// Default to production for safety
	return false;
})();
