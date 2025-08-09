import { page } from '@vitest/browser/context';
import { describe, expect, it, beforeAll } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { setupI18n } from '$lib/index.js';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	beforeAll(async () => {
		// Initialize i18n before rendering
		const i18n = setupI18n({
			defaultLocale: 'en',
			fallbackLocale: 'en'
		});
		
		// Load some basic translations
		await i18n.loadLanguage('en', {
			demo: {
				title: 'Svelte i18n Demo'
			}
		});
	});
	
	it('should render h1', async () => {
		render(Page);

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});
});
