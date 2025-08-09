<script lang="ts">
	import { getI18n } from '../store.svelte.js';

	const i18n = getI18n();

	// TypeScript type safety examples
	let showTypeHints = $state(false);
	let showNamespaceDemo = $state(false);

	// Example of namespace isolation (commented out to avoid unused warnings)
	// const appNamespace = 'app';
	// const libNamespace = 'library';

	// Demo type-safe keys (commented out to avoid unused warnings)
	// const validKey = 'welcome';
	// const nestedKey = 'user.profile.title';

	// Example showing how types would work in a real app
	const codeExamples = {
		typeSafety: `// Auto-generated types from translation files
type TranslationKeys = 
  | "welcome"
  | "greeting" 
  | "nav.home"
  | "nav.about"
  | "user.profile.title"
  | "user.settings.language"
  // ... all keys from your JSON files

// TypeScript ensures only valid keys are used
const message = i18n.t('welcome', { name: 'John' }); // ✅ Valid
const invalid = i18n.t('invalid_key'); // ❌ TypeScript error

// Nested keys are fully typed
const profile = i18n.t('user.profile.title'); // ✅ Valid
const wrongNested = i18n.t('user.profile.wrong'); // ❌ TypeScript error`,

		namespaceIsolation: `// Different parts of your app can have isolated translations
import { setupI18n } from '@shelchin/svelte-i18n';

// Main app translations
const appI18n = setupI18n({
  namespace: 'app',
  defaultLocale: 'en'
});

// Component library translations
const libI18n = setupI18n({
  namespace: 'mylib',
  defaultLocale: 'en'
});

// No conflicts between namespaces
appI18n.t('button.save'); // From app translations
libI18n.t('button.save'); // From library translations

// Each namespace maintains its own:
// - Translation files
// - Validation rules  
// - Loading states
// - Error handling`,

		interpolationTypes: `// Type-safe interpolation parameters
interface WelcomeParams {
  name: string;
  count?: number;
}

// TypeScript validates interpolation parameters
i18n.t('welcome', { name: 'Alice' }); // ✅ Valid
i18n.t('welcome', { username: 'Alice' }); // ❌ Wrong parameter name
i18n.t('items.count', { count: 5 }); // ✅ Valid
i18n.t('items.count', { total: 5 }); // ❌ Wrong parameter name`,

		validationTypes: `// Runtime validation with detailed error types
interface ValidationError {
  locale: string;
  key: string;
  type: 'missing' | 'type_mismatch' | 'interpolation_mismatch';
  expected?: string;
  received?: string;
}

// Validation catches issues at runtime
const errors: ValidationError[] = i18n.validate();

errors.forEach(error => {
  switch(error.type) {
    case 'missing':
      console.warn(\`Missing key \${error.key} in \${error.locale}\`);
      break;
    case 'type_mismatch':
      console.error(\`Type mismatch for \${error.key}\`);
      break;
    case 'interpolation_mismatch':
      console.warn(\`Parameter mismatch in \${error.key}\`);
      break;
  }
});`
	};
</script>

<div class="type-safety-demo">
	<div class="demo-header">
		<h2 class="demo-title">
			<span class="icon">🎯</span>
			Type Safety & Namespace Isolation
		</h2>
		<p class="demo-subtitle">Experience compile-time type checking and runtime validation</p>
	</div>

	<div class="feature-tabs">
		<button
			class="feature-tab"
			class:active={!showNamespaceDemo}
			onclick={() => (showNamespaceDemo = false)}
		>
			<span class="tab-icon">📝</span>
			Type Safety
		</button>
		<button
			class="feature-tab"
			class:active={showNamespaceDemo}
			onclick={() => (showNamespaceDemo = true)}
		>
			<span class="tab-icon">🔒</span>
			Namespace Isolation
		</button>
	</div>

	{#if !showNamespaceDemo}
		<div class="type-safety-section">
			<div class="feature-card gradient-border">
				<h3>
					<span class="card-icon">✨</span>
					Auto-Generated Types
				</h3>
				<p class="feature-description">
					All translation keys are automatically typed from your JSON files
				</p>

				<div class="code-preview">
					<div class="code-header">
						<span class="code-lang">TypeScript</span>
						<button class="show-code-btn" onclick={() => (showTypeHints = !showTypeHints)}>
							{showTypeHints ? 'Hide' : 'Show'} Type Hints
						</button>
					</div>

					{#if showTypeHints}
						<pre class="code-block"><code>{codeExamples.typeSafety}</code></pre>
					{/if}
				</div>

				<div class="live-examples">
					<h4>Try it Live:</h4>
					<div class="example-grid">
						<div class="example-item valid">
							<code>i18n.t('welcome', {'{ name: "World" }'})</code>
							<span class="result">→ {i18n.t('welcome', { name: 'World' })}</span>
							<span class="status">✅ Valid key</span>
						</div>
						<div class="example-item valid">
							<code>i18n.t('user.profile.title')</code>
							<span class="result">→ {i18n.t('user.profile.title')}</span>
							<span class="status">✅ Nested key works</span>
						</div>
						<div class="example-item invalid">
							<code>i18n.t('invalid.key.here')</code>
							<span class="result">→ invalid.key.here</span>
							<span class="status">❌ TypeScript would catch this</span>
						</div>
					</div>
				</div>
			</div>

			<div class="feature-card">
				<h3>
					<span class="card-icon">🔍</span>
					Parameter Type Checking
				</h3>
				<div class="code-preview">
					<pre class="code-block"><code>{codeExamples.interpolationTypes}</code></pre>
				</div>
			</div>

			<div class="feature-card">
				<h3>
					<span class="card-icon">🛡️</span>
					Runtime Validation
				</h3>
				<div class="code-preview">
					<pre class="code-block"><code>{codeExamples.validationTypes}</code></pre>
				</div>
			</div>
		</div>
	{:else}
		<div class="namespace-section">
			<div class="feature-card gradient-border">
				<h3>
					<span class="card-icon">🏢</span>
					Multi-Package Support
				</h3>
				<p class="feature-description">
					Isolate translations between different packages and libraries
				</p>

				<div class="code-preview">
					<pre class="code-block"><code>{codeExamples.namespaceIsolation}</code></pre>
				</div>

				<div class="namespace-demo">
					<h4>Namespace Benefits:</h4>
					<div class="benefits-grid">
						<div class="benefit-card">
							<span class="benefit-icon">📦</span>
							<h5>Package Isolation</h5>
							<p>Each package maintains its own translation scope</p>
						</div>
						<div class="benefit-card">
							<span class="benefit-icon">🔀</span>
							<h5>No Key Conflicts</h5>
							<p>Same keys can exist in different namespaces</p>
						</div>
						<div class="benefit-card">
							<span class="benefit-icon">🎨</span>
							<h5>Component Libraries</h5>
							<p>Ship i18n-ready components with built-in translations</p>
						</div>
						<div class="benefit-card">
							<span class="benefit-icon">🔧</span>
							<h5>Independent Config</h5>
							<p>Each namespace has its own settings and fallbacks</p>
						</div>
					</div>
				</div>

				<div class="namespace-example">
					<h4>Real-World Example:</h4>
					<div class="example-cards">
						<div class="ns-card app">
							<h5>🏠 App Namespace</h5>
							<code>app.t('dashboard.title')</code>
							<code>app.t('settings.save')</code>
							<code>app.t('user.logout')</code>
						</div>
						<div class="ns-card lib">
							<h5>📚 UI Library Namespace</h5>
							<code>ui.t('button.confirm')</code>
							<code>ui.t('modal.close')</code>
							<code>ui.t('form.required')</code>
						</div>
						<div class="ns-card auth">
							<h5>🔐 Auth Module Namespace</h5>
							<code>auth.t('login.title')</code>
							<code>auth.t('error.invalid')</code>
							<code>auth.t('signup.success')</code>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.type-safety-demo {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.demo-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.demo-title {
		font-size: 2.5rem;
		background: linear-gradient(135deg, #667eea, #764ba2);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 0.5rem;
	}

	.icon {
		font-size: 2rem;
		margin-right: 0.5rem;
	}

	.demo-subtitle {
		color: #666;
		font-size: 1.2rem;
	}

	.feature-tabs {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.feature-tab {
		background: white;
		border: 2px solid #e0e0e0;
		padding: 1rem 2rem;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.3s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.1rem;
		font-weight: 500;
	}

	.feature-tab:hover {
		border-color: #667eea;
		transform: translateY(-2px);
	}

	.feature-tab.active {
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		border-color: transparent;
	}

	.tab-icon {
		font-size: 1.3rem;
	}

	.feature-card {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		margin-bottom: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		transition: all 0.3s;
	}

	.feature-card:hover {
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
	}

	.gradient-border {
		position: relative;
		background: white;
		background-clip: padding-box;
		border: 2px solid transparent;
	}

	.gradient-border::before {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: -1;
		margin: -2px;
		border-radius: inherit;
		background: linear-gradient(135deg, #667eea, #764ba2);
	}

	.feature-card h3 {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.card-icon {
		font-size: 1.8rem;
	}

	.feature-description {
		color: #666;
		font-size: 1.1rem;
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.code-preview {
		margin-top: 1.5rem;
	}

	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.code-lang {
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.show-code-btn {
		background: #f0f0f0;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
	}

	.show-code-btn:hover {
		background: #e0e0e0;
	}

	.code-block {
		background: #2d2d2d;
		color: #f8f8f2;
		padding: 1.5rem;
		border-radius: 12px;
		overflow-x: auto;
		font-family: 'Fira Code', 'Consolas', monospace;
		font-size: 0.9rem;
		line-height: 1.6;
		margin: 0;
	}

	.live-examples {
		margin-top: 2rem;
		padding: 1.5rem;
		background: #f8f9fa;
		border-radius: 12px;
	}

	.live-examples h4 {
		margin-bottom: 1rem;
		color: #333;
	}

	.example-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.example-item {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 1rem;
	}

	.example-item code {
		background: #f5f5f5;
		padding: 0.5rem;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.result {
		color: #667eea;
		font-weight: 600;
	}

	.status {
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.825rem;
		font-weight: 600;
	}

	.example-item.valid .status {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.example-item.invalid .status {
		background: #ffebee;
		color: #c62828;
	}

	.benefits-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-top: 1.5rem;
	}

	.benefit-card {
		background: linear-gradient(135deg, #f5f5f5, #eeeeee);
		padding: 1.5rem;
		border-radius: 12px;
		text-align: center;
	}

	.benefit-icon {
		font-size: 2.5rem;
		display: block;
		margin-bottom: 1rem;
	}

	.benefit-card h5 {
		color: #333;
		margin-bottom: 0.5rem;
	}

	.benefit-card p {
		color: #666;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.namespace-example {
		margin-top: 2rem;
	}

	.namespace-example h4 {
		margin-bottom: 1rem;
		color: #333;
	}

	.example-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}

	.ns-card {
		padding: 1.5rem;
		border-radius: 12px;
		border: 2px solid;
	}

	.ns-card.app {
		background: rgba(102, 126, 234, 0.05);
		border-color: #667eea;
	}

	.ns-card.lib {
		background: rgba(76, 175, 80, 0.05);
		border-color: #4caf50;
	}

	.ns-card.auth {
		background: rgba(255, 152, 0, 0.05);
		border-color: #ff9800;
	}

	.ns-card h5 {
		margin-bottom: 1rem;
		color: #333;
		font-size: 1.1rem;
	}

	.ns-card code {
		display: block;
		background: white;
		padding: 0.5rem;
		margin: 0.5rem 0;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #666;
	}

	@media (max-width: 768px) {
		.demo-title {
			font-size: 2rem;
		}

		.feature-tabs {
			flex-direction: column;
		}

		.example-grid {
			gap: 0.75rem;
		}

		.example-item {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}
	}
</style>
