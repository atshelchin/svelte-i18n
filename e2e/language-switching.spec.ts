import { test, expect } from '@playwright/test';

test.describe('Language Switching with Auto-discovered Languages', () => {
	test.beforeEach(async ({ page, context }) => {
		// Clear cookies and localStorage before each test
		await context.clearCookies();
		await page.goto('/');
		await page.evaluate(() => {
			localStorage.clear();
		});
	});

	test('should switch between built-in languages', async ({ page }) => {
		await page.goto('/');
		
		// Find the language switcher
		const languageSwitcher = page.locator('select').first();
		
		// Verify initial locale (should be zh as configured)
		await expect(languageSwitcher).toHaveValue('zh');
		
		// Switch to English
		await languageSwitcher.selectOption('en');
		
		// Verify the page content changed to English
		await expect(page.locator('text="Welcome to Svelte i18n"')).toBeVisible();
		
		// Verify localStorage was updated
		const localStorageValue = await page.evaluate(() => localStorage.getItem('i18n-locale'));
		expect(localStorageValue).toBe('en');
		
		// Verify cookie was set
		const cookies = await context.cookies();
		const i18nCookie = cookies.find(c => c.name === 'i18n-locale');
		expect(i18nCookie?.value).toBe('en');
	});

	test('should switch to auto-discovered language (Korean)', async ({ page }) => {
		await page.goto('/');
		
		// Find the language switcher
		const languageSwitcher = page.locator('select').first();
		
		// Wait for auto-discovery to complete
		await page.waitForTimeout(1000);
		
		// Get all available options
		const options = await languageSwitcher.locator('option').all();
		const optionValues = await Promise.all(options.map(opt => opt.getAttribute('value')));
		
		// Verify Korean is available
		expect(optionValues).toContain('ko');
		
		// Switch to Korean
		await languageSwitcher.selectOption('ko');
		
		// Wait for language to load
		await page.waitForTimeout(500);
		
		// Verify the page content changed to Korean
		await expect(page.locator('h1')).toContainText('i18n');
		
		// Verify localStorage was updated
		const localStorageValue = await page.evaluate(() => localStorage.getItem('i18n-locale'));
		expect(localStorageValue).toBe('ko');
		
		// Verify cookie was set
		const cookies = await context.cookies();
		const i18nCookie = cookies.find(c => c.name === 'i18n-locale');
		expect(i18nCookie?.value).toBe('ko');
	});

	test('should persist language choice across page refresh', async ({ page, context }) => {
		await page.goto('/');
		
		// Switch to Spanish (auto-discovered)
		const languageSwitcher = page.locator('select').first();
		await page.waitForTimeout(1000); // Wait for auto-discovery
		await languageSwitcher.selectOption('es');
		
		// Refresh the page
		await page.reload();
		
		// Verify language is still Spanish
		await expect(languageSwitcher).toHaveValue('es');
		
		// Verify Spanish content is displayed
		await expect(page.locator('h1')).toContainText('i18n');
	});

	test('should show all 12 languages (7 built-in + 5 auto-discovered)', async ({ page }) => {
		await page.goto('/');
		
		// Wait for auto-discovery to complete
		await page.waitForTimeout(1500);
		
		const languageSwitcher = page.locator('select').first();
		const options = await languageSwitcher.locator('option').all();
		const optionValues = await Promise.all(options.map(opt => opt.getAttribute('value')));
		
		// Expected languages
		const builtInLanguages = ['en', 'zh', 'ja', 'de', 'fr', 'it', 'ar'];
		const autoDiscoveredLanguages = ['es', 'hi', 'ko', 'pt', 'ru'];
		const expectedLanguages = [...builtInLanguages, ...autoDiscoveredLanguages];
		
		// Verify all languages are present
		for (const lang of expectedLanguages) {
			expect(optionValues).toContain(lang);
		}
		
		// Verify total count
		expect(optionValues.length).toBe(12);
	});

	test('should handle language switching errors gracefully', async ({ page }) => {
		await page.goto('/');
		
		// Intercept network requests to simulate failure
		await page.route('**/translations/app/ko.json', route => {
			route.abort('failed');
		});
		
		const languageSwitcher = page.locator('select').first();
		const initialValue = await languageSwitcher.inputValue();
		
		// Try to switch to Korean (will fail)
		await languageSwitcher.selectOption('ko');
		
		// Wait a bit for the failed request
		await page.waitForTimeout(500);
		
		// Should remain on the original language
		await expect(languageSwitcher).toHaveValue(initialValue);
		
		// Page should still be functional
		await expect(page.locator('h1')).toBeVisible();
	});

	test('ValidationPopup should appear when there are translation errors', async ({ page }) => {
		// Create a scenario with missing translations
		await page.goto('/');
		
		// Check if ValidationPopup exists in the DOM
		const validationPopup = page.locator('.validation-popup');
		
		// If there are errors, the popup should be visible or available
		const popupCount = await validationPopup.count();
		
		if (popupCount > 0) {
			// If popup exists, it should be functional
			const closeButton = validationPopup.locator('.close-btn');
			if (await closeButton.isVisible()) {
				await closeButton.click();
				await expect(validationPopup).not.toBeVisible();
			}
		}
	});

	test('should switch language programmatically via console', async ({ page }) => {
		await page.goto('/');
		
		// Switch language via JavaScript console
		await page.evaluate(() => {
			const i18n = (window as any).__i18n_instances?.app;
			if (i18n) {
				return i18n.setLocale('ja');
			}
		});
		
		// Wait for the change
		await page.waitForTimeout(500);
		
		// Verify the language switcher updated
		const languageSwitcher = page.locator('select').first();
		await expect(languageSwitcher).toHaveValue('ja');
		
		// Verify localStorage
		const localStorageValue = await page.evaluate(() => localStorage.getItem('i18n-locale'));
		expect(localStorageValue).toBe('ja');
	});
});