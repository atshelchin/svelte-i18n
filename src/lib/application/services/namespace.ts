/**
 * Namespace management for isolated i18n instances
 * Prevents conflicts between applications and third-party libraries
 */

import type { I18nInstance } from '../../domain/models/types.js';

// Global namespace registry
const namespaceRegistry = new Map<string, I18nInstance>();
const namespaceTypes = new Map<string, unknown>();

export interface NamespaceConfig {
	namespace: string;
	typeDefs?: unknown;
	preventDuplicatePopups?: boolean;
}

/**
 * Register a namespace with its i18n instance
 */
export function registerNamespace(
	namespace: string,
	instance: I18nInstance,
	typeDefs?: unknown
): void {
	if (namespaceRegistry.has(namespace)) {
		console.warn(`Namespace "${namespace}" is already registered. Overwriting...`);
	}

	namespaceRegistry.set(namespace, instance);

	if (typeDefs) {
		namespaceTypes.set(namespace, typeDefs);
	}
}

/**
 * Get i18n instance by namespace
 */
export function getNamespace(namespace: string): I18nInstance | undefined {
	return namespaceRegistry.get(namespace);
}

/**
 * Get all registered namespaces
 */
export function getAllNamespaces(): string[] {
	return Array.from(namespaceRegistry.keys());
}

/**
 * Get type definitions for a namespace
 */
export function getNamespaceTypes(namespace: string): unknown {
	return namespaceTypes.get(namespace);
}

/**
 * Check if a namespace exists
 */
export function hasNamespace(namespace: string): boolean {
	return namespaceRegistry.has(namespace);
}

/**
 * Clear a namespace
 */
export function clearNamespace(namespace: string): void {
	namespaceRegistry.delete(namespace);
	namespaceTypes.delete(namespace);
}

/**
 * Get validation errors by namespace
 * Used to prevent duplicate popups
 */
export function getNamespaceErrors(): Map<string, string[]> {
	const errors = new Map<string, string[]>();

	for (const [namespace, instance] of namespaceRegistry) {
		const instanceErrors = instance.errors;
		if (Object.keys(instanceErrors).length > 0) {
			// Flatten errors for this namespace
			const flatErrors: string[] = [];
			for (const [, localeErrors] of Object.entries(instanceErrors)) {
				localeErrors.forEach((error) => {
					flatErrors.push(`[${namespace}] ${error}`);
				});
			}
			if (flatErrors.length > 0) {
				errors.set(namespace, flatErrors);
			}
		}
	}

	return errors;
}

/**
 * Merge type definitions from multiple namespaces
 * Useful for applications using multiple libraries
 */
export function mergeNamespaceTypes(...namespaces: string[]): Record<string, unknown> {
	const merged: Record<string, unknown> = {};

	for (const namespace of namespaces) {
		const types = namespaceTypes.get(namespace);
		if (types) {
			merged[namespace] = types;
		}
	}

	return merged;
}

/**
 * Create isolated validation popup controller
 * Prevents duplicate popups from different namespaces
 */
class ValidationPopupController {
	private static instance: ValidationPopupController;
	private activeNamespace: string | null = null;

	static getInstance(): ValidationPopupController {
		if (!ValidationPopupController.instance) {
			ValidationPopupController.instance = new ValidationPopupController();
		}
		return ValidationPopupController.instance;
	}

	canShowPopup(namespace: string): boolean {
		// Only one popup at a time
		if (this.activeNamespace && this.activeNamespace !== namespace) {
			return false;
		}
		return true;
	}

	setActivePopup(namespace: string | null): void {
		this.activeNamespace = namespace;
	}

	getActiveNamespace(): string | null {
		return this.activeNamespace;
	}
}

export const validationPopupController = ValidationPopupController.getInstance();
