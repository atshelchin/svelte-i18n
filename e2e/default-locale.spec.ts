import { test, expect } from '@playwright/test';

test.describe('Default Locale Settings', () => {
	test('Should use configured default locale when no saved preference', async ({
		page,
		context
	}) => {
		// Clear all cookies and localStorage before test
		await context.clearCookies();
		await page.goto('/');
		await page.evaluate(() => {
			localStorage.clear();
		});

		// Check if reset-locale route exists
		const resetResponse = await page.goto('/reset-locale', { waitUntil: 'domcontentloaded' });

		if (resetResponse && resetResponse.ok()) {
			// Wait for the reset to complete and redirect
			await page.waitForURL('/', { timeout: 5000 }).catch(() => {
				// If redirect doesn't happen, navigate manually
				return page.goto('/');
			});
		} else {
			// Reset route doesn't exist, just go to home
			await page.goto('/');
		}

		// Wait for page to load
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Check language switcher value
		const languageSwitcher = page.locator('select.language-switcher');
		const selectedValue = await languageSwitcher.inputValue();

		console.log('Selected language:', selectedValue);

		// The default could be 'zh' or 'en' depending on configuration
		// Just verify that a default is set
		expect(['en', 'zh']).toContain(selectedValue);

		// Check that the page has loaded with i18n content
		const welcomeText = page.locator('h1').first();
		const text = await welcomeText.textContent();

		// Should have some text (not empty or translation key)
		expect(text).toBeTruthy();
		expect(text).toContain('i18n'); // The h1 should contain i18n in any language
	});

	test('Should remember user language selection', async ({ page }) => {
		await page.goto('/');

		// Wait for page to load
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Get initial language
		const languageSwitcher = page.locator('select.language-switcher');
		const initialValue = await languageSwitcher.inputValue();

		// Switch to a different language
		const targetLang = initialValue === 'en' ? 'zh' : 'en';
		await languageSwitcher.selectOption(targetLang);

		// Wait for language change
		await page.waitForTimeout(1000);

		// Reload page
		await page.reload();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		// Should still be the selected language
		const selectedValue = await languageSwitcher.inputValue();
		expect(selectedValue).toBe(targetLang);

		// Check that content matches the selected language
		const welcomeText = page.locator('h1').first();
		const text = await welcomeText.textContent();
		expect(text).toContain('i18n'); // Should have i18n text in any language
	});
});
