# @shelchin/svelte-i18n

<div align="center">

**🌍 你会用到的最后一个 Svelte i18n 库**

[![npm version](https://img.shields.io/npm/v/@shelchin/svelte-i18n.svg)](https://www.npmjs.com/package/@shelchin/svelte-i18n)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00.svg)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg)](https://www.typescriptlang.org/)

**零配置 • 类型安全 • AI 驱动 • 企业级功能**

[演示](https://svelte-i18n-demo.vercel.app) • [文档](#文档) • [翻译编辑器](#翻译编辑器) • [English README](./README.md)

</div>

> [!WARNING]
> **⚠️ 开发状态：该库目前正在积极开发中，尚未准备好用于生产环境。**
>
> 虽然我们对这些功能感到兴奋并正在努力提高稳定性，但请注意：
>
> - API 可能会在没有通知的情况下更改
> - 某些功能是实验性的
> - 预期会有错误和破坏性更改
>
> **对于生产应用程序，请等待稳定的 v1.0.0 版本发布。**
>
> 欢迎试验、提供反馈和贡献！在 [Issues](https://github.com/shelchin/svelte-i18n/issues) 中关注我们的进展。

---

## 🚀 为什么选择 @shelchin/svelte-i18n？

> **别再纠结于 i18n 库了。** 我们构建了一个真正有效的库。

### 🎯 改变一切的 8 个理由：

1. **🤖 AI 驱动的翻译编辑器** - 非开发人员可以使用 OpenAI 集成创建翻译。无需编辑 JSON，无需技术知识。

2. **⚡ 真正的零配置** - 自动发现语言、从静态文件自动加载翻译、自动检测用户偏好。它真的就是能用。

3. **🔒 100% 类型安全** - 每个翻译键都带有自动补全类型。输入 `i18n.t('...')` 时会获得建议。拼写错误是编译时错误。

4. **🎨 原生 Svelte 5** - 从头开始使用 runes 构建。不是端口，不是包装器 - 纯 Svelte 5。

5. **🌐 全球格式化** - 使用原生 Intl API 为 100+ 个地区格式化日期、数字、货币。零依赖。

6. **📦 企业级就绪** - 微前端的命名空间隔离、静态站点生成支持、通过自动发现在构建后添加语言、全面的测试。

7. **💾 翻译缓存** - 随时保存和恢复翻译工作。基于浏览器的 IndexedDB 存储保护你的进度。

8. **📂 灵活的导入选项** - 从文件、URL 导入，或恢复未完成的翻译。支持多个源语言以获得更好的上下文。

---

## 💫 快速开始

```bash
npm install @shelchin/svelte-i18n
```

**30 秒实现 i18n：**

```typescript
// 设置
import { setupI18n } from '@shelchin/svelte-i18n';

const i18n = setupI18n({
	defaultLocale: 'zh'
});

// 使用
i18n.t('welcome', { name: '世界' }); // "欢迎，世界！"
i18n.formatCurrency(99.99); // "¥99.99" / "$99.99" / "99,99 €"
i18n.formatRelativeTime(-2, 'day'); // "2天前" / "2 days ago"
```

**就是这样。** 真的。

---

## 🔍 自动发现：无需修改代码即可添加语言

**对团队来说是革命性的：** 翻译人员只需将 JSON 文件放入 `/static/translations/` 即可添加新语言。无需修改代码，无需重新构建，无需部署。

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

**结果：** 新语言立即出现在你的应用中。非常适合：

- 部署后添加语言
- 社区翻译
- A/B 测试不同的翻译
- 区域变化

---

## 🚀 部署选项

### 静态站点生成（GitHub Pages、Vercel、Netlify）

该库完全支持静态站点生成和客户端语言切换：

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html', // 启用客户端路由
			precompress: false,
			strict: true
		}),
		paths: {
			base: process.env.BASE_PATH || '' // 用于 GitHub Pages 子目录
		}
	}
};
```

```typescript
// +layout.ts（静态站点不使用 +layout.server.ts）
export const prerender = true; // 启用预渲染
export const ssr = true;

export const load: LayoutLoad = async () => {
	// 语言检测发生在客户端
	return {
		locale: i18n.locale,
		locales: i18n.locales
	};
};
```

### 服务端渲染（Node.js、Express）

对于带有基于 cookie 的语言持久化的 SSR：

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-node';
```

```typescript
// +layout.server.ts
export const load: LayoutServerLoad = async ({ cookies }) => {
	await i18n.serverLoad(cookies); // 从 cookie 加载语言
	return {
		locale: i18n.locale,
		locales: i18n.locales
	};
};
```

---

## 📘 核心功能

### 类型安全的翻译

```typescript
// 从你的 JSON 自动生成类型
i18n.t('user.profile.name'); // ✅ 类型安全
i18n.t('user.profle.name'); // ❌ TypeScript 错误
```

### 插值和复数化

```typescript
i18n.t('items.count', { count: 0 }); // "没有项目"
i18n.t('items.count', { count: 1 }); // "1 个项目"
i18n.t('items.count', { count: 5 }); // "5 个项目"
```

### 格式化 API

```typescript
// 日期
i18n.formatDate(new Date()); // "2024年1月15日"
i18n.formatDate(new Date(), 'short'); // "24/1/15"

// 数字
i18n.formatNumber(1234567.89); // "1,234,567.89"
i18n.formatCurrency(99.99, 'EUR'); // "€99.99"
i18n.formatPercent(0.85); // "85%"

// 相对时间
i18n.formatRelativeTime(-1, 'hour'); // "1小时前"
i18n.formatRelativeTime(3, 'month'); // "3个月后"

// 列表
i18n.formatList(['A', 'B', 'C']); // "A、B和C"
```

### 运行时验证

在开发期间获得即时反馈：

```
❌ Translation validation failed for app in locale "ja":
  • Missing translation: demo.title
  • Missing translation: demo.description
  • Invalid translation type: user.age (expected string, got number)
```

### 命名空间隔离

非常适合微前端和组件库：

```typescript
// 组件库
const libI18n = setupI18n({
	namespace: '@my-lib/components',
	defaultLocale: 'zh'
});

// 主应用
const appI18n = setupI18n({
	defaultLocale: 'zh'
});

// 翻译完全隔离
libI18n.t('button.label'); // 来自库翻译
appI18n.t('page.title'); // 来自应用翻译
```

---

## 🎨 翻译编辑器

为非开发人员提供的内置可视化编辑器：

1. **导入** 从文件或 URL 导入翻译
2. **编辑** 实时预览和验证
3. **翻译** 使用 OpenAI 集成
4. **导出** 生产就绪的 JSON 文件

```svelte
<script>
	import { TranslationEditor } from '@shelchin/svelte-i18n';
</script>

<TranslationEditor />
```

功能：

- 📁 多源导入（文件、URL、保存的会话）
- 🤖 使用 OpenAI 的 AI 驱动翻译
- 💾 使用 IndexedDB 自动保存会话
- 🔍 智能搜索和过滤
- ✅ 实时验证
- 📊 翻译进度跟踪
- 🎯 并排编辑
- 📥 一键导出

---

## 🛠️ 安装和设置

### 基本设置

```bash
npm install @shelchin/svelte-i18n
```

```typescript
// src/lib/i18n.ts
import { setupI18n } from '@shelchin/svelte-i18n';

export const i18n = setupI18n({
	defaultLocale: 'zh',
	fallbackLocale: 'en'
});
```

### 使用内置翻译

```typescript
// 导入你的翻译
import zh from './locales/zh.json';
import en from './locales/en.json';

// 注册它们
import { registerBuiltInTranslations } from '@shelchin/svelte-i18n';

registerBuiltInTranslations({
	app: { zh, en }
});
```

### 使用自动发现

创建 `/static/translations/index.json`：

```json
{
	"autoDiscovery": {
		"app": ["fr", "de", "ja"]
	}
}
```

然后翻译会从 `/static/translations/app/{locale}.json` 自动加载。

### SSR（服务器端渲染）示例

有关使用 SvelteKit 的完整 SSR 示例，请查看[演示仓库](https://github.com/atshelchin/i18n-demo)。

---

## 📦 包结构

```
@shelchin/svelte-i18n
├── /components          # 预构建的 UI 组件
│   ├── LanguageSwitcher # 下拉/按钮语言选择器
│   ├── Trans           # 支持 HTML 的组件
│   └── ValidationPopup # 开发模式验证显示
├── /stores             # 响应式存储
├── /cli                # 类型生成的 CLI 工具
└── /editor            # 翻译编辑器组件
```

---

## 🔧 CLI 工具

### 生成 TypeScript 定义

```bash
npx @shelchin/svelte-i18n generate-types
```

自动从你的翻译文件生成类型定义，实现 100% 的类型安全。

---

## 🌍 支持的语言

通过原生 Intl API 内置支持 100+ 个地区。无需传输地区数据！

流行的地区包括：
`en`、`es`、`fr`、`de`、`it`、`pt`、`ru`、`zh`、`ja`、`ko`、`ar`、`hi`、`tr`、`pl`、`nl`、`sv`、`da`、`no`、`fi`、`cs`、`hu`、`ro`、`th`、`vi`、`id`、`ms`、`tl`、`he`、`el`、`uk`、`bg`、`hr`、`sr`、`sk`、`sl`、`lt`、`lv`、`et`、`is`、`ga`、`mt`、`sq`、`mk`、`ka`、`hy`、`az`、`kk`、`uz`、`ky`、`tg`、`tk`、`mn`、`bo`、`ne`、`si`、`my`、`km`、`lo`、`am`、`ti`、`or`、`as`、`ml`、`kn`、`ta`、`te`、`gu`、`mr`、`pa`、`bn`、`ur`、`ps`、`fa` 等等！

---

## 🤝 贡献

我们欢迎贡献！详情请查看我们的[贡献指南](CONTRIBUTING.md)。

### 开发设置

```bash
# 克隆仓库
git clone https://github.com/yourusername/svelte-i18n.git
cd svelte-i18n

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建生产版本
npm run build
```

---

## 📄 许可证

MIT © [shelchin](https://github.com/atshelchin)

---

## 🙏 致谢

使用 ❤️ 构建：

- [Svelte 5](https://svelte.dev) - 神奇的消失框架
- [SvelteKit](https://kit.svelte.dev) - 构建应用的最快方式
- [TypeScript](https://www.typescriptlang.org) - 具有超能力的 JavaScript
- [Vite](https://vitejs.dev) - 下一代前端工具

---

## 📬 支持

- 📧 邮箱：[your-email@example.com](mailto:your-email@example.com)
- 🐛 问题：[GitHub Issues](https://github.com/yourusername/svelte-i18n/issues)
- 💬 讨论：[GitHub Discussions](https://github.com/yourusername/svelte-i18n/discussions)
- 📖 文档：[完整文档](https://your-docs-site.com)

---

<div align="center">

**准备革新你的 i18n 了吗？**

[开始使用](#快速开始) • [查看演示](https://svelte-i18n-demo.vercel.app) • [在 GitHub 上加星](https://github.com/yourusername/svelte-i18n)

</div>
