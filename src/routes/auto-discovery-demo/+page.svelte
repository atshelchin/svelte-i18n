<script lang="ts">
	import { onMount } from 'svelte';
	import { setupI18n } from '$lib/index.js';

	// Example 1: Package with auto-discovery
	const packageI18n = setupI18n({
		defaultLocale: 'en',
		namespace: 'example-package',
		autoDiscovery: {
			baseUrl: '/translations',
			patterns: [
				'example-package.{locale}.json',
				'{namespace}.{locale}.json',
				'demo/{namespace}.{locale}.json'
			],
			debug: true // Show discovery logs
		}
	});

	// Example 2: Component library with auto-discovery
	const componentI18n = setupI18n({
		defaultLocale: 'en',
		namespace: 'ui-components',
		autoDiscovery: true // Use defaults
	});

	let currentLocale = $state('en');
	let discoveryLog = $state<string[]>([]);
	interface PackageInfo {
		name: string;
		namespace: string;
		locales: string[];
		discovered: boolean;
		instance?: typeof packageI18n;
		description?: string;
	}
	let availablePackages = $state<PackageInfo[]>([]);

	onMount(async () => {
		// Load some default translations
		await packageI18n.loadLanguage('en', {
			title: 'Example Package',
			description: 'This package uses auto-discovery for translations',
			features: {
				autoLoad: 'Automatic translation loading',
				namespace: 'Namespace isolation',
				convention: 'Convention over configuration'
			}
		});

		await componentI18n.loadLanguage('en', {
			button: {
				submit: 'Submit',
				cancel: 'Cancel',
				save: 'Save'
			},
			form: {
				required: 'This field is required',
				email: 'Enter a valid email'
			}
		});

		// Track available packages
		availablePackages = [
			{
				name: 'example-package',
				namespace: 'example-package',
				locales: ['en', 'zh'],
				discovered: false,
				instance: packageI18n,
				description: 'Demo package with auto-discovery'
			},
			{
				name: 'ui-components',
				namespace: 'ui-components',
				locales: ['en', 'zh'],
				discovered: false,
				instance: componentI18n,
				description: 'UI component library'
			},
			{
				name: 'validation-popup',
				namespace: 'svelte-i18n-validation',
				locales: ['en', 'zh', 'fr'],
				discovered: true,
				description: 'ValidationPopup component (built-in)'
			}
		];

		// Listen for console logs (mock for demo)
		const originalLog = console.info;
		console.info = (...args) => {
			originalLog(...args);
			if (args[0]?.includes('✅') || args[0]?.includes('🔍')) {
				discoveryLog = [...discoveryLog, args.join(' ')];
			}
		};
	});

	async function changeLocale(locale: string) {
		currentLocale = locale;
		discoveryLog = [`Switching to locale: ${locale}`];

		// These will trigger auto-discovery
		await packageI18n.setLocale(locale);
		await componentI18n.setLocale(locale);
	}

	interface PackageWithInstance extends PackageInfo {
		instance?: typeof packageI18n;
	}
	function getTranslationExample(pkg: PackageWithInstance) {
		if (!pkg.instance) return 'N/A';

		try {
			if (pkg.namespace === 'example-package') {
				return pkg.instance.t('title');
			} else if (pkg.namespace === 'ui-components') {
				return pkg.instance.t('button.submit');
			}
			return 'Sample translation';
		} catch {
			return 'Not loaded';
		}
	}
</script>

<div class="demo-container">
	<header class="demo-header">
		<h1>🔍 Auto-Discovery API Demo</h1>
		<p>Demonstrating automatic translation file discovery for packages</p>
	</header>

	<section class="info-section">
		<h2>How It Works</h2>
		<div class="info-grid">
			<div class="info-card">
				<h3>📦 For Package Authors</h3>
				<p>Enable auto-discovery in your package:</p>
				<pre><code
						>{`setupI18n({
  namespace: 'my-package',
  autoDiscovery: true
})`}</code
					></pre>
			</div>
			<div class="info-card">
				<h3>📝 For App Developers</h3>
				<p>Add translations to <code>static/translations/</code>:</p>
				<pre><code
						>{`my-package.fr.json
my-package.de.json
my-package.ja.json`}</code
					></pre>
			</div>
		</div>
	</section>

	<section class="demo-section">
		<h2>Live Demo</h2>

		<div class="locale-switcher">
			<p>Change locale to trigger auto-discovery:</p>
			<div class="locale-buttons">
				<button class:active={currentLocale === 'en'} onclick={() => changeLocale('en')}>
					🇬🇧 English
				</button>
				<button class:active={currentLocale === 'fr'} onclick={() => changeLocale('fr')}>
					🇫🇷 Français
				</button>
				<button class:active={currentLocale === 'de'} onclick={() => changeLocale('de')}>
					🇩🇪 Deutsch
				</button>
				<button class:active={currentLocale === 'ja'} onclick={() => changeLocale('ja')}>
					🇯🇵 日本語
				</button>
			</div>
		</div>

		<div class="packages-list">
			<h3>Registered Packages</h3>
			<div class="package-cards">
				{#each availablePackages as pkg (pkg.namespace)}
					<div class="package-card">
						<div class="package-header">
							<h4>{pkg.name}</h4>
							<code class="namespace">{pkg.namespace}</code>
						</div>
						<p class="package-desc">{pkg.description}</p>
						<div class="package-status">
							<span class="label">Current locale:</span>
							<span class="value">{pkg.instance?.locale || currentLocale}</span>
						</div>
						<div class="package-status">
							<span class="label">Loaded locales:</span>
							<span class="value">{pkg.instance?.locales.join(', ') || 'N/A'}</span>
						</div>
						<div class="package-example">
							<span class="label">Sample:</span>
							<code>{getTranslationExample(pkg)}</code>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="discovery-log">
			<h3>Discovery Log</h3>
			<div class="log-content">
				{#if discoveryLog.length === 0}
					<p class="log-empty">Change locale to see discovery attempts...</p>
				{:else}
					{#each discoveryLog as log, i (i)}
						<div class="log-entry">{log}</div>
					{/each}
				{/if}
			</div>
		</div>
	</section>

	<section class="instructions">
		<h2>Try It Yourself</h2>
		<div class="instruction-steps">
			<div class="step">
				<span class="step-number">1</span>
				<div>
					<h4>Create a translation file</h4>
					<p>Add <code>static/translations/example-package.fr.json</code>:</p>
					<pre><code
							>{`{
  "title": "Paquet d'exemple",
  "description": "Ce paquet utilise la découverte automatique"
}`}</code
						></pre>
				</div>
			</div>
			<div class="step">
				<span class="step-number">2</span>
				<div>
					<h4>Switch to French</h4>
					<p>Click the French button above</p>
				</div>
			</div>
			<div class="step">
				<span class="step-number">3</span>
				<div>
					<h4>Watch it load</h4>
					<p>The package automatically discovers and loads the translation!</p>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.demo-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	.demo-header {
		text-align: center;
		margin-bottom: 3rem;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 16px;
	}

	.demo-header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2.5rem;
	}

	.demo-header p {
		margin: 0;
		opacity: 0.9;
		font-size: 1.125rem;
	}

	.info-section {
		margin-bottom: 3rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-top: 1.5rem;
	}

	.info-card {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 12px;
		border: 1px solid #e9ecef;
	}

	.info-card h3 {
		margin: 0 0 1rem 0;
		color: #495057;
	}

	.info-card pre {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
		margin: 0.5rem 0 0 0;
	}

	.info-card code {
		font-family: 'SF Mono', Monaco, monospace;
		font-size: 0.875rem;
	}

	.demo-section {
		background: white;
		padding: 2rem;
		border-radius: 16px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		margin-bottom: 2rem;
	}

	.demo-section h2 {
		margin: 0 0 1.5rem 0;
		color: #212529;
	}

	.locale-switcher {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: #f8f9fa;
		border-radius: 12px;
	}

	.locale-buttons {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
		flex-wrap: wrap;
	}

	.locale-buttons button {
		padding: 0.75rem 1.5rem;
		background: white;
		border: 2px solid #dee2e6;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.locale-buttons button:hover {
		border-color: #667eea;
		background: #f8f9fa;
	}

	.locale-buttons button.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-color: transparent;
	}

	.packages-list {
		margin-bottom: 2rem;
	}

	.packages-list h3 {
		margin: 0 0 1rem 0;
		color: #495057;
	}

	.package-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
	}

	.package-card {
		background: white;
		border: 1px solid #dee2e6;
		border-radius: 12px;
		padding: 1.5rem;
	}

	.package-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.package-header h4 {
		margin: 0;
		color: #212529;
	}

	.namespace {
		background: #e7f5ff;
		color: #0c8599;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
	}

	.package-desc {
		color: #6c757d;
		margin: 0 0 1rem 0;
		font-size: 0.875rem;
	}

	.package-status {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.package-status .label {
		color: #6c757d;
	}

	.package-status .value {
		color: #212529;
		font-weight: 500;
	}

	.package-example {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e9ecef;
	}

	.package-example .label {
		display: block;
		color: #6c757d;
		font-size: 0.75rem;
		margin-bottom: 0.25rem;
	}

	.package-example code {
		background: #f8f9fa;
		padding: 0.5rem;
		border-radius: 4px;
		display: block;
		font-size: 0.875rem;
		color: #e83e8c;
	}

	.discovery-log {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 2px solid #e9ecef;
	}

	.discovery-log h3 {
		margin: 0 0 1rem 0;
		color: #495057;
	}

	.log-content {
		background: #f8f9fa;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		padding: 1rem;
		max-height: 300px;
		overflow-y: auto;
	}

	.log-empty {
		color: #6c757d;
		text-align: center;
		margin: 2rem 0;
	}

	.log-entry {
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		background: white;
		border-radius: 4px;
		font-family: 'SF Mono', Monaco, monospace;
		font-size: 0.875rem;
		color: #212529;
	}

	.instructions {
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		padding: 2rem;
		border-radius: 16px;
		margin-top: 2rem;
	}

	.instructions h2 {
		margin: 0 0 1.5rem 0;
		color: #212529;
	}

	.instruction-steps {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.step {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.step-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 50%;
		font-weight: bold;
		flex-shrink: 0;
	}

	.step h4 {
		margin: 0 0 0.5rem 0;
		color: #212529;
	}

	.step p {
		margin: 0.25rem 0;
		color: #495057;
	}

	.step pre {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		margin: 0.5rem 0 0 0;
	}

	.step code {
		font-family: 'SF Mono', Monaco, monospace;
		font-size: 0.875rem;
	}

	@media (max-width: 768px) {
		.info-grid {
			grid-template-columns: 1fr;
		}

		.package-cards {
			grid-template-columns: 1fr;
		}
	}
</style>
