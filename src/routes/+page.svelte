<script lang="ts">
	import { getI18n } from '../translations/i18n.js';
	import { LanguageSwitcher, ValidationPopup } from '$lib/index.js';
	import { base } from '$app/paths';
	const i18n = getI18n();

	// Demo states
	let name = $state('Svelte Developer');
	let itemCount = $state(1);
	let showFormatting = $state(false);
	let selectedExample = $state('basic');

	const currentDate = new Date();
	const sampleNumber = 1234567.89;
	const price = 9999.99;
	const largeNumber = 123456789;

	// Check if translations are loaded
	const hasTranslations = $derived(i18n.locales.length > 0);
	const isLoading = $derived(i18n.isLoading);
	const isRTL = $derived(i18n.meta[i18n.locale]?.direction === 'rtl');

	// Reactive translations
	const welcomeMessage = $derived(i18n.t('welcome', { name }));
	const itemsMessage = $derived(i18n.t('items.count', { count: itemCount }));
	const currentLocaleMessage = $derived(i18n.t('demo.currentLocale', { locale: i18n.locale }));

	// Formatted values with different locales
	const formattedValues = $derived({
		// Date formats
		dateShort: i18n.formatDate(currentDate, 'short'),
		dateLong: i18n.formatDate(currentDate, 'long'),
		dateFull: i18n.formatDate(currentDate, 'full'),

		// Time formats
		timeShort: i18n.formatTime(currentDate, 'short'),
		timeMedium: i18n.formatTime(currentDate, 'medium'),

		// Number formats
		number: i18n.formatNumber(sampleNumber),
		numberDecimal: i18n.formatNumber(sampleNumber, 'decimal'),
		numberCompact: i18n.formatNumber(largeNumber, 'compact'),
		percent: i18n.formatNumber(0.1234, 'percent'),

		// Currency (auto-detects based on locale)
		currency: i18n.formatCurrency(price),

		// Relative time
		relativeTime: i18n.formatRelativeTime(-2, 'day'),

		// List formatting
		list: i18n.formatList(['Apple', 'Banana', 'Orange'])
	});

	// Code examples
	const codeExamples: Record<string, string> = {
		basic: `import { setupI18n, getI18n } from '@shelchin/svelte-i18n';

// Setup in +layout.svelte
const i18n = setupI18n({
  defaultLocale: 'en',
  fallbackLocale: 'en'
});

// Use in components
const i18n = getI18n();
const message = $derived(i18n.t('welcome', { name }));`,

		interpolation: `// String interpolation
i18n.t('welcome', { name: 'Alice' });
// Output: "Welcome, Alice!"

// Pluralization
i18n.t('items.count', { count: 0 }); // "No items"
i18n.t('items.count', { count: 1 }); // "1 item"
i18n.t('items.count', { count: 5 }); // "5 items"`,

		formatting: `// Number formatting
i18n.formatNumber(1234567.89);
// Output: "1,234,567.89" (en) / "1.234.567,89" (de)

// Currency
i18n.formatCurrency(9999.99);
// Output: "$9,999.99" (en-US) / "9.999,99 €" (de-DE)

// Date & Time
i18n.formatDate(new Date(), 'long');
// Output: "January 9, 2025"

i18n.formatRelativeTime(-2, 'day');
// Output: "2 days ago"`
	};
</script>

<svelte:head>
	<title>svelte-i18n - {i18n.t('demo.modernI18n')}</title>
	<meta name="description" content={i18n.t('demo.powerfulLibrary')} />
</svelte:head>

<main class="container" dir={isRTL ? 'rtl' : 'ltr'}>
	{#if isLoading}
		<div class="loading">
			<h2>{i18n.t('demo.loadingTranslations')}</h2>
			<div class="spinner"></div>
		</div>
	{:else if !hasTranslations}
		<div class="error">
			<h2>⚠️ {i18n.t('demo.noTranslationsLoaded')}</h2>
			<p>{i18n.t('demo.noTranslationsMessage')}</p>
			<p>{i18n.t('demo.checkConsole')}</p>
		</div>
	{:else}
		<ValidationPopup />

		<!-- Hero Section -->
		<header class="hero">
			<div class="hero-badge">{i18n.t('demo.svelteReady')}</div>
			<h1 class="hero-title">svelte-i18n</h1>
			<p class="hero-subtitle">{i18n.t('demo.modernI18n')}</p>
			<p class="hero-description">{i18n.t('demo.powerfulLibrary')}</p>

			<div class="hero-actions">
				<LanguageSwitcher class="language-switcher" showLabel={true} />
				<a href="{base}/editor" class="btn-editor">
					🌍 {i18n.t('editor.title')}
				</a>

				<a href="https://github.com/atshelchin/svelte-i18n" class="btn-github">
					{i18n.t('demo.github')}
				</a>
			</div>

			<!-- Language showcase -->
			<div class="language-showcase">
				{#each i18n.locales.slice(0, 8) as locale (locale)}
					<button
						class="lang-pill"
						class:active={i18n.locale === locale}
						onclick={() => i18n.setLocale(locale)}
						title={i18n.meta[locale]?.name || locale}
					>
						<span class="lang-flag">{i18n.meta[locale]?.flag || '🌐'}</span>
						<span class="lang-code">{locale.toUpperCase()}</span>
					</button>
				{/each}
			</div>
		</header>
		<!-- Core Features -->
		<section class="features-section">
			<h2 class="section-title">{i18n.t('demo.coreFeatures')}</h2>

			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">🔍</div>
					<h3>{i18n.t('demo.autoDiscovery')}</h3>
					<p>{i18n.t('demo.autoDiscoveryDesc')}</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🎯</div>
					<h3>{i18n.t('demo.typeSafety')}</h3>
					<p>{i18n.t('demo.typeSafetyDesc')}</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🌐</div>
					<h3>{i18n.t('demo.ssrSupport')}</h3>
					<p>{i18n.t('demo.ssrSupportDesc')}</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">✏️</div>
					<h3>{i18n.t('demo.translationEditor')}</h3>
					<p>{i18n.t('demo.translationEditorDesc')}</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🚀</div>
					<h3>{i18n.t('demo.easyToUse')}</h3>
					<p>{i18n.t('demo.easyToUseDesc')}</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">⚡</div>
					<h3>{i18n.t('demo.svelte5Runes')}</h3>
					<p>{i18n.t('demo.svelte5RunesDesc')}</p>
				</div>
			</div>
		</section>

		<!-- Interactive Demo -->
		<section class="demo-section">
			<h2 class="section-title">{i18n.t('demo.tryIt')}</h2>

			<div class="demo-grid">
				<!-- String Interpolation -->
				<div class="demo-card">
					<h3>{i18n.t('demo.interpolation', { name: 'Svelte' })}</h3>
					<input
						type="text"
						bind:value={name}
						placeholder={i18n.t('demo.enterName')}
						class="input"
					/>
					<p class="result">{welcomeMessage}</p>
				</div>

				<!-- Pluralization -->
				<div class="demo-card">
					<h3>{i18n.t('demo.pluralization')}</h3>
					<div class="controls">
						<button onclick={() => (itemCount = Math.max(0, itemCount - 1))}>-</button>
						<input type="number" bind:value={itemCount} min="0" class="number-input" />
						<button onclick={() => itemCount++}>+</button>
					</div>
					<p class="result">{itemsMessage}</p>
				</div>

				<!-- Nested Keys -->
				<div class="demo-card">
					<h3>{i18n.t('demo.nested')}</h3>
					<nav class="demo-nav">
						<a href="{base}/">{i18n.t('nav.home')}</a>
						<a href="{base}/editor">{i18n.t('nav.about')}</a>
						<a href="{base}/">{i18n.t('nav.contact')}</a>
						<a href="{base}/">{i18n.t('nav.settings')}</a>
					</nav>
					<p class="nested-example">
						{i18n.t('user.profile.title')} → {i18n.t('user.settings.language')}
					</p>
				</div>

				<!-- Formatting -->
				<div class="demo-card">
					<h3>{i18n.t('demo.formatting')}</h3>
					<button onclick={() => (showFormatting = !showFormatting)} class="toggle-btn">
						{showFormatting
							? i18n.t('demo.hideFormattingExamples')
							: i18n.t('demo.showFormattingExamples')}
					</button>
					{#if showFormatting}
						<div class="formatting-examples">
							<h4>📅 {i18n.t('demo.dateFormats', { locale: i18n.locale })}</h4>
							<p><strong>{i18n.t('demo.short')}:</strong> {formattedValues.dateShort}</p>
							<p><strong>{i18n.t('demo.long')}:</strong> {formattedValues.dateLong}</p>
							<p><strong>{i18n.t('demo.full')}:</strong> {formattedValues.dateFull}</p>

							<h4>🔢 {i18n.t('demo.numberFormats')}</h4>
							<p><strong>{i18n.t('demo.standard')}:</strong> {formattedValues.number}</p>
							<p>
								<strong>{i18n.t('demo.compact', { number: largeNumber })}:</strong>
								{formattedValues.numberCompact}
							</p>
							<p><strong>{i18n.t('demo.percent')}:</strong> {formattedValues.percent}</p>

							<h4>💰 {i18n.t('demo.currencyAutoDetected')}</h4>
							<p>{formattedValues.currency}</p>

							<h4>📝 {i18n.t('demo.otherFormats')}</h4>
							<p><strong>{i18n.t('demo.relativeTime')}:</strong> {formattedValues.relativeTime}</p>
							<p><strong>{i18n.t('demo.list')}:</strong> {formattedValues.list}</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Current Language Display -->
			<div class="current-locale">
				<p>{currentLocaleMessage}</p>
				<div class="language-buttons">
					{#each i18n.locales as locale (locale)}
						<button
							onclick={() => i18n.setLocale(locale)}
							class:active={i18n.locale === locale}
							title={i18n.meta[locale]?.name || locale}
						>
							<span class="lang-flag">{i18n.meta[locale]?.flag || '🌐'}</span>
							<span class="lang-code">{locale.toUpperCase()}</span>
						</button>
					{/each}
				</div>
			</div>
		</section>

		<!-- Code Examples -->
		<section class="code-section">
			<h2 class="section-title">{i18n.t('demo.quickStart')}</h2>

			<div class="code-tabs">
				<button
					class="code-tab"
					class:active={selectedExample === 'basic'}
					onclick={() => (selectedExample = 'basic')}
				>
					Basic Setup
				</button>
				<button
					class="code-tab"
					class:active={selectedExample === 'interpolation'}
					onclick={() => (selectedExample = 'interpolation')}
				>
					Interpolation
				</button>
				<button
					class="code-tab"
					class:active={selectedExample === 'formatting'}
					onclick={() => (selectedExample = 'formatting')}
				>
					Formatting
				</button>
			</div>

			<div class="code-content">
				<pre class="code-block">{codeExamples[selectedExample]}</pre>
			</div>
		</section>

		<!-- Stats -->
		<section class="stats-section">
			<div class="stat-card">
				<div class="stat-value">{i18n.locales.length}</div>
				<div class="stat-label">{i18n.t('demo.languagesLoadedCount')}</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">100+</div>
				<div class="stat-label">{i18n.t('demo.localesSupported')}</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">0</div>
				<div class="stat-label">{i18n.t('demo.dependencies')}</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">5.0</div>
				<div class="stat-label">{i18n.t('demo.svelteVersion')}</div>
			</div>
		</section>

		<!-- Footer -->
		<footer>
			<p>{i18n.t('demo.madeWithLove')}</p>
			<div class="footer-links">
				<a href="https://github.com/atshelchin/svelte-i18n">{i18n.t('demo.github')}</a>
			</div>
		</footer>
	{/if}
</main>

<style>
	.container {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		max-width: 100%;
	}

	/* Hero Section */
	.hero {
		text-align: center;
		padding: 4rem 2rem;
		color: white;
	}

	.hero-badge {
		display: inline-block;
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.hero-title {
		font-size: 4rem;
		font-weight: 800;
		margin: 1rem 0;
		background: linear-gradient(90deg, #fff, #f0f0f0);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: 1.8rem;
		margin-bottom: 0.5rem;
		opacity: 0.95;
	}

	.hero-description {
		font-size: 1.1rem;
		opacity: 0.9;
		max-width: 800px;
		margin: 0 auto 2rem;
		line-height: 1.6;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
	}

	:global(.language-switcher) {
		background: white;
		color: #333;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		min-width: 150px;
	}

	.btn-editor {
		background: linear-gradient(135deg, #ffd700, #ff6b6b);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.3s;
	}

	.btn-editor:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 20px rgba(255, 107, 107, 0.3);
	}

	.btn-github {
		background: white;
		color: #667eea;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.3s;
	}

	.btn-github:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
	}

	.language-showcase {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.lang-pill {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		cursor: pointer;
		transition: all 0.3s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.lang-pill:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
	}

	.lang-pill.active {
		background: white;
		color: #667eea;
	}

	.lang-flag {
		font-size: 1.2rem;
	}

	.lang-code {
		font-size: 0.75rem;
		font-weight: 600;
	}

	/* Features Section */
	.features-section {
		background: white;
		padding: 4rem 2rem;
	}

	.section-title {
		text-align: center;
		font-size: 2.5rem;
		color: #333;
		margin-bottom: 3rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.feature-card {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
		border: 1px solid rgba(102, 126, 234, 0.1);
		border-radius: 16px;
		padding: 2rem;
		text-align: center;
		transition: all 0.3s;
	}

	.feature-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-card h3 {
		color: #333;
		margin-bottom: 0.5rem;
		font-size: 1.3rem;
	}

	.feature-card p {
		color: #666;
		line-height: 1.6;
	}

	/* Demo Section */
	.demo-section {
		background: rgba(255, 255, 255, 0.95);
		padding: 4rem 2rem;
	}

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto 3rem;
	}

	.demo-card {
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.demo-card h3 {
		color: #667eea;
		margin-bottom: 1.5rem;
		font-size: 1.2rem;
	}

	.input {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.3s;
	}

	.input:focus {
		outline: none;
		border-color: #667eea;
	}

	.controls {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-bottom: 1rem;
	}

	.controls button {
		width: 36px;
		height: 36px;
		border: 2px solid #667eea;
		background: white;
		color: #667eea;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1.2rem;
		font-weight: 600;
		transition: all 0.3s;
	}

	.controls button:hover {
		background: #667eea;
		color: white;
	}

	.number-input {
		width: 80px;
		padding: 0.5rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		text-align: center;
		font-size: 1rem;
	}

	.result {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
		padding: 1rem;
		border-radius: 8px;
		margin-top: 1rem;
		font-size: 1.1rem;
		color: #333;
		border: 1px solid rgba(102, 126, 234, 0.1);
	}

	.demo-nav {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}

	.demo-nav a {
		color: #667eea;
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		transition: background 0.2s;
		border: 1px solid #667eea;
	}

	.demo-nav a:hover {
		background: rgba(102, 126, 234, 0.1);
	}

	.nested-example {
		color: #666;
		font-style: italic;
		margin-top: 1rem;
	}

	.toggle-btn {
		padding: 0.5rem 1rem;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.3s;
	}

	.toggle-btn:hover {
		background: #5567d8;
		transform: translateY(-1px);
	}

	.formatting-examples {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
		margin-top: 1rem;
	}

	.formatting-examples h4 {
		color: #667eea;
		font-size: 0.9rem;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.formatting-examples h4:first-child {
		margin-top: 0;
	}

	.formatting-examples p {
		margin: 0.5rem 0;
		color: #333;
	}

	.current-locale {
		text-align: center;
		padding: 2rem;
		background: white;
		border-radius: 12px;
		max-width: 1200px;
		margin: 0 auto;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.current-locale p {
		font-size: 1.2rem;
		color: #333;
		margin-bottom: 1.5rem;
	}

	.language-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
	}

	.language-buttons button {
		padding: 0.5rem 1rem;
		border: 2px solid #667eea;
		background: white;
		color: #667eea;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.language-buttons button:hover {
		background: rgba(102, 126, 234, 0.1);
		transform: translateY(-2px);
	}

	.language-buttons button.active {
		background: #667eea;
		color: white;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}

	/* Code Section */
	.code-section {
		background: #f8f9fa;
		padding: 4rem 2rem;
	}

	.code-tabs {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.code-tab {
		padding: 0.75rem 1.5rem;
		background: white;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.3s;
		font-weight: 500;
	}

	.code-tab:hover {
		border-color: #667eea;
	}

	.code-tab.active {
		background: #667eea;
		color: white;
		border-color: #667eea;
	}

	.code-content {
		max-width: 900px;
		margin: 0 auto;
	}

	.code-block {
		background: #2d2d2d;
		color: #f8f8f2;
		padding: 2rem;
		border-radius: 12px;
		overflow-x: auto;
		font-family: 'Fira Code', 'Consolas', monospace;
		font-size: 0.9rem;
		line-height: 1.6;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		white-space: pre;
	}

	/* Stats Section */
	.stats-section {
		background: white;
		padding: 4rem 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
		max-width: 1000px;
		margin: 0 auto;
	}

	.stat-card {
		text-align: center;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
	}

	.stat-value {
		font-size: 3rem;
		font-weight: 800;
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 1rem;
		opacity: 0.9;
	}

	/* Footer */
	footer {
		background: #2d2d2d;
		color: white;
		text-align: center;
		padding: 3rem 2rem;
	}

	footer p {
		margin-bottom: 1rem;
	}

	.footer-links {
		display: flex;
		gap: 2rem;
		justify-content: center;
	}

	.footer-links a {
		color: #667eea;
		text-decoration: none;
		transition: color 0.3s;
	}

	.footer-links a:hover {
		color: #8b9dc3;
	}

	/* Loading and Error States */
	.loading,
	.error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		text-align: center;
		color: white;
		padding: 2rem;
	}

	.error h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.error p {
		margin: 0.5rem 0;
		max-width: 600px;
		opacity: 0.9;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-top: 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* RTL Support */
	[dir='rtl'] .demo-nav {
		flex-direction: row-reverse;
	}

	[dir='rtl'] .controls {
		flex-direction: row-reverse;
	}

	[dir='rtl'] .language-buttons {
		flex-direction: row-reverse;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2.5rem;
		}

		.hero-subtitle {
			font-size: 1.3rem;
		}

		.hero-actions {
			flex-direction: column;
			align-items: center;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}

		.demo-grid {
			grid-template-columns: 1fr;
		}

		.code-tabs {
			flex-direction: column;
		}

		.stats-section {
			grid-template-columns: repeat(2, 1fr);
		}

		.language-showcase {
			padding: 0 1rem;
		}
	}
</style>
