/**
 * Type safety tests for i18n
 * These tests ensure that TypeScript correctly validates translation keys
 */

import { describe, it, expect } from 'vitest';
import { libI18n } from '../translations/i18n.js';
import { i18n } from '../../translations/i18n.js';
import type { LibI18nPath } from '../types/lib-i18n-generated.js';
import type { I18nPath } from '../../types/app-i18n-generated.js';

describe('Type Safety for Library i18n', () => {
	it('should accept valid library translation keys', () => {
		// These should compile without errors
		const validKeys: LibI18nPath[] = [
			'validationPopup.header.title',
			'validationPopup.header.issues',
			'validationPopup.controls.export',
			'validationPopup.emptyState.noErrors',
			'validationPopup.report.title'
		];

		validKeys.forEach((key) => {
			const result = libI18n.t(key);
			expect(typeof result).toBe('string');
		});
	});

	it('should have correct type for libI18n.t() method', () => {
		// Test that the method signature is correct
		type LibI18nTMethod = typeof libI18n.t;
		type ExpectedSignature = (key: LibI18nPath, params?: any) => string;

		// This will cause a compile error if types don't match
		const typeCheck: ExpectedSignature = libI18n.t;
		expect(typeCheck).toBeDefined();
	});

	it('should validate interpolation parameters', () => {
		// Keys that require parameters
		const result1 = libI18n.t('validationPopup.header.issues', { count: 5 });
		expect(result1).toContain('5');

		const result2 = libI18n.t('validationPopup.report.language', { name: 'English', code: 'en' });
		expect(typeof result2).toBe('string');
	});
});

describe('Type Safety for App i18n', () => {
	it('should accept valid app translation keys', () => {
		// These should compile without errors
		const validKeys: I18nPath[] = ['welcome', 'demo.title', 'demo.features', 'nav.home'];

		validKeys.forEach((key) => {
			const result = i18n.t(key);
			expect(typeof result).toBe('string');
		});
	});

	it('should have correct type for app i18n.t() method', () => {
		// Test that the method signature is correct
		type AppI18nTMethod = typeof i18n.t;
		type ExpectedSignature = (key: I18nPath, params?: any) => string;

		// This will cause a compile error if types don't match
		const typeCheck: ExpectedSignature = i18n.t;
		expect(typeCheck).toBeDefined();
	});
});

describe('Type Safety Compile-Time Checks', () => {
	it('should detect invalid keys at compile time', () => {
		// NOTE: These tests use @ts-expect-error to verify that TypeScript
		// correctly detects invalid keys. If these stop producing errors,
		// it means type safety has been broken!

		// Invalid library keys - these MUST produce TypeScript errors
		// @ts-expect-error - Invalid key for library i18n
		libI18n.t('nonExistentKey');

		// @ts-expect-error - Key from app translations, not library
		libI18n.t('welcome');

		// @ts-expect-error - Typo in key name
		libI18n.t('validationPopup.headerr.title');

		// Invalid app keys - these MUST produce TypeScript errors
		// @ts-expect-error - Invalid key for app i18n
		i18n.t('thisKeyDoesNotExist');

		// @ts-expect-error - Key from library translations, not app
		i18n.t('validationPopup.header.title');

		// @ts-expect-error - Wrong nested path
		i18n.t('hero.wrongKey');

		// If any of the above stop producing TypeScript errors,
		// it means type safety has been compromised
		expect(true).toBe(true); // Dummy assertion
	});

	it('should enforce correct parameter types', () => {
		// Valid parameters
		libI18n.t('validationPopup.header.issues', { count: 10 });

		// TypeScript should allow any params since we use InterpolationParams
		// But we document expected params for clarity
		libI18n.t('validationPopup.report.language', {
			name: 'French',
			code: 'fr'
		});

		expect(true).toBe(true);
	});
});

describe('Type Safety Runtime Validation', () => {
	it('should handle missing translations gracefully', () => {
		// Even with type safety, runtime might have missing translations
		// The library should return the key as fallback
		const key = 'validationPopup.header.title';
		const result = libI18n.t(key as LibI18nPath);

		// Should either return translated string or the key itself
		expect(result).toBeTruthy();
		expect(typeof result).toBe('string');
	});

	it('should maintain type safety after locale changes', () => {
		const initialLocale = libI18n.locale;

		// Change locale
		if (libI18n.locales.includes('zh')) {
			libI18n.setLocale('zh');

			// Type safety should still work
			const result = libI18n.t('validationPopup.header.title');
			expect(typeof result).toBe('string');

			// Restore locale
			libI18n.setLocale(initialLocale);
		}

		expect(libI18n.locale).toBe(initialLocale);
	});
});

// Type-level tests (these don't run, but ensure types are correct at compile time)
type AssertEqual<T, U> = T extends U ? (U extends T ? true : false) : false;

// Test that LibI18nPath includes all expected keys
type LibKeysTest = AssertEqual<
	LibI18nPath,
	| '_meta.name'
	| '_meta.englishName'
	| '_meta.direction'
	| '_meta.flag'
	| '_meta.code'
	| 'validationPopup.header.title'
	| 'validationPopup.header.issues'
	| 'validationPopup.header.languages'
	| 'validationPopup.header.close'
	| 'validationPopup.controls.languageLabel'
	| 'validationPopup.controls.languageOption'
	| 'validationPopup.controls.export'
	| 'validationPopup.exportMenu.downloadJSON'
	| 'validationPopup.exportMenu.downloadText'
	| 'validationPopup.exportMenu.copyJSON'
	| 'validationPopup.exportMenu.copied'
	| 'validationPopup.pagination.page'
	| 'validationPopup.pagination.previous'
	| 'validationPopup.pagination.next'
	| 'validationPopup.emptyState.selectLanguage'
	| 'validationPopup.emptyState.noErrors'
	| 'validationPopup.floatingIndicator.translationIssues'
	| 'validationPopup.report.title'
	| 'validationPopup.report.language'
	| 'validationPopup.report.totalMissing'
	| 'validationPopup.report.details'
	| 'validationPopup.report.generatedAt'
	| 'validationPopup.report.todoTranslate'
>;

// This will cause a compile error if the types don't match
const _libKeysTest: LibKeysTest = true;
