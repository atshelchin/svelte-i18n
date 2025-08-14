import type { I18nConfig } from '$lib/domain/models/types.js';

/**
 * Global configuration manager for i18n
 * Allows packages to inherit configuration from the main app
 */
class ConfigManager {
	private configs = new Map<string, I18nConfig>();
	private mainConfig: I18nConfig | null = null;

	/**
	 * Register a configuration
	 * @param namespace - The namespace (use 'app' for main application)
	 * @param config - The i18n configuration
	 * @param isMain - Whether this is the main app configuration
	 */
	register(namespace: string, config: I18nConfig, isMain = false): void {
		this.configs.set(namespace, config);
		if (isMain || namespace === 'app') {
			this.mainConfig = config;
		}
	}

	/**
	 * Get configuration for a namespace
	 * Packages will inherit from main app config if available
	 */
	getConfig(namespace: string): I18nConfig | null {
		// If requesting package config and main app exists, merge configs
		if (namespace !== 'app' && this.mainConfig) {
			const packageConfig = this.configs.get(namespace);
			if (packageConfig) {
				// Merge with main config (main config takes precedence for shared settings)
				return {
					...packageConfig,
					defaultLocale: this.mainConfig.defaultLocale,
					fallbackLocale: this.mainConfig.fallbackLocale,
					interpolation: this.mainConfig.interpolation || packageConfig.interpolation,
					formats: this.mainConfig.formats || packageConfig.formats,
					// Keep package namespace
					namespace: packageConfig.namespace
				};
			}
		}

		return this.configs.get(namespace) || null;
	}

	/**
	 * Get the main app configuration
	 */
	getMainConfig(): I18nConfig | null {
		return this.mainConfig;
	}

	/**
	 * Check if a namespace is registered
	 */
	has(namespace: string): boolean {
		return this.configs.has(namespace);
	}

	/**
	 * Clear all configurations (useful for testing)
	 */
	clear(): void {
		this.configs.clear();
		this.mainConfig = null;
	}
}

export const configManager = new ConfigManager();
