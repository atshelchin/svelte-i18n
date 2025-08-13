# @shelchin/svelte-i18n

<div align="center">

**🌍 Svelte 最后一个你需要的 i18n 库**

[![npm version](https://img.shields.io/npm/v/@shelchin/svelte-i18n.svg)](https://www.npmjs.com/package/@shelchin/svelte-i18n)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00.svg)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg)](https://www.typescriptlang.org/)

**零配置 • 类型安全 • AI 驱动 • 企业级功能**

[演示](https://svelte-i18n-demo.vercel.app) • [文档](#文档) • [English](./README.md)

</div>

> [!WARNING]
> **⚠️ 开发状态：该库目前正在积极开发中，尚未准备好用于生产环境。**
>
> 虽然我们对这些功能感到兴奋并正在积极提高稳定性，但请注意：
>
> - API 可能会在没有通知的情况下更改
> - 某些功能是实验性的
> - 预期会有错误和破坏性更改
>
> **对于生产应用程序，请等待稳定的 v1.0.0 版本。**
>
> 欢迎进行实验、提供反馈和贡献！在 [Issues](https://github.com/shelchin/svelte-i18n/issues) 中关注我们的进展。

---

## 🚀 为什么选择 @shelchin/svelte-i18n？

> **不要再与 i18n 库搏斗了。** 我们构建了一个真正能用的。

### 🎯 改变一切的 9 个理由：

1. **🔗 包和应用的统一 API** - 相同的 API 适用于 npm 包和 SvelteKit 应用程序。包作者和应用开发者使用相同的代码。包会自动继承应用设置。

2. **🤖 AI 驱动的翻译编辑器** - 非开发人员可以使用 OpenAI 集成创建翻译。无需编辑 JSON，无需技术知识。

3. **⚡ 真正的零配置** - 自动发现语言，从静态文件自动加载翻译，自动检测用户偏好。它真的能直接工作。

4. **🔒 100% 类型安全** - 每个翻译键都有类型和自动完成功能。输入 `i18n.t('...')` 时获得建议。拼写错误是编译时错误。

5. **🎨 Svelte 5 原生** - 从头开始使用 runes 构建。不是移植，不是包装器 - 纯 Svelte 5。

6. **🌐 全局格式化** - 使用原生 Intl API 为 100+ 个语言环境格式化日期、数字、货币。零依赖。

7. **📦 企业就绪** - 用于微前端的命名空间隔离，静态站点生成支持，通过自动发现的构建后语言添加，全面测试。

8. **💾 翻译缓存** - 随时保存和恢复翻译工作。基于浏览器的 IndexedDB 存储确保您的进度安全。

9. **📂 灵活的导入选项** - 从文件、URL 导入，或恢复未完成的翻译。支持多种源语言以提供上下文。

---

## 💫 快速开始

### 1. 安装

```bash
# 使用 pnpm（推荐）
pnpm add @shelchin/svelte-i18n

# 使用 npm
npm install @shelchin/svelte-i18n
```

### 2. 初始化

```bash
# 运行初始化命令
pnpm run svelte-i18n init
```

这会自动：

- 检测你的项目类型（应用/包/两者）
- 创建翻译目录
- 生成 TypeScript 类型
- 设置 i18n 配置

### 3. 设置 Layout 文件（灵活且简单！）

```typescript
// +layout.server.ts
import type { LayoutServerLoad } from './$types.js';
import { loadI18nSSR } from '@shelchin/svelte-i18n';
import { i18n } from '../translations/i18n.js';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const i18nData = await loadI18nSSR(i18n, cookies);
	
	return {
		...i18nData,
		// 在这里添加你的自定义数据
		myData: 'value'
	};
};
```

```typescript
// +layout.ts（可选，用于 CSR 优化）
import type { LayoutLoad } from './$types.js';
import { loadI18nUniversal } from '@shelchin/svelte-i18n';
import { browser } from '$app/environment';
import { i18n } from '../translations/i18n.js';

export const load: LayoutLoad = async ({ data }) => {
	const i18nData = await loadI18nUniversal(i18n, data, browser);
	
	return {
		...i18nData,
		// 添加你的自定义数据
	};
};
```

```svelte
<!-- +layout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { setupI18nClient, initI18nOnMount } from '@shelchin/svelte-i18n';
	import { i18n, initI18n } from '../translations/i18n.js';

	let { data, children } = $props();
	
	// 同步设置 i18n 以防止闪烁
	let isReady = $state(setupI18nClient(i18n, data));
	
	// 在客户端挂载时初始化
	onMount(async () => {
		await initI18nOnMount(i18n, data, {
			initFunction: initI18n
		});
		if (!isReady) isReady = true;
	});
</script>

{#if isReady}
	{@render children()}
{:else}
	<div>加载中...</div>
{/if}
```

### 4. 在应用中使用

```typescript
// 在 Svelte 应用中（@ 代表 ./src）
import { i18n } from '@/translations/i18n.js';

// 基本用法
i18n.t('welcome', { name: 'World' }); // "欢迎，World！"

// 切换语言
await i18n.setLocale('zh');

// 格式化
i18n.formatCurrency(99.99); // "$99.99" / "¥100"
i18n.formatRelativeTime(-2, 'day'); // "2天前"
```

### 5. 在包开发中使用

```typescript
// 在库/包组件中
import { i18n } from '$lib/translations/i18n.js';

// 使用命名空间隔离
i18n.t('button.submit'); // 包翻译是隔离的
```

**就是这样！** 你的 i18n 已准备就绪。

---

## 🛠️ CLI 命令

### 生成 TypeScript 类型

```bash
# 生成带验证的类型
pnpm run svelte-i18n generate-types

# 跳过验证以加快生成速度
pnpm run svelte-i18n generate-types --no-validate

# 仅为库生成
pnpm run svelte-i18n generate-types --lib
```

### 验证翻译

```bash
# 检查缺失的翻译
pnpm run svelte-i18n validate src/translations/locales

# 使用严格模式（任何问题都会失败）
pnpm run svelte-i18n validate src/translations/locales --strict

# 指定基础语言
pnpm run svelte-i18n validate src/translations/locales --base zh
```

### 提取翻译键

```bash
# 从源代码提取所有 i18n 键
pnpm run svelte-i18n extract ./src ./template.json

# 从特定文件类型提取
pnpm run svelte-i18n extract ./src ./template.json .svelte .ts
```

---

## 🔍 自动发现：无需修改代码即可添加语言

**对团队来说是革命性的：** 翻译人员只需将 JSON 文件放入 `/static/translations/` 即可添加新语言。无需代码更改，无需重新构建，无需部署。

### 设置自动发现

1. 创建 `/static/translations/index.json`：

```json
{
	"autoDiscovery": {
		"app": ["es", "hi", "ko", "pt", "ru"],
		"packages": {
			"@shelchin/svelte-i18n": ["fr", "zh"]
		}
	}
}
```

2. 添加翻译文件：

```
/static/translations/
├── index.json           # 自动发现配置
├── app/                 # 应用翻译
│   ├── es.json
│   ├── hi.json
│   ├── ko.json
│   ├── pt.json
│   └── ru.json
└── @shelchin/svelte-i18n/  # 包翻译
    ├── fr.json
    └── zh.json
```

3. 在你的应用中启用：

```typescript
// 在 +layout.svelte 中
onMount(async () => {
	await i18n.clientLoad(); // 自动发现并加载所有翻译
});
```

**结果：** 新语言立即出现在你的应用中。完美适用于：

- 部署后的语言添加
- 社区翻译
- A/B 测试不同的翻译
- 区域变体

---

## 📝 配置

初始化后，你可以在 `src/translations/i18n.ts` 中自定义 i18n 配置：

```typescript
import { createI18n } from '@shelchin/svelte-i18n';

export const i18n = createI18n({
	defaultLocale: 'zh', // 默认语言
	fallbackLocale: 'en', // 回退语言

	// 插值设置
	interpolation: {
		prefix: '{',
		suffix: '}'
	},

	// 格式化预设
	formats: {
		date: {
			short: { year: 'numeric', month: '2-digit', day: '2-digit' },
			long: { year: 'numeric', month: 'long', day: 'numeric' }
		},
		number: {
			currency: { style: 'currency', currency: 'CNY' }
		}
	}
});
```

---

## 🎯 高级功能

### 插值

```typescript
// 基本插值
i18n.t('welcome', { name: 'Alice' }); // "欢迎，Alice！"

// 嵌套值
i18n.t('user.greeting', { user: { name: 'Bob' } });
```

### 复数化

```typescript
// 基于计数的自动复数化
i18n.t('items', { count: 0 }); // "你有 0 个项目"
i18n.t('items', { count: 1 }); // "你有 1 个项目"
i18n.t('items', { count: 5 }); // "你有 5 个项目"
```

### 格式化

```typescript
// 日期格式化
i18n.formatDate(new Date(), 'short'); // "2023/12/25"
i18n.formatDate(new Date(), 'long'); // "2023年12月25日"

// 数字格式化
i18n.formatNumber(1234.56); // "1,234.56"
i18n.formatCurrency(99.99, 'CNY'); // "¥99.99"

// 相对时间
i18n.formatRelativeTime(-1, 'day'); // "昨天"
i18n.formatRelativeTime(2, 'hour'); // "2小时后"
```

### 命名空间隔离

非常适合需要自己翻译的组件库：

```typescript
// 在你的库的 i18n.ts 中
import { createI18n } from '@shelchin/svelte-i18n';
import packageJson from '../../../package.json';

export const libI18n = createI18n({
	namespace: packageJson.name, // 自动使用包名
	defaultLocale: 'zh'
});
```

### 浏览器语言检测

自动检测并使用用户的浏览器语言：

```typescript
const browserLang = i18n.detectBrowserLanguage();
if (browserLang && i18n.locales.includes(browserLang)) {
	await i18n.setLocale(browserLang);
}
```

---

## 🏗️ 项目结构

```
your-app/
├── src/
│   ├── translations/
│   │   ├── locales/
│   │   │   ├── en.json      # 英文翻译
│   │   │   ├── zh.json      # 中文翻译
│   │   │   └── ...          # 其他语言
│   │   └── i18n.ts          # i18n 配置
│   ├── types/
│   │   └── app-i18n-generated.d.ts  # 自动生成的类型
│   └── routes/
│       └── +layout.svelte   # 在这里初始化 i18n
└── static/
    └── translations/        # 自动发现的翻译
        ├── index.json       # 发现配置
        └── app/
            └── ko.json      # 动态加载的韩语
```

---

## 🌐 SSR 支持

完整的服务器端渲染支持，带有基于 cookie 的语言持久化：

```typescript
// +layout.server.ts
import type { LayoutServerLoad } from './$types';
import { loadI18nSSR } from '@shelchin/svelte-i18n';
import { i18n } from '../translations/i18n';

export const load: LayoutServerLoad = async ({ cookies }) => {
	return await loadI18nSSR(i18n, cookies, {
		cookieName: 'my-locale', // 可选，默认为 'i18n-locale'
		defaultLocale: 'zh' // 可选，默认为 i18n.locale
	});
};
```

---

## 💎 TypeScript 支持

所有翻译键都是完全类型化的：

```typescript
import type { I18nPath } from '@/types/app-i18n-generated';

// 类型安全的翻译键
const key: I18nPath = 'welcome'; // ✅ 有效
const key: I18nPath = 'invalid'; // ❌ TypeScript 错误

// IDE 中的自动完成支持
i18n.t('nav.'); // IDE 建议：'nav.home', 'nav.about'
```

---

## 📚 示例

查看 [examples](./examples) 目录以获取完整的工作示例：

- [基本用法](./examples/basic-usage)
- [类型化用法](./examples/typed-usage)
- [组件库](./examples/component-library)
- [SSR 应用](./examples/ssr-app)

---

## 🤝 贡献

欢迎贡献！请阅读我们的[贡献指南](./CONTRIBUTING.md)了解详情。

---

## 📄 许可证

MIT © [shelchin](https://github.com/atshelchin)

---

## 💬 支持

- 📚 [文档](https://github.com/atshelchin/svelte-i18n#readme)
- 🐛 [报告问题](https://github.com/atshelchin/svelte-i18n/issues)
- 💬 [讨论](https://github.com/atshelchin/svelte-i18n/discussions)
