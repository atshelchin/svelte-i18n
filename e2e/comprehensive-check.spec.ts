import { test, expect } from '@playwright/test';

test.describe('Comprehensive i18n check', () => {
	test('Check what is actually working', async ({ page }) => {
		// Enable console logging
		page.on('console', (msg) => {
			if (msg.type() === 'log') {
				console.log('Browser console:', msg.text());
			}
		});

		await page.goto('/');

		// Wait for page to load and auto-discovery
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(3000);

		// Check if LanguageSwitcher exists (use select.language-switcher)
		const languageSwitcher = page.locator('select.language-switcher');
		const switcherExists = (await languageSwitcher.count()) > 0;
		console.log('LanguageSwitcher exists:', switcherExists);

		let count = 0;

		if (switcherExists) {
			const options = languageSwitcher.locator('option');
			count = await options.count();
			console.log('Number of languages in switcher:', count);

			// List all languages
			for (let i = 0; i < count; i++) {
				const text = await options.nth(i).textContent();
				console.log(`  Language ${i + 1}: ${text}`);
			}
		}

		// Check if ValidationPopup floating indicator exists
		const floatingIndicator = page.locator('.floating-indicator');
		const indicatorExists = (await floatingIndicator.count()) > 0;
		console.log('Floating indicator exists:', indicatorExists);

		if (indicatorExists) {
			const text = await floatingIndicator.textContent();
			console.log('Floating indicator text:', text);

			// Check if it's showing translation or key
			const hasKey = text?.includes('validationPopup');
			console.log('Shows i18n key instead of translation:', hasKey);
		}

		// Check for validation popup itself
		const validationPopup = page.locator('.validation-popup');
		const popupExists = (await validationPopup.count()) > 0;
		console.log('Validation popup visible:', popupExists);

		// Check if there are any translation errors in console
		const errorTexts = await page.evaluate(() => {
			// Get any console errors about missing translations
			return (window as any).__translationErrors || [];
		});
		console.log('Translation errors:', errorTexts);

		// Check main app text
		const mainContent = page.locator('main');
		const mainText = await mainContent.textContent();

		// Check if showing i18n keys
		const hasI18nKeys = mainText?.includes('demo.') || mainText?.includes('welcome');
		console.log('Main content shows i18n keys:', hasI18nKeys);

		// Take a screenshot for debugging
		await page.screenshot({ path: 'test-results/comprehensive-check.png', fullPage: true });

		// Basic assertions to make test pass/fail
		expect(switcherExists).toBe(true);
		expect(count).toBeGreaterThan(0);

		console.log('\n=== Summary ===');
		console.log('Languages found:', count);
		console.log('ValidationPopup indicator:', indicatorExists ? 'visible' : 'not visible');
		console.log('UI shows keys:', hasI18nKeys ? 'YES (bug)' : 'NO (good)');
	});
});
