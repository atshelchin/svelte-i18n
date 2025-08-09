<script lang="ts">
	import { setupI18n } from '$lib/index.js';
	import { createTypedI18n, type ExtractKeys } from '$lib/typed-i18n.js';
	import type { TranslationSchema } from '$lib/types.js';

	// 定义你的翻译结构（通常从生成的类型文件导入）
	interface MyTranslationSchema extends TranslationSchema {
		welcome: string;
		greeting: string;
		nav: {
			home: string;
			about: string;
			contact: string;
			settings: string;
		};
		user: {
			profile: {
				title: string;
				bio: string;
			};
			settings: {
				language: string;
				theme: string;
			};
			actions: {
				login: string;
				logout: string;
				save: string;
			};
		};
		items: {
			count: string;
			empty: string;
		};
		demo: {
			typeSafetyTitle: string;
			typeSafetyDescription: string;
			tryTyping: string;
			availableKeys: string;
			selectedKey: string;
			translationResult: string;
			addNewKey: string;
		};
		errors: {
			notFound: string;
			unauthorized: string;
			serverError: string;
		};
	}

	// 提取所有可能的键
	type AllKeys = ExtractKeys<MyTranslationSchema>;

	// 设置 i18n
	const baseI18n = setupI18n({
		defaultLocale: 'en',
		fallbackLocale: 'en'
	});

	// 创建类型安全的 i18n 实例
	const i18n = createTypedI18n<MyTranslationSchema>(baseI18n);

	// 加载示例翻译
	const sampleTranslations: MyTranslationSchema = {
		welcome: 'Welcome {name}!',
		greeting: 'Hello, {name}!',
		nav: {
			home: 'Home',
			about: 'About',
			contact: 'Contact',
			settings: 'Settings'
		},
		user: {
			profile: {
				title: 'User Profile',
				bio: 'User Biography'
			},
			settings: {
				language: 'Language',
				theme: 'Theme'
			},
			actions: {
				login: 'Login',
				logout: 'Logout',
				save: 'Save'
			}
		},
		items: {
			count: '{count} items',
			empty: 'No items'
		},
		demo: {
			typeSafetyTitle: '🎯 Type-Safe i18n Demo',
			typeSafetyDescription: 'Experience auto-completion and type safety',
			tryTyping: 'Try typing different keys:',
			availableKeys: 'Available Keys',
			selectedKey: 'Selected Key',
			translationResult: 'Translation Result',
			addNewKey: 'Add New Key (Dev Only)'
		},
		errors: {
			notFound: 'Page not found',
			unauthorized: 'Unauthorized access',
			serverError: 'Server error occurred'
		}
	};

	// 加载翻译
	baseI18n.loadLanguage('en', sampleTranslations);

	// 状态变量
	let selectedKey = $state<AllKeys>('welcome');
	let customParams = $state({ name: 'Developer', count: 5 });
	let showAllKeys = $state(false);
	let newKey = $state('');
	let newValue = $state('');

	// 获取所有可用的键
	const allKeys = i18n.getKeys();

	// 演示不同的翻译键调用
	const examples = $derived({
		// ✅ TypeScript 会自动补全这些键
		welcome: i18n.t('welcome', { name: 'John' }),
		navHome: i18n.t('nav.home'),
		navAbout: i18n.t('nav.about'),
		userProfile: i18n.t('user.profile.title'),
		userLanguage: i18n.t('user.settings.language'),
		loginAction: i18n.t('user.actions.login'),
		itemCount: i18n.t('items.count', { count: 3 }),

		// 嵌套键的完整路径
		deepNested: i18n.t('user.settings.theme')

		// 错误示例（TypeScript 会在编译时提示）
		// invalid: i18n.t('invalid.key'), // ❌ 编译错误
		// wrongParams: i18n.t('welcome'), // ❌ 缺少参数
	});

	// 动态翻译
	const dynamicTranslation = $derived(() => {
		try {
			return i18n.t(selectedKey as string, customParams);
		} catch {
			return `Translation for "${selectedKey}"`;
		}
	});

	// 添加新键（仅开发模式）
	function addNewTranslationKey() {
		if (newKey && newValue && i18n.addKey) {
			i18n.addKey(newKey, newValue);
			newKey = '';
			newValue = '';
		}
	}

	// 键的分类
	const categorizedKeys = $derived(() => {
		const categories: Record<string, AllKeys[]> = {
			Navigation: [],
			User: [],
			Items: [],
			Demo: [],
			Errors: [],
			Other: []
		};

		allKeys.forEach((key) => {
			if (key.startsWith('nav.')) categories.Navigation.push(key);
			else if (key.startsWith('user.')) categories.User.push(key);
			else if (key.startsWith('items.')) categories.Items.push(key);
			else if (key.startsWith('demo.')) categories.Demo.push(key);
			else if (key.startsWith('errors.')) categories.Errors.push(key);
			else categories.Other.push(key);
		});

		return categories;
	});
</script>

<div class="typed-demo-container">
	<header class="demo-header">
		<h1>{i18n.t('demo.typeSafetyTitle')}</h1>
		<p>{i18n.t('demo.typeSafetyDescription')}</p>
	</header>

	<div class="demo-content">
		<!-- 实时演示 -->
		<section class="demo-section">
			<h2>💡 Live Type-Safe Translation</h2>

			<div class="key-selector">
				<label for="key-select">{i18n.t('demo.tryTyping')}</label>
				<select id="key-select" bind:value={selectedKey}>
					{#each Object.entries(categorizedKeys()) as [category, keys] (category)}
						{#if keys.length > 0}
							<optgroup label={category}>
								{#each keys as key (key)}
									<option value={key}>{key}</option>
								{/each}
							</optgroup>
						{/if}
					{/each}
				</select>
			</div>

			<div class="result-display">
				<div class="result-item">
					<span class="label">{i18n.t('demo.selectedKey')}:</span>
					<code class="key">{selectedKey}</code>
				</div>
				<div class="result-item">
					<span class="label">{i18n.t('demo.translationResult')}:</span>
					<span class="translation">{dynamicTranslation()}</span>
				</div>
			</div>

			<!-- 参数输入 -->
			<div class="params-input">
				<h3>📝 Parameters</h3>
				<div class="param-row">
					<label>
						name:
						<input type="text" bind:value={customParams.name} />
					</label>
					<label>
						count:
						<input type="number" bind:value={customParams.count} />
					</label>
				</div>
			</div>
		</section>

		<!-- 代码示例 -->
		<section class="demo-section">
			<h2>📋 Code Examples</h2>

			<div class="code-example">
				<h3>✅ Type-Safe Usage</h3>
				<pre><code
						>{`// TypeScript provides auto-completion
const welcome = i18n.t('welcome', { name: 'John' });
const home = i18n.t('nav.home');
const profile = i18n.t('user.profile.title');

// Nested keys are fully typed
const theme = i18n.t('user.settings.theme');
const logout = i18n.t('user.actions.logout');

// IDE shows available keys when you type:
// i18n.t('')  // <-- cursor here shows all keys`}</code
					></pre>
			</div>

			<div class="code-example">
				<h3>❌ Type Errors (Caught at Compile Time)</h3>
				<pre><code
						>{`// These would cause TypeScript errors:

// Error: Key doesn't exist
i18n.t('invalid.key.here');

// Error: Missing required parameters
i18n.t('welcome'); // needs { name }

// Error: Wrong parameter names
i18n.t('welcome', { username: 'John' }); // should be 'name'

// Error: Extra parameters not allowed
i18n.t('nav.home', { extra: 'param' });`}</code
					></pre>
			</div>
		</section>

		<!-- 所有键的展示 -->
		<section class="demo-section">
			<h2>{i18n.t('demo.availableKeys')} ({allKeys.length})</h2>

			<button class="toggle-btn" onclick={() => (showAllKeys = !showAllKeys)}>
				{showAllKeys ? '🔽 Hide' : '▶️ Show'} All Keys
			</button>

			{#if showAllKeys}
				<div class="keys-grid">
					{#each Object.entries(categorizedKeys()) as [category, keys] (category)}
						{#if keys.length > 0}
							<div class="key-category">
								<h4>{category}</h4>
								<div class="key-list">
									{#each keys as key (key)}
										<button
											class="key-item"
											class:selected={selectedKey === key}
											onclick={() => (selectedKey = key)}
										>
											{key}
										</button>
									{/each}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</section>

		<!-- 开发工具 -->
		{#if import.meta.env.DEV}
			<section class="demo-section dev-tools">
				<h2>🔧 Development Tools</h2>

				<div class="add-key-form">
					<h3>{i18n.t('demo.addNewKey')}</h3>
					<input type="text" placeholder="Key (e.g., footer.copyright)" bind:value={newKey} />
					<input type="text" placeholder="Value (e.g., © 2025 MyApp)" bind:value={newValue} />
					<button onclick={addNewTranslationKey}>Add Key</button>
				</div>

				<div class="type-info">
					<h3>📊 Type Information</h3>
					<p>Total Keys: {allKeys.length}</p>
					<p>Has Key Check: {i18n.hasKey('welcome') ? '✅' : '❌'} welcome</p>
					<p>Has Key Check: {i18n.hasKey('invalid.key') ? '✅' : '❌'} invalid.key</p>
				</div>
			</section>
		{/if}

		<!-- 预定义示例 -->
		<section class="demo-section">
			<h2>🎨 Pre-rendered Examples</h2>
			<div class="examples-grid">
				{#each Object.entries(examples) as [name, value]}
					<div class="example-card">
						<code class="example-key">{name}</code>
						<div class="example-value">{value}</div>
					</div>
				{/each}
			</div>
		</section>
	</div>
</div>

<style>
	.typed-demo-container {
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
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		border-radius: 16px;
	}

	.demo-header h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.demo-header p {
		font-size: 1.2rem;
		opacity: 0.95;
	}

	.demo-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.demo-section {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.demo-section h2 {
		color: #333;
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.key-selector {
		margin-bottom: 2rem;
	}

	.key-selector label {
		display: block;
		margin-bottom: 0.5rem;
		color: #666;
		font-weight: 500;
	}

	.key-selector select {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		background: white;
		cursor: pointer;
		transition: border-color 0.3s;
	}

	.key-selector select:focus {
		outline: none;
		border-color: #667eea;
	}

	.result-display {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}

	.result-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.result-item:last-child {
		margin-bottom: 0;
	}

	.label {
		font-weight: 500;
		color: #666;
		min-width: 150px;
	}

	.key {
		background: #2d2d2d;
		color: #f8f8f2;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-family: 'Fira Code', monospace;
	}

	.translation {
		color: #667eea;
		font-size: 1.1rem;
		font-weight: 500;
	}

	.params-input {
		background: #f0f0f0;
		padding: 1rem;
		border-radius: 8px;
	}

	.params-input h3 {
		margin-bottom: 1rem;
		color: #333;
	}

	.param-row {
		display: flex;
		gap: 1rem;
	}

	.param-row label {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.param-row input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.code-example {
		margin-bottom: 2rem;
	}

	.code-example h3 {
		color: #333;
		margin-bottom: 1rem;
	}

	.code-example pre {
		background: #2d2d2d;
		color: #f8f8f2;
		padding: 1.5rem;
		border-radius: 8px;
		overflow-x: auto;
		font-size: 0.9rem;
		line-height: 1.6;
	}

	.toggle-btn {
		background: #667eea;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.3s;
	}

	.toggle-btn:hover {
		background: #5567d8;
		transform: translateY(-2px);
	}

	.keys-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 1.5rem;
	}

	.key-category h4 {
		color: #667eea;
		margin-bottom: 1rem;
		font-size: 1.1rem;
	}

	.key-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.key-item {
		background: white;
		border: 1px solid #e0e0e0;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.key-item:hover {
		background: #f0f0f0;
		border-color: #667eea;
	}

	.key-item.selected {
		background: #667eea;
		color: white;
		border-color: #667eea;
	}

	.dev-tools {
		background: #fff9e6;
		border: 2px dashed #ffc107;
	}

	.add-key-form {
		margin-bottom: 2rem;
	}

	.add-key-form h3 {
		margin-bottom: 1rem;
		color: #333;
	}

	.add-key-form input {
		width: 100%;
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.add-key-form button {
		background: #4caf50;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.3s;
	}

	.add-key-form button:hover {
		background: #45a049;
	}

	.type-info {
		background: white;
		padding: 1rem;
		border-radius: 8px;
	}

	.type-info h3 {
		margin-bottom: 1rem;
		color: #333;
	}

	.type-info p {
		margin: 0.5rem 0;
		color: #666;
	}

	.examples-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.example-card {
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
	}

	.example-key {
		display: block;
		background: #667eea;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.825rem;
		margin-bottom: 0.5rem;
	}

	.example-value {
		color: #333;
		font-size: 0.95rem;
	}

	@media (max-width: 768px) {
		.typed-demo-container {
			padding: 1rem;
		}

		.demo-header h1 {
			font-size: 1.8rem;
		}

		.param-row {
			flex-direction: column;
		}

		.keys-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
