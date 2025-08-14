import { describe, it, expect } from 'vitest';
import {
	getNestedValue,
	interpolate,
	pluralize,
	validateSchema,
	detectBrowserLanguage,
	mergeTranslations
} from '$lib/domain/services/utils.js';

describe('Utils', () => {
	describe('getNestedValue', () => {
		it('should get simple values', () => {
			const obj = { key: 'value' };
			expect(getNestedValue(obj, 'key')).toBe('value');
		});

		it('should get nested values', () => {
			const obj = {
				user: {
					profile: {
						name: 'Alice'
					}
				}
			};
			expect(getNestedValue(obj, 'user.profile.name')).toBe('Alice');
		});

		it('should return null for missing keys', () => {
			const obj = { key: 'value' };
			expect(getNestedValue(obj, 'missing')).toBeNull();
			expect(getNestedValue(obj, 'missing.nested.key')).toBeNull();
		});
	});

	describe('interpolate', () => {
		it('should replace single placeholder', () => {
			expect(interpolate('Hello {name}!', { name: 'World' })).toBe('Hello World!');
		});

		it('should replace multiple placeholders', () => {
			expect(
				interpolate('{greeting}, {name}!', {
					greeting: 'Hello',
					name: 'Alice'
				})
			).toBe('Hello, Alice!');
		});

		it('should handle missing params', () => {
			expect(interpolate('Hello {name}!', {})).toBe('Hello {name}!');
		});

		it('should handle number values', () => {
			expect(interpolate('Count: {count}', { count: 42 })).toBe('Count: 42');
		});

		it('should handle boolean values', () => {
			expect(interpolate('Active: {active}', { active: true })).toBe('Active: true');
		});
	});

	describe('pluralize', () => {
		it('should handle simple plural rules', () => {
			expect(pluralize('{count} item|{count} items', 1)).toBe('{count} item');
			expect(pluralize('{count} item|{count} items', 5)).toBe('{count} items');
		});

		it('should handle zero case', () => {
			expect(pluralize('No items|{count} item|{count} items', 0)).toBe('No items');
		});

		it('should fallback when no matching rule', () => {
			expect(pluralize('single', 5)).toBe('single');
		});
	});

	describe('validateSchema', () => {
		it('should pass for matching schemas', () => {
			const obj = { key: 'value', nested: { key: 'value' } };
			const schema = { key: 'string', nested: { key: 'string' } };

			expect(validateSchema(obj, schema)).toEqual([]);
		});

		it('should detect missing keys', () => {
			const obj = { key: 'value' };
			const schema = { key: 'string', missing: 'string' };

			const errors = validateSchema(obj, schema);
			expect(errors).toContain('Missing translation: missing');
		});

		it('should detect type mismatches', () => {
			const obj = { key: { nested: 'value' } };
			const schema = { key: 'string' };

			const errors = validateSchema(obj, schema);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0]).toContain('Type mismatch');
		});

		it('should validate nested structures', () => {
			const obj = { user: { name: 'Alice' } };
			const schema = { user: { name: 'string', email: 'string' } };

			const errors = validateSchema(obj, schema);
			expect(errors).toContain('Missing translation: user.email');
		});
	});

	describe('detectBrowserLanguage', () => {
		it('should detect from navigator.language', () => {
			const originalNavigator = global.navigator;

			Object.defineProperty(global, 'navigator', {
				value: { language: 'fr-FR' },
				writable: true
			});

			expect(detectBrowserLanguage()).toBe('fr');

			global.navigator = originalNavigator;
		});

		it('should fallback to navigator.languages', () => {
			const originalNavigator = global.navigator;

			Object.defineProperty(global, 'navigator', {
				value: {
					languages: ['de-DE', 'en-US']
				},
				writable: true
			});

			expect(detectBrowserLanguage()).toBe('de');

			global.navigator = originalNavigator;
		});

		it('should return null when not in browser', () => {
			const originalNavigator = global.navigator;

			Object.defineProperty(global, 'navigator', {
				value: undefined,
				writable: true
			});

			expect(detectBrowserLanguage()).toBeNull();

			global.navigator = originalNavigator;
		});
	});

	describe('mergeTranslations', () => {
		it('should merge flat objects', () => {
			const base = { a: '1', b: '2' };
			const override = { b: '3', c: '4' };

			expect(mergeTranslations(base, override)).toEqual({
				a: '1',
				b: '3',
				c: '4'
			});
		});

		it('should merge nested objects', () => {
			const base = {
				user: {
					name: 'Name',
					email: 'Email'
				}
			};

			const override = {
				user: {
					email: 'E-mail',
					phone: 'Phone'
				}
			};

			expect(mergeTranslations(base, override)).toEqual({
				user: {
					name: 'Name',
					email: 'E-mail',
					phone: 'Phone'
				}
			});
		});

		it('should handle empty objects', () => {
			expect(mergeTranslations({}, { a: '1' })).toEqual({ a: '1' });
			expect(mergeTranslations({ a: '1' }, {})).toEqual({ a: '1' });
			expect(mergeTranslations({}, {})).toEqual({});
		});

		it('should preserve _meta field', () => {
			const base = {
				_meta: { name: 'English' },
				key: 'value'
			};

			const override = {
				_meta: { name: 'French' },
				key: 'valeur'
			};

			const result = mergeTranslations(base, override);
			expect(result._meta).toEqual({ name: 'French' });
			expect(result.key).toBe('valeur');
		});
	});
});
