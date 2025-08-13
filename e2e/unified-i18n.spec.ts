import { test, expect } from '@playwright/test';

test.describe('Unified i18n system', () => {
	test('Library components should use app locale and show correct translations', async ({
		page
	}) => {
		// Go to the demo page
		await page.goto('/');

		// Check that the ValidationPopup component shows actual translations, not keys
		// Look for the floating indicator
		const floatingIndicator = page.locator('.floating-indicator');

		// The text should be actual translation, not the key
		await expect(floatingIndicator).toContainText('Translation Issues');
		await expect(floatingIndicator).not.toContainText(
			'validationPopup.floatingIndicator.translationIssues'
		);

		// Click to open the popup
		await floatingIndicator.click();

		// Check the popup header
		const popupTitle = page.locator('.header-title');
		await expect(popupTitle).toContainText('Translation Validation Report');
		await expect(popupTitle).not.toContainText('validationPopup.header.title');

		// Check language selector label
		const langLabel = page.locator('.language-selector label');
		await expect(langLabel).toContainText('Language:');
		await expect(langLabel).not.toContainText('validationPopup.controls.languageLabel');
	});

	test('LanguageSwitcher should show all 12 languages', async ({ page }) => {
		await page.goto('/');

		// Find the language switcher
		const languageSwitcher = page.locator('.language-switcher');

		// Get all options
		const options = languageSwitcher.locator('option');
		const count = await options.count();

		// Should have 12 languages total (7 built-in + 5 auto-discovered)
		expect(count).toBe(12);

		// Check for specific languages
		const expectedLanguages = [
			'English', // en
			'中文', // zh
			'日本語', // ja
			'Français', // fr
			'Deutsch', // de
			'العربية', // ar
			'繁體中文', // zh-TW
			'Español', // es
			'हिन्दी', // hi
			'한국어', // ko
			'Português', // pt
			'Русский' // ru
		];

		for (const lang of expectedLanguages) {
			const option = options.filter({ hasText: lang });
			await expect(option).toHaveCount(1, { message: `Should have option for ${lang}` });
		}
	});

	test('Library i18n should follow app locale changes', async ({ page }) => {
		await page.goto('/');

		// Switch to Chinese
		const languageSwitcher = page.locator('.language-switcher');
		await languageSwitcher.selectOption('zh');

		// Wait for locale change
		await page.waitForTimeout(500);

		// Check that library components now show Chinese translations
		const floatingIndicator = page.locator('.floating-indicator');
		await expect(floatingIndicator).toContainText('翻译问题');

		// Open popup
		await floatingIndicator.click();

		// Check popup shows Chinese
		const popupTitle = page.locator('.header-title');
		await expect(popupTitle).toContainText('翻译验证报告');

		// Switch back to English
		await languageSwitcher.selectOption('en');
		await page.waitForTimeout(500);

		// Should be back to English
		await expect(popupTitle).toContainText('Translation Validation Report');
	});

	test('ValidationPopup should detect missing translations', async ({ page }) => {
		await page.goto('/');

		// The ValidationPopup should be visible if there are missing translations
		const floatingIndicator = page.locator('.floating-indicator');

		// Should show error count
		const errorCount = floatingIndicator.locator('.indicator-count');
		const count = await errorCount.textContent();
		expect(parseInt(count || '0')).toBeGreaterThan(0);

		// Click to open
		await floatingIndicator.click();

		// Should show languages with errors
		const languageSelect = page.locator('#language-select');
		const options = languageSelect.locator('option');

		// At least one language should have errors
		const optionCount = await options.count();
		expect(optionCount).toBeGreaterThan(0);

		// Select first language with errors
		await languageSelect.selectOption({ index: 0 });

		// Should show error list
		const errorItems = page.locator('.error-item');
		const errorItemCount = await errorItems.count();
		expect(errorItemCount).toBeGreaterThan(0);

		// Each error should mention "Missing translation"
		const firstError = errorItems.first();
		await expect(firstError).toContainText('Missing translation');
	});
});
