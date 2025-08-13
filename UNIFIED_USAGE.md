# 统一 i18n 使用指南

本指南展示了如何在第三方 npm 包和 SvelteKit 应用中使用完全一致的 API 配置 `@shelchin/svelte-i18n`。

## 核心概念

- **统一 API**：包和应用使用相同的 `createI18n()` 函数
- **配置继承**：包会自动继承主应用的语言设置
- **命名空间隔离**：每个包有独立的翻译命名空间，避免冲突

## 在第三方 NPM 包中使用

### 1. 安装依赖

```bash
npm install @shelchin/svelte-i18n
```

### 2. 创建 i18n 配置文件

```typescript
// your-package/src/lib/i18n.ts
import { createI18n, type UnifiedI18nConfig } from '@shelchin/svelte-i18n';

// 导入包的翻译文件
import en from './translations/en.json';
import zh from './translations/zh.json';

const translations = {
	en,
	zh
};

// 使用统一 API 创建 i18n 实例
const config: UnifiedI18nConfig = {
	namespace: 'your-package-name', // 包的命名空间
	translations, // 内置翻译
	defaultLocale: 'en', // 默认语言（会被应用覆盖）
	fallbackLocale: 'en' // 回退语言（会被应用覆盖）
};

export const i18n = createI18n(config);
```

### 3. 在包的组件中使用

```svelte
<!-- your-package/src/lib/components/YourComponent.svelte -->
<script lang="ts">
	import { i18n } from '../i18n.js';
	import { onMount } from 'svelte';
	import { initI18n } from '@shelchin/svelte-i18n';

	// 初始化（可选，如果需要动态加载）
	onMount(async () => {
		await initI18n(i18n);
	});
</script>

<button>{i18n.t('button.text')}</button><p>{i18n.t('message', { name: 'User' })}</p>
```

### 4. 导出给使用者

```typescript
// your-package/src/lib/index.ts
export { i18n } from './i18n.js';
export { default as YourComponent } from './components/YourComponent.svelte';
```

## 在 SvelteKit 应用中使用

### 1. 安装依赖

```bash
npm install @shelchin/svelte-i18n
```

### 2. 创建 i18n 配置文件（与包的方式完全一致！）

```typescript
// src/lib/i18n.ts
import { createI18n, type UnifiedI18nConfig } from '@shelchin/svelte-i18n';

// 导入应用的翻译文件
import en from './translations/en.json';
import zh from './translations/zh.json';
import ja from './translations/ja.json';

const translations = {
	en,
	zh,
	ja
};

// 使用统一 API 创建 i18n 实例（注意：与包的用法完全相同！）
const config: UnifiedI18nConfig = {
	namespace: 'app', // 主应用使用 'app' 命名空间
	isMain: true, // 标记为主应用
	translations, // 内置翻译
	defaultLocale: 'en',
	fallbackLocale: 'en',
	// 可选的格式化配置
	formats: {
		date: { year: 'numeric', month: 'long', day: 'numeric' },
		currency: { style: 'currency', currency: 'USD' }
	}
};

export const i18n = createI18n(config);
```

### 3. 在布局中初始化（与包的方式相同！）

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { i18n } from '$lib/i18n';
	import { initI18n } from '@shelchin/svelte-i18n';

	// 使用统一的初始化函数
	onMount(async () => {
		await initI18n(i18n);

		// 可选：处理语言切换逻辑
		const savedLocale = localStorage.getItem('locale');
		if (savedLocale && i18n.locales.includes(savedLocale)) {
			await i18n.setLocale(savedLocale);
		}
	});
</script>

<slot />
```

### 4. 在页面/组件中使用

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { i18n } from '$lib/i18n';
</script>

<h1>{i18n.t('welcome')}</h1>

<!-- 语言切换器 -->
<select bind:value={$i18n.locale}>
	{#each $i18n.locales as locale}
		<option value={locale}>{locale}</option>
	{/each}
</select>
```

## 配置继承机制

当应用和包同时使用时，包会自动继承应用的配置：

```typescript
// 应用设置
const appI18n = createI18n({
  namespace: 'app',
  isMain: true,
  defaultLocale: 'zh',  // 应用使用中文
  fallbackLocale: 'en'
});

// 包的配置会自动继承应用的语言设置
const pkgI18n = createI18n({
  namespace: 'my-ui-lib',
  defaultLocale: 'en',  // 这会被应用的 'zh' 覆盖
  translations: {...}
});

// 结果：pkgI18n 会使用 'zh' 作为默认语言
```

## 关键特性对比

| 特性            | 第三方包            | SvelteKit 应用      | 差异          |
| --------------- | ------------------- | ------------------- | ------------- |
| **配置函数**    | `createI18n()`      | `createI18n()`      | ✅ 相同       |
| **初始化函数**  | `initI18n()`        | `initI18n()`        | ✅ 相同       |
| **配置结构**    | `UnifiedI18nConfig` | `UnifiedI18nConfig` | ✅ 相同       |
| **命名空间**    | 包名                | `'app'`             | ⚠️ 仅值不同   |
| **isMain 标记** | 不设置              | `true`              | ⚠️ 仅应用设置 |
| **翻译导入**    | 从包内              | 从应用内            | ⚠️ 路径不同   |

## 自动发现支持

两种方式都支持通过静态文件添加更多语言：

```
/static/translations/
├── index.json                    # 配置文件
├── app/                          # 应用翻译
│   └── es.json
└── your-package-name/            # 包翻译
    └── es.json
```

`index.json`:

```json
{
	"autoDiscovery": {
		"app": ["es"],
		"packages": {
			"your-package-name": ["es"]
		}
	}
}
```

## 最佳实践

1. **命名空间命名**：
   - 应用：使用 `'app'`
   - 包：使用包名（如 `'@org/package-name'`）

2. **配置文件位置**：
   - 应用：`src/lib/i18n.ts`
   - 包：`src/lib/i18n.ts`（保持一致！）

3. **初始化时机**：
   - 都在 `onMount` 中调用 `initI18n()`
   - 确保客户端环境

4. **类型安全**：
   - 都可以使用 `UnifiedI18nConfig` 类型
   - 支持生成类型定义文件

## 示例项目结构

### 第三方包

```
your-package/
├── src/
│   └── lib/
│       ├── i18n.ts              # i18n 配置（统一 API）
│       ├── translations/
│       │   ├── en.json
│       │   └── zh.json
│       └── components/
│           └── Component.svelte
└── package.json
```

### SvelteKit 应用

```
your-app/
├── src/
│   ├── lib/
│   │   ├── i18n.ts              # i18n 配置（统一 API）
│   │   └── translations/
│   │       ├── en.json
│   │       └── zh.json
│   └── routes/
│       └── +layout.svelte
├── static/
│   └── translations/             # 自动发现的翻译
└── package.json
```

## 总结

通过这个统一的 API 设计：

1. **开发者体验一致**：无论是开发包还是应用，使用相同的 API
2. **配置自动继承**：包自动使用应用的语言设置
3. **命名空间隔离**：避免翻译键冲突
4. **灵活扩展**：支持动态添加语言

这种设计让你无需切换思路，用同一套代码模式就能处理所有 i18n 需求！
