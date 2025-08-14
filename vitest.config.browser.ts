import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
	plugins: [tailwindcss(), svelte({ hot: false })],
	test: {
		globals: true,
		browser: {
			enabled: true,
			provider: 'playwright',
			instances: [
				{
					browser: 'chromium'
				}
			],
			headless: true
		},
		include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
		exclude: ['src/routes/**'], // Skip route component tests that need SvelteKit runtime
		setupFiles: ['./vitest-setup-client.ts']
	},
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib'),
			'$app/paths': path.resolve('./test-mocks/app-paths.ts'),
			'$app/stores': path.resolve('./test-mocks/app-stores.ts'),
			'$app/navigation': path.resolve('./test-mocks/app-navigation.ts'),
			'$app/environment': path.resolve('./test-mocks/app-environment.ts')
		}
	}
});
