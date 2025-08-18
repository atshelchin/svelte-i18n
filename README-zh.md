# @shelchin/svelte-i18n

> 您需要的最后一个 Svelte 国际化库。类型安全、零配置、无缝 SSR/CSR 支持。

[![npm version](https://img.shields.io/npm/v/@shelchin/svelte-i18n)](https://www.npmjs.com/package/@shelchin/svelte-i18n)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00.svg)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg)](https://www.typescriptlang.org/)

[English](./README.md) • [在线演示](https://atshelchin.github.io/svelte-i18n/) • [示例代码](./src/routes)

> ⚠️ **警告**: 该库目前处于积极开发阶段，还不建议用于生产环境。API 可能会在未来版本中更改。文档可能不完善或包含错误。

## ✨ 特性

### 🎯 核心特性

- **🔒 完全类型安全** - 自动生成所有翻译键的 TypeScript 类型
- **🚀 零配置** - 开箱即用，拥有合理的默认设置
- **📦 优化的包体积** - 压缩后约 35KB，支持 tree-shaking
- **🌐 SSR/CSR 支持** - 无缝支持服务端和客户端渲染
- **🔄 热模块替换** - 开发时即时更新翻译
- **🎨 丰富的格式化** - 通过原生 Intl API 内置数字、日期、货币和列表格式化
- **📱 智能语言检测** - 从 URL 路径、浏览器、Cookie 或 localStorage 检测

### 🛠️ 开发体验

- **🤖 强大的 CLI** - 提取键、验证翻译、生成类型
- **🔍 运行时验证** - 在开发时捕获翻译错误
- **📚 命名空间支持** - 为包和库隔离翻译
- **🎯 智能回退** - 使用回退语言优雅降级
- **💾 持久化** - 跨会话记住用户的语言偏好
- **🌍 150+ 语言** - 内置所有主要语言的元数据

### 🏗️ 架构

- **🧩 原生 Svelte 5** - 从零开始使用 runes 构建
- **🔌 统一 API** - 应用程序和 npm 包使用相同的 API
- **📊 懒加载** - 按需加载翻译以获得更好的性能
- **🎛️ 配置继承** - 库自动继承应用程序配置

## 📦 安装

```bash
# 安装依赖
pnpm add @shelchin/svelte-i18n
# 或
npm install @shelchin/svelte-i18n
# 或
yarn add @shelchin/svelte-i18n
```

## 🚀 快速开始

### 1. 运行初始化命令

运行初始化命令自动生成配置：

```bash
# 运行初始化命令（自动检测项目类型并生成配置）
pnpm exec svelte-i18n init
# 或
npx svelte-i18n init
```

这将：

- 创建 `src/translations/` 目录结构
- 生成示例翻译文件（`locales/en.json`、`locales/zh.json`）
- 创建带类型安全设置的 `i18n.ts` 配置文件
- 生成 TypeScript 类型定义

生成的 `i18n.ts` 如下：

```typescript
// src/translations/i18n.ts （自动生成）
import { createI18n } from '@shelchin/svelte-i18n';
import type { I18nPath } from './types/i18n-generated.js';

// 自动扫描并导入 locales 目录中的翻译
const translationModules = import.meta.glob('./locales/*.json', {
	eager: true,
	import: 'default'
});

const translations: Record<string, unknown> = {};

// 从文件路径提取语言代码并构建翻译对象
for (const [path, module] of Object.entries(translationModules)) {
	const match = path.match(/\/([^/]+)\.json$/);
	if (match && match[1]) {
		const langCode = match[1];
		translations[langCode] = module;
	}
}

// 创建带类型安全的 i18n 实例
export const i18n = createI18n<I18nPath>({
	namespace: 'app',
	isMain: true,
	translations,
	defaultLocale: 'en',
	fallbackLocale: 'en'
});

export default i18n;
```

### 2. 配置 SvelteKit

#### 配置 `+layout.server.ts` 用于 SSR：

```typescript
// src/routes/+layout.server.ts
import { loadI18nSSR } from '@shelchin/svelte-i18n';
import { i18n } from '$src/translations/i18n.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request }) => {
	const locale = await loadI18nSSR(i18n, request);
	return {
		locale
	};
};
```

#### 配置 `+layout.ts` 用于通用加载：

```typescript
// src/routes/+layout.ts
import { loadI18nUniversal } from '@shelchin/svelte-i18n';
import { i18n } from '$src/translations/i18n.js';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	await loadI18nUniversal(i18n, data?.locale);
	return {
		locale: data?.locale
	};
};
```

#### 配置 `+layout.svelte` 用于客户端：

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { setupI18nClient } from '@shelchin/svelte-i18n';
	import { i18n } from '$src/translations/i18n.js';

	onMount(async () => {
		await setupI18nClient(i18n);
	});
</script>

<slot />
```

### 3. 在组件中使用

```svelte
<script lang="ts">
	import { i18n } from '$src/translations/i18n.js';
	import { LanguageSwitcher } from '@shelchin/svelte-i18n';

	let name = $state('世界');

	// 带自动补全的类型安全翻译
	const welcome = i18n.t('welcome');
	const hello = i18n.t('hello', { name });
</script>

<h1>{welcome}</h1>
<p>{hello}</p>

<!-- 直接使用 -->
<nav>
	<a href="/">{i18n.t('navigation.home')}</a>
	<a href="/about">{i18n.t('navigation.about')}</a>
	<a href="/contact">{i18n.t('navigation.contact')}</a>
</nav>

<!-- 语言切换器组件 -->
<LanguageSwitcher {i18n} />
```

### 4. 在库/包中使用

对于库包，使用命名空间以避免冲突：

```typescript
// 在库中：src/lib/translations/i18n.ts
import { createI18n } from '@shelchin/svelte-i18n';
import type { LibI18nPath } from './types/i18n-generated.js';

// 自动导入翻译
const translationModules = import.meta.glob('./locales/*.json', {
	eager: true,
	import: 'default'
});

const translations: Record<string, unknown> = {};
for (const [path, module] of Object.entries(translationModules)) {
	const match = path.match(/\/([^/]+)\.json$/);
	if (match && match[1]) {
		translations[match[1]] = module;
	}
}

export const libI18n = createI18n<LibI18nPath>({
	namespace: 'my-ui-lib', // 使用您的包名
	translations
});

// 在库组件中使用
libI18n.t('button.save');
```

## 🛠️ CLI 命令

### 生成 TypeScript 类型

```bash
# 从翻译文件生成类型
pnpm exec svelte-i18n generate-types
# 或使用自定义路径
pnpm exec svelte-i18n generate-types --dir ./src/translations/locales --out ./src/lib/types/i18n-generated.ts
```

### 验证翻译

```bash
# 检查缺失的翻译
pnpm exec svelte-i18n validate src/translations/locales
```

### 提取翻译键

```bash
# 从源代码提取键
pnpm exec svelte-i18n extract ./src ./template.json
```

## 🎯 类型安全

`init` 命令会自动生成 TypeScript 类型。要在更改后重新生成：

```bash
pnpm exec svelte-i18n generate-types
```

这会创建类型定义，为所有翻译键提供自动完成：

```typescript
// 在 src/translations/types/i18n-generated.d.ts 中自动生成的类型
export type I18nPath =
	| 'welcome'
	| 'hello'
	| 'navigation.home'
	| 'navigation.about'
	| 'navigation.contact';

// 已在您的 i18n.ts 中配置了类型安全
import type { I18nPath } from './types/i18n-generated.js';

export const i18n = createI18n<I18nPath>({
	// ... 配置
});

// 现在 TypeScript 确保只使用有效的键
i18n.t('welcome'); // ✅ 有效
i18n.t('hello', { name: 'John' }); // ✅ 带参数有效
i18n.t('invalid.key'); // ❌ TypeScript 错误
```

## 🌍 格式化

使用原生 Intl API 的内置格式化器（零依赖）：

```typescript
const i18n = getI18n();

// 数字
i18n.formatNumber(1234567.89); // "1,234,567.89" (en) / "1.234.567,89" (de)
i18n.formatNumber(0.15, 'percent'); // "15%"
i18n.formatNumber(123456789, 'compact'); // "1.2亿" (zh) / "123M" (en)

// 货币（基于语言自动检测）
i18n.formatCurrency(99.99); // "$99.99" (en-US) / "¥99.99" (zh-CN)
i18n.formatCurrency(99.99, 'EUR'); // "€99.99"

// 日期
i18n.formatDate(new Date()); // "2024/1/15" (zh) / "1/15/2024" (en-US)
i18n.formatDate(new Date(), 'full'); // "2024年1月15日星期一"

// 时间
i18n.formatTime(new Date()); // "下午3:30" / "3:30 PM"

// 相对时间
i18n.formatRelativeTime(-2, 'day'); // "2天前" / "2 days ago"
i18n.formatRelativeTime(3, 'hour'); // "3小时后" / "in 3 hours"

// 列表
i18n.formatList(['苹果', '香蕉', '橙子']); // "苹果、香蕉和橙子"
```

## 🎨 组件

### 语言切换器

预构建的、可访问的语言切换器组件：

```svelte
<script>
	import { LanguageSwitcher } from '@shelchin/svelte-i18n';
	import { i18n } from '../app/i18n';
</script>

<!-- 默认切换器 -->
<LanguageSwitcher {i18n} />

<!-- 自定义样式和位置 -->
<LanguageSwitcher
	{i18n}
	class="my-custom-class"
	position="top-left"
	showFlags={true}
	showLabels={true}
/>
```

### 验证弹窗（仅开发环境）

在开发时显示翻译错误：

```svelte
<script>
	import { ValidationPopup } from '@shelchin/svelte-i18n';
	import { i18n } from '../app/i18n';
</script>

{#if import.meta.env.DEV}
	<ValidationPopup {i18n} />
{/if}
```

## 📚 高级功能

### 基于 URL 的语言检测

从 URL 路径自动检测语言：

```typescript
// 支持以下模式：
// /zh/about -> 中文
// /en-US/products -> 美式英语
// /de-DE/contact -> 德语

export const load: LayoutLoad = async ({ data, url }) => {
	// url 参数启用路径语言检测
	return await loadI18nUniversal(i18n, data, url);
};
```

### 动态翻译加载

动态加载翻译以进行代码分割：

```typescript
// 选项 1：动态导入
async function loadTranslations(locale: string) {
	const translations = await import(`../translations/${locale}.json`);
	await i18n.loadLanguage(locale, translations.default);
}

// 选项 2：从 API 获取
async function fetchTranslations(locale: string) {
	const response = await fetch(`/api/translations/${locale}`);
	const translations = await response.json();
	await i18n.loadLanguage(locale, translations);
}
```

### 库的命名空间支持

库可以拥有不与应用冲突的隔离翻译：

```typescript
// 在您的库中 (my-ui-lib)
export const libI18n = createI18n({
	namespace: 'my-ui-lib',
	translations: {
		en: { button: { save: 'Save', cancel: 'Cancel' } },
		zh: { button: { save: '保存', cancel: '取消' } }
	}
});

// 库翻译自动添加命名空间
libI18n.t('button.save'); // 内部使用 "my-ui-lib.button.save"

// 库自动继承应用的语言设置
// 当应用切换到 'zh' 时，库也切换到 'zh'
```

### 带 Cookie 持久化的 SSR

带语言持久化的服务端渲染：

```typescript
// +layout.server.ts
import type { LayoutServerLoad } from './$types';
import { loadI18nSSR } from '@shelchin/svelte-i18n';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const locale = cookies.get('i18n-locale') || 'en';
	return loadI18nSSR(locale, ['en', 'zh', 'ja']);
};
```

### 复数形式

正确处理所有语言的复数形式：

```typescript
// 英语：0 = 复数，1 = 单数，2+ = 复数
"items.count": "No items | One item | {count} items"

// 中文：简单规则
"items.count": "没有项目 | 一个项目 | {count} 个项目"

// 使用
i18n.t('items.count', { count: 0 });  // "没有项目"
i18n.t('items.count', { count: 1 });  // "一个项目"
i18n.t('items.count', { count: 5 });  // "5 个项目"
```

### 插值

翻译中的动态值：

```typescript
// 基本插值
"welcome": "欢迎 {name}！"
i18n.t('welcome', { name: '张三' }); // "欢迎张三！"

// 嵌套值
"user.greeting": "你好 {user.firstName} {user.lastName}"
i18n.t('user.greeting', {
  user: { firstName: '张', lastName: '三' }
}); // "你好张三"

// 自定义插值标记
const i18n = createI18n({
  interpolation: {
    prefix: '{{',
    suffix: '}}'
  }
});
// 现在使用："welcome": "欢迎 {{name}}！"
```

### 运行时验证

在开发时捕获翻译问题：

```typescript
const i18n = createI18n({
	translations,
	validateInDev: true, // 启用验证
	validateOptions: {
		checkInterpolation: true, // 验证 {变量} 匹配
		checkPluralization: true, // 验证复数形式
		checkHTML: false, // 允许翻译中的 HTML
		checkMissing: true, // 报告缺失的键
		checkExtra: true // 报告多余的键
	}
});

// 在开发时显示带错误的验证弹窗
```

## 🛠️ CLI 工具

### 初始化项目

交互式地在项目中设置 i18n：

```bash
npx svelte-i18n init
```

这将：

- 创建翻译目录
- 生成初始配置文件
- 设置类型定义
- 创建示例翻译

### 提取翻译键

扫描代码并提取所有翻译键：

```bash
# 从源代码提取
npx svelte-i18n extract ./src ./translations/template.json

# 指定文件扩展名
npx svelte-i18n extract ./src ./translations/template.json js ts svelte
```

### 验证翻译

检查所有语言中缺失或多余的键：

```bash
# 基本验证
npx svelte-i18n validate ./translations

# 严格验证（以错误代码退出）
npx svelte-i18n validate ./translations --strict

# 使用特定的基础语言
npx svelte-i18n validate ./translations --base zh
```

### 生成 TypeScript 类型

为翻译键生成类型定义：

```bash
# 为应用翻译生成（默认）
npx svelte-i18n generate-types

# 自定义路径
npx svelte-i18n generate-types \
  --dir ./translations \
  --out ./src/types/i18n.ts \
  --locale en

# 跳过其他语言的验证
npx svelte-i18n generate-types --no-validate
```

## 📖 API 参考

### 核心函数

#### `createI18n<TPath>(config)`

创建类型化的 i18n 实例。

```typescript
const i18n = createI18n<TranslationPaths>({
	translations, // 翻译数据
	defaultLocale: 'en', // 默认语言
	fallbackLocale: 'en', // 缺失翻译的回退语言
	namespace: 'app', // 命名空间（用于库）
	isMain: true, // 是否为主应用实例？
	validateInDev: true, // 启用开发验证
	interpolation: {
		// 插值选项
		prefix: '{',
		suffix: '}'
	}
});
```

#### `i18n.t(key, params?)`

获取带可选插值的翻译文本。

```typescript
i18n.t('welcome', { name: '张三' }); // "欢迎张三！"
i18n.t('items.count', { count: 5 }); // "5 个项目"
```

#### `i18n.setLocale(locale)`

更改当前语言（异步）。

```typescript
await i18n.setLocale('zh'); // 切换到中文
```

#### `i18n.setLocaleSync(locale)`

同步更改语言（用于 SSR）。

```typescript
i18n.setLocaleSync('zh'); // 立即切换
```

#### `i18n.loadLanguage(locale, translations)`

动态加载翻译。

```typescript
await i18n.loadLanguage('ja', japaneseTranslations);
```

### 属性

```typescript
i18n.locale; // 当前语言 ('zh')
i18n.locales; // 可用语言 (['en', 'zh', 'ja'])
i18n.isLoading; // 加载状态 (true/false)
i18n.errors; // 验证错误（仅开发环境）
i18n.meta; // 语言元数据（方向、原生名称等）
```

### SvelteKit 集成

#### `loadI18nUniversal(i18n, data, url?, options?)`

用于 +layout.ts 的通用加载函数。

```typescript
await loadI18nUniversal(i18n, data, url, {
	storageKey: 'i18n-locale', // localStorage 键
	cookieName: 'i18n-locale', // Cookie 名称
	defaultLocale: 'zh', // 默认语言
	detectFromPath: true // 从 URL 路径检测
});
```

#### `loadI18nSSR(locale, locales, options?)`

用于 +layout.server.ts 的服务端加载函数。

```typescript
loadI18nSSR('zh', ['en', 'zh'], {
	cookieName: 'i18n-locale'
});
```

#### `setupI18nClient(i18n, data, options?)`

用于 +layout.svelte 的同步客户端设置。

```typescript
const result = setupI18nClient(i18n, data, {
	defaultLocale: 'zh',
	restoreFromStorage: true
});
```

#### `initI18nOnMount(i18n, data, options?)`

在 onMount 中的异步初始化。

```typescript
await initI18nOnMount(i18n, data, {
	initFunction: async (i18n) => {
		// 自定义初始化
	}
});
```

### 格式化函数

所有格式化器都支持语言感知和响应式：

```typescript
formatNumber(value, style?, options?)
formatCurrency(value, currency?, options?)
formatDate(date, style?, options?)
formatTime(date, style?, options?)
formatRelativeTime(value, unit, options?)
formatList(items, style?, options?)
```

### 实用函数

```typescript
// 检测浏览器语言
detectBrowserLanguage(); // 'zh-CN'

// 验证翻译模式
validateSchema(translations, options);

// 合并翻译对象
mergeTranslations(target, source);

// 从注册表获取可用语言
getAvailableLocales(registry);

// 检查语言是否可用
isLocaleAvailable(registry, 'zh');
```

## 🔧 配置

### 完整配置选项

```typescript
interface I18nConfig {
	// 基础
	defaultLocale?: string; // 默认：'en'
	fallbackLocale?: string; // 默认：与 defaultLocale 相同
	supportedLocales?: string[]; // 如果未设置则自动检测

	// 功能
	validateInDev?: boolean; // 默认：true
	loadingDelay?: number; // 默认：200ms
	namespace?: string; // 默认：'app'
	isMain?: boolean; // 对于 'app' 默认为 true

	// 格式化
	interpolation?: {
		prefix?: string; // 默认：'{'
		suffix?: string; // 默认：'}'
		escapeValue?: boolean; // 默认：false
	};

	pluralization?: {
		separator?: string; // 默认：'|'
	};

	// 验证
	validateOptions?: {
		checkInterpolation?: boolean;
		checkPluralization?: boolean;
		checkHTML?: boolean;
		checkMissing?: boolean;
		checkExtra?: boolean;
	};
}
```

### 环境变量

```bash
# .env
VITE_I18N_DEFAULT_LOCALE=zh
VITE_I18N_FALLBACK_LOCALE=zh
VITE_I18N_SUPPORTED_LOCALES=en,zh,ja,de,fr
VITE_I18N_DEBUG=true
```

## 🎯 最佳实践

### 1. 组织您的翻译

```
src/
  translations/
    en.json          # 英语（基础）
    zh.json          # 中文
    ja.json          # 日语
    locales/         # 替代结构
      zh/
        common.json
        errors.json
        forms.json
```

### 2. 使用类型安全

始终生成并使用类型：

```typescript
// 翻译更改后生成类型
npm run i18n:types

// 导入并使用
import type { I18nPath } from '$lib/types/i18n-generated';
export const i18n = createI18n<I18nPath>({ ... });
```

### 3. 处理加载状态

```svelte
{#if i18n.isLoading}
	<LoadingSpinner />
{:else}
	<Content />
{/if}
```

### 4. 优化包大小

```typescript
// ❌ 不要静态导入所有翻译
import * as allTranslations from './translations';

// ✅ 只导入需要的或使用动态导入
import zh from './translations/zh.json';
const en = await import('./translations/en.json');
```

### 5. 测试您的翻译

```typescript
// 在 CI/CD 中运行验证
npm run i18n:validate

// 使用不同语言测试
npm run dev -- --locale=zh
```

## 🤝 贡献

我们欢迎贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解详情。

### 开发设置

```bash
# 克隆仓库
git clone https://github.com/atshelchin/svelte-i18n.git

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建库
pnpm build
```

## 📄 许可证

MIT © [Shelchin](https://github.com/atshelchin)

## 🙏 致谢

使用以下技术构建 ❤️：

- [Svelte 5](https://svelte.dev) - 神奇的消失框架
- [SvelteKit](https://kit.svelte.dev) - 构建 Svelte 应用的最快方式
- [TypeScript](https://www.typescriptlang.org) - 带类型语法的 JavaScript
- [Vite](https://vitejs.dev) - 下一代前端工具

特别感谢所有[贡献者](https://github.com/atshelchin/svelte-i18n/graphs/contributors)帮助改进这个项目！

---

<div align="center">

**[文档](https://github.com/atshelchin/svelte-i18n#readme)** •
**[在线演示](https://atshelchin.github.io/svelte-i18n/)** •
**[示例](https://github.com/atshelchin/svelte-i18n/tree/main/src/routes)** •
**[报告问题](https://github.com/atshelchin/svelte-i18n/issues)**

由 [Shelchin](https://github.com/atshelchin) 用 ❤️ 制作

</div>
