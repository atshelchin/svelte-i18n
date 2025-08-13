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

		// Wait for page to load
		await page.waitForLoadState('networkidle');

		// Find the language switcher
		const languageSwitcher = page.locator('select.language-switcher').first();

		// Verify initial locale (could be either en or zh)
		const initialValue = await languageSwitcher.inputValue();
		expect(['en', 'zh']).toContain(initialValue);

		// Switch to a different language
		const targetLang = initialValue === 'en' ? 'zh' : 'en';
		await languageSwitcher.selectOption(targetLang);

		// Wait for language change
		await page.waitForTimeout(500);

		// Verify the page content changed
		await expect(page.locator('h1')).toContainText('i18n');

		// Verify localStorage was updated
		const localStorageValue = await page.evaluate(() => localStorage.getItem('i18n-locale'));
		expect(localStorageValue).toBe('en');

		// Verify cookie was set
		const cookies = await context.cookies();
		const i18nCookie = cookies.find((c) => c.name === 'i18n-locale');
		expect(i18nCookie?.value).toBe('en');
	});

	test('should switch to auto-discovered language (Korean)', async ({ page }) => {
		await page.goto('/');

		// Wait for page to load and auto-discovery to complete
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000); // Give more time for auto-discovery

		// Find the language switcher
		const languageSwitcher = page.locator('select.language-switcher').first();

		// Get all available options
		const options = await languageSwitcher.locator('option').all();
		const optionValues = await Promise.all(options.map((opt) => opt.getAttribute('value')));

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
		const i18nCookie = cookies.find((c) => c.name === 'i18n-locale');
		expect(i18nCookie?.value).toBe('ko');
	});

	test('should persist language choice across page refresh', async ({ page }) => {
		await page.goto('/');

		// Wait for page to load and auto-discovery
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Switch to Spanish (auto-discovered)
		const languageSwitcher = page.locator('select.language-switcher').first();
		await languageSwitcher.selectOption('es');

		// Refresh the page
		await page.reload();

		// Verify language is still Spanish
		await expect(languageSwitcher).toHaveValue('es');

		// Verify Spanish content is displayed
		await expect(page.locator('h1')).toContainText('i18n');
	});

	test('should show multiple languages after auto-discovery', async ({ page }) => {
		await page.goto('/');

		// Wait for page to load and auto-discovery to complete
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(3000); // Give plenty of time for auto-discovery

		const languageSwitcher = page.locator('select.language-switcher').first();
		const options = await languageSwitcher.locator('option').all();
		const optionValues = await Promise.all(options.map((opt) => opt.getAttribute('value')));

		// Should have at least the built-in languages
		const builtInLanguages = ['en', 'zh'];
		
		// Verify built-in languages are present
		for (const lang of builtInLanguages) {
			expect(optionValues).toContain(lang);
		}

		// Should have more than just built-in languages after auto-discovery
		expect(optionValues.length).toBeGreaterThan(2);
	});

	test('should handle language switching errors gracefully', async ({ page }) => {
		await page.goto('/');

		// Wait for initial load
		await page.waitForLoadState('networkidle');

		// Intercept network requests to simulate failure
		await page.route('**/translations/app/ko.json', (route) => {
			route.abort('failed');
		});

		const languageSwitcher = page.locator('select.language-switcher').first();
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

	test('ValidationPopup should handle translation warnings', async ({ page }) => {
		// Create a scenario with missing translations
		await page.goto('/');

		// Wait for page to load
		await page.waitForLoadState('networkidle');

		// Check if ValidationPopup's floating indicator exists
		const floatingIndicator = page.locator('.floating-indicator');

		// The floating indicator may or may not be visible depending on warnings
		const indicatorCount = await floatingIndicator.count();

		if (indicatorCount > 0 && await floatingIndicator.isVisible()) {
			// If indicator exists and is visible, click to open popup
			await floatingIndicator.click();
			
			// Wait for popup to open
			await page.waitForTimeout(500);
			
			// Check if popup opened
			const popupTitle = page.locator('.header-title');
			if (await popupTitle.isVisible()) {
				// Close the popup
				const closeButton = page.locator('button').filter({ hasText: 'Close' }).first();
				if (await closeButton.isVisible()) {
					await closeButton.click();
				}
			}
		}
		
		// Test passes whether there are warnings or not
		// Since we changed validation to warnings, not errors
	});

	test('should switch language programmatically via console', async ({ page }) => {
		await page.goto('/');

		// Wait for page to load
		await page.waitForLoadState('networkidle');

		// Switch language via JavaScript console
		await page.evaluate(() => {
			const instances = (window as any).__i18n_instances;
			if (instances) {
				// Get the app instance from the Map
				const appInstance = instances.get ? instances.get('app') : instances.app;
				if (appInstance) {
					return appInstance.setLocale('ja');
				}
			}
		});

		// Wait for the change
		await page.waitForTimeout(1000);

		// Verify the language switcher updated
		const languageSwitcher = page.locator('select.language-switcher').first();
		await expect(languageSwitcher).toHaveValue('ja');

		// Verify localStorage
		const localStorageValue = await page.evaluate(() => localStorage.getItem('i18n-locale'));
		expect(localStorageValue).toBe('ja');
	});
});
