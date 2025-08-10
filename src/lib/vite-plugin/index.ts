import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../..'); // Go up to project root

/**
 * Vite plugin to handle translations in a unified way
 *
 * - During development: Serves translations from src/translations
 * - During app build: Copies translations to static/translations
 * - During package build: Handled by imports in code
 */
export function translationsPlugin(): Plugin {
	return {
		name: 'vite-plugin-translations',

		// Development server: serve translations from src/translations
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				// Intercept requests to /translations/*
				if (req.url?.startsWith('/translations/')) {
					const translationPath = req.url.replace('/translations/', '');
					const srcPath = path.join(rootDir, 'src', 'translations', translationPath);

					if (fs.existsSync(srcPath)) {
						const content = fs.readFileSync(srcPath, 'utf-8');
						res.setHeader('Content-Type', 'application/json');
						res.end(content);
						return;
					}
				}
				next();
			});
		},

		// Build time: copy translations to static for app builds
		async generateBundle(_options, _bundle, isWrite) {
			// Only copy for app builds, not library builds
			const isLibraryBuild = process.env.npm_lifecycle_event === 'prepack';

			if (!isLibraryBuild && isWrite) {
				const srcDir = path.join(rootDir, 'src', 'translations');
				const destDir = path.join(rootDir, 'static', 'translations');

				// Create destination directory
				if (!fs.existsSync(destDir)) {
					fs.mkdirSync(destDir, { recursive: true });
				}

				// Copy all translation files
				copyTranslations(srcDir, destDir);

				console.log('✅ Copied translations to static/translations for runtime loading');
			}
		}
	};
}

/**
 * Recursively copy translation files
 */
function copyTranslations(src: string, dest: string) {
	if (!fs.existsSync(src)) return;

	// Create destination directory if it doesn't exist
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true });
	}

	const files = fs.readdirSync(src);

	for (const file of files) {
		const srcPath = path.join(src, file);
		const destPath = path.join(dest, file);

		const stat = fs.statSync(srcPath);

		if (stat.isDirectory()) {
			// Recursively copy subdirectories
			copyTranslations(srcPath, destPath);
		} else if (file.endsWith('.json')) {
			// Copy JSON files
			fs.copyFileSync(srcPath, destPath);
		}
	}
}
