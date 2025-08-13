import { test, expect } from '@playwright/test';

test.describe('Default Locale Settings', () => {
	test('Should use zh as default locale when no saved preference', async ({ page, context }) => {
		// Clear all cookies and localStorage before test
		await context.clearCookies();
		await page.goto('/');
		await page.evaluate(() => {
			localStorage.clear();
		});

		// Navigate to reset page to clear settings
		await page.goto('/reset-locale');

		// Wait for the reset to complete and redirect
		await page.waitForURL('/', { timeout: 5000 });

		// Check console logs
		page.on('console', (msg) => {
			if (msg.text().includes('Locale initialization:')) {
				console.log('Locale debug:', msg.text());
			}
		});

		// Reload to trigger fresh initialization
		await page.reload();
		await page.waitForTimeout(1000);

		// Check if Chinese is being used
		const welcomeText = page.locator('h1').first();
		const text = await welcomeText.textContent();

		console.log('Welcome text:', text);

		// Should contain Chinese text if zh is the default
		const hasChineseText = /[\u4e00-\u9fa5]/.test(text || '');
		expect(hasChineseText).toBe(true);

		// Check language switcher shows zh as selected
		const languageSwitcher = page.locator('.language-switcher');
		const selectedValue = await languageSwitcher.inputValue();

		console.log('Selected language:', selectedValue);
		expect(selectedValue).toBe('zh');

		// Verify by checking specific Chinese translations
		const pageContent = await page.content();
		const hasSvelteI18nChinese = pageContent.includes('Svelte 国际化');

		expect(hasSvelteI18nChinese).toBe(true);
	});

	test('Should remember user language selection', async ({ page }) => {
		await page.goto('/');

		// Switch to English
		const languageSwitcher = page.locator('.language-switcher');
		await languageSwitcher.selectOption('en');

		// Wait for language change
		await page.waitForTimeout(500);

		// Reload page
		await page.reload();
		await page.waitForTimeout(1000);

		// Should still be English
		const selectedValue = await languageSwitcher.inputValue();
		expect(selectedValue).toBe('en');

		// Check English text is shown
		const welcomeText = page.locator('h1').first();
		const text = await welcomeText.textContent();
		expect(text).toContain('Svelte i18n');
	});
});
