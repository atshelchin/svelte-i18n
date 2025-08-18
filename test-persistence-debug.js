import { chromium } from '@playwright/test';

async function debugPersistence() {
	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();

	// Enable console logging
	page.on('console', (msg) => {
		if (msg.type() === 'log' || msg.type() === 'warn' || msg.type() === 'error') {
			console.log(`[Browser ${msg.type()}]:`, msg.text());
		}
	});

	console.log('\n=== Step 1: Initial page load ===');
	const port = process.argv[2] || '5173';
	await page.goto(`http://localhost:${port}/`);
	await page.waitForLoadState('networkidle');

	// Check initial locale
	const initialLocale = await page.locator('select.language-switcher').inputValue();
	console.log('Initial locale:', initialLocale);

	// Check cookies
	const cookies1 = await context.cookies();
	console.log('Cookies after initial load:', cookies1);

	// Check localStorage
	const localStorage1 = await page.evaluate(() => {
		return {
			'i18n-locale': localStorage.getItem('i18n-locale')
		};
	});
	console.log('LocalStorage after initial load:', localStorage1);

	console.log('\n=== Step 2: Change to Chinese ===');
	await page.locator('select.language-switcher').selectOption('zh');
	await page.waitForTimeout(1000);

	// Also check document.cookie directly
	const documentCookie = await page.evaluate(() => document.cookie);
	console.log('document.cookie after change:', documentCookie);

	const newLocale = await page.locator('select.language-switcher').inputValue();
	console.log('Locale after change:', newLocale);

	// Check cookies
	const cookies2 = await context.cookies();
	console.log('Cookies after change:', cookies2);

	// Check localStorage
	const localStorage2 = await page.evaluate(() => {
		return {
			'i18n-locale': localStorage.getItem('i18n-locale')
		};
	});
	console.log('LocalStorage after change:', localStorage2);

	console.log('\n=== Step 3: Reload page ===');
	await page.reload();
	await page.waitForLoadState('networkidle');

	const reloadedLocale = await page.locator('select.language-switcher').inputValue();
	console.log('Locale after reload:', reloadedLocale);

	// Check cookies
	const cookies3 = await context.cookies();
	console.log('Cookies after reload:', cookies3);

	// Check localStorage
	const localStorage3 = await page.evaluate(() => {
		return {
			'i18n-locale': localStorage.getItem('i18n-locale')
		};
	});
	console.log('LocalStorage after reload:', localStorage3);

	// Check SSR data
	const ssrData = await page.evaluate(() => {
		// Try to access the page data if available
		return window.__sveltekit_data?.nodes?.[1];
	});
	console.log('\n=== SSR Data ===');
	console.log('SSR locale:', ssrData?.locale);

	console.log('\n=== Result ===');
	if (reloadedLocale === 'zh') {
		console.log('✅ SUCCESS: Locale persisted across reload');
	} else {
		console.log(`❌ FAILED: Expected zh, got ${reloadedLocale}`);
	}

	await browser.close();
}

// Run the debug script
debugPersistence().catch(console.error);
