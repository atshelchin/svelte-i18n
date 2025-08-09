# svelte-i18n

> [!WARNING]
> **⚠️ 开发状态：该库目前正在积极开发中，尚未准备好用于生产环境。**
>
> 虽然我们对这些功能感到兴奋并正在努力提高稳定性，但请注意：
>
> - API 可能会在没有通知的情况下更改
> - 某些功能是实验性的
> - 预期会有错误和破坏性更改
>
> **对于生产应用程序，请等待稳定的 v2.0.0 版本发布。**
>
> 欢迎试验、提供反馈和贡献！在 [Issues](https://github.com/shelchin/svelte-i18n/issues) 中关注我们的进展。

一个现代化、类型安全的 Svelte 5 国际化（i18n）库，支持运行时验证、自动语言加载和全面的格式化支持。

## 特性

### 🤖 AI 驱动的翻译编辑器

无需技术知识即可创建专业翻译：

- 📥 支持文件上传、URL 导入或恢复保存的工作
- 🤯 集成 OpenAI API 进行智能翻译
- 💾 自动保存到浏览器缓存，永不丢失进度
- 📊 实时进度跟踪和验证
- 🌍 支持 100+ 种目标语言
- 💬 多个源语言提供更好的翻译上下文

### 🎯 核心特性

- **完整的类型安全**：完全的 TypeScript 支持，输入 `i18n.t('` 时自动提示所有可用的翻译键
- **Svelte 5 Runes**：使用 Svelte 5 新的响应式系统（`$state`、`$derived`、`$effect`）构建
- **自动语言加载**：自动发现并加载所有可用的语言文件
- **持久化语言选择**：用户的语言选择保存在 localStorage 中
- **语言元数据**：每个语言文件包含本地名称、旗帜和文字方向
- **运行时验证**：验证翻译完整性，提供详细的错误报告
- **命名空间隔离**：当多个库同时使用 svelte-i18n 时防止冲突
- **构建后扩展**：部署后无需重新编译即可添加新语言
- **翻译缓存**：自动保存翻译进度，支持随时恢复工作
- **智能进度跟踪**：准确识别已翻译内容，空字段视为未翻译

### 🚀 高级特性

- **字符串插值**：翻译中的动态值（`你好 {name}`）
- **复数规则**：内置复数化规则（`{count} 个项目`）
- **嵌套键**：使用点符号组织翻译（`user.profile.title`）
- **自动语言检测**：从浏览器设置检测用户的首选语言
- **SSR 支持**：完全支持 SvelteKit 服务端渲染
- **验证 UI**：可视化组件显示翻译验证错误
- **缺失翻译处理**：开发警告和自定义处理器
- **AI 翻译编辑器**：集成 OpenAI 支持一键翻译所有内容
- **多源语言支持**：同时导入多个源语言文件提供更好的上下文
- **灵活导入选项**：支持从文件、URL 或恢复未完成的翻译

### 🌍 全球格式化（100+ 地区）

- **数字格式化**：标准、紧凑、百分比、科学计数法
- **货币格式化**：根据地区自动检测货币（支持 100+ 个国家）
- **日期格式化**：短、中、长、完整格式
- **时间格式化**：各种时间显示格式
- **相对时间**：任何语言的"2天前"、"3小时后"
- **列表格式化**：每个地区的正确连词"A、B和C"
- **全部由原生 Intl API 提供支持** - 无外部依赖！

## 安装

```bash
npm install svelte-i18n
# 或
pnpm add svelte-i18n
# 或
yarn add svelte-i18n
```

## 快速开始

### 1. 在应用中设置 i18n

```typescript
// src/lib/i18n.ts
import { setupI18n } from '@shelchin/svelte-i18n';

export const i18n = setupI18n({
	defaultLocale: 'zh',
	fallbackLocale: 'en',
	// 翻译可以静态或动态加载
	loadLocale: async (locale) => {
		const translations = await import(`../translations/${locale}.json`);
		return translations.default;
	}
});
```

### 2. 创建带有元数据的翻译文件

```json
// static/translations/zh.json
{
	"_meta": {
		"name": "中文",
		"englishName": "Chinese",
		"direction": "ltr",
		"flag": "🇨🇳"
	},
	"welcome": "欢迎 {name}！",
	"nav": {
		"home": "首页",
		"about": "关于"
	},
	"items": {
		"count": "{count} 个项目"
	}
}
```

```json
// static/translations/index.json（用于自动发现）
{
	"availableLanguages": ["zh", "en", "zh-TW", "fr", "es", "de"]
}
```

### 3. 使用类型安全的翻译（带自动补全）

```typescript
import { createTypedI18n } from '@shelchin/svelte-i18n';
import type { TranslationSchema } from './i18n-types';

const i18n = createTypedI18n<TranslationSchema>(baseI18n);

// 输入时获得智能提示！
i18n.t('w'); // IDE 提示: 'welcome', 'widgets', ...
i18n.t('nav.'); // IDE 提示: 'nav.home', 'nav.about', ...
i18n.t('welcome', { name: 'World' }); // ✅ 参数也有类型检查
```

### 4. 在 Svelte 组件中使用（Svelte 5 Runes）

```svelte
<script lang="ts">
	import { getI18n } from '@shelchin/svelte-i18n';

	const { t, locale } = getI18n();

	let name = $state('世界');
	let count = $state(5);

	// 使用 Svelte 5 runes 的响应式翻译
	const welcomeMessage = $derived(t('welcome', { name }));
	const itemCount = $derived(t('items.count', { count }));
</script>

<!-- 简单翻译 -->
<h1>{welcomeMessage}</h1>

<!-- 嵌套键 -->
<nav>
	<a href="/">{t('nav.home')}</a>
	<a href="/about">{t('nav.about')}</a>
</nav>

<!-- 复数化 -->
<p>{itemCount}</p>

<!-- 语言切换器 -->
<button onclick={() => locale.set('en')}> 切换到英文 </button>
```

## 类型安全

svelte-i18n 自动从翻译文件生成 TypeScript 定义：

```typescript
// 自动生成的类型
type TranslationKeys = 'welcome' | 'nav.home' | 'nav.about' | 'items.count';

// 类型安全的翻译函数
$t('welcome', { name: 'Alice' }); // ✅ 正确
$t('invalid.key'); // ❌ TypeScript 错误
```

## 命名空间支持

使用多个包时防止翻译冲突：

```typescript
// 在库中
export const libI18n = setupI18n({
	namespace: 'my-lib'
	// ...
});

// 在使用该库的应用中
export const appI18n = setupI18n({
	namespace: 'my-app'
	// ...
});

// 两个实例之间没有冲突
```

## 运行时验证

确保运行时的翻译完整性：

```typescript
import { validateTranslations } from '@shelchin/svelte-i18n';

// 验证翻译是否匹配模式
const isValid = await validateTranslations('zh', schema);
if (!isValid) {
	console.warn('翻译验证失败');
}
```

## 自动语言加载

在启动时自动加载所有可用语言：

```typescript
// +layout.svelte
import { setupI18n, autoLoadLanguages } from '@shelchin/svelte-i18n';
import { onMount } from 'svelte';

const i18n = setupI18n({
	defaultLocale: 'zh',
	fallbackLocale: 'en'
});

onMount(async () => {
	// 自动加载 index.json 中列出的所有语言
	await autoLoadLanguages(i18n, {
		translationsPath: '/translations',
		defaultLocale: 'zh'
	});
});
```

## 语言持久化

用户的语言选择会自动保存：

```typescript
// 语言选择自动保存到 localStorage
i18n.setLocale('en'); // 自动保存

// 下次访问时，保存的语言会恢复
// 优先级：localStorage > 浏览器语言 > 默认语言
```

## 验证状态组件

在 UI 中显示翻译验证错误：

```svelte
<script>
	import { ValidationStatus } from '@shelchin/svelte-i18n';
</script>

<!-- 显示不完整翻译的警告 -->
<ValidationStatus showDetails={true} />
```

## SSR 支持

完全支持 SvelteKit 服务端渲染：

```typescript
// +layout.server.ts
import { i18n } from '$lib/i18n';

export async function load({ cookies }) {
	const locale = cookies.get('locale') || 'zh';
	await i18n.loadLanguage(locale);

	return {
		locale
	};
}
```

## 配置

```typescript
setupI18n({
	// 必需
	defaultLocale: 'zh',

	// 可选
	fallbackLocale: 'en',
	namespace: 'my-app',
	loadLocale: async (locale) => {
		/* ... */
	},
	missingKeyHandler: (key) => {
		/* ... */
	},
	interpolation: {
		prefix: '{',
		suffix: '}'
	},
	pluralization: {
		// 自定义复数规则
	},
	formats: {
		// 日期/数字格式选项
	}
});
```

## 全球格式化

为 100+ 个地区格式化数字、日期和货币：

```typescript
// 数字格式化
i18n.formatNumber(1234567.89); // "1,234,567.89" (en) 或 "1.234.567,89" (de)
i18n.formatNumber(123456789, 'compact'); // "123M" (en) 或 "1.2亿" (zh)
i18n.formatNumber(0.1234, 'percent'); // "12.34%"

// 货币（根据地区自动检测）
i18n.formatCurrency(9999.99); // "$9,999.99" (en-US)
// "¥9,999.99" (zh-CN)
// "9.999,99 €" (de-DE)
// "₹9,999.99" (hi-IN)

// 日期格式化
i18n.formatDate(new Date(), 'short'); // "12/25/24" 或 "25/12/24"
i18n.formatDate(new Date(), 'long'); // "December 25, 2024" 或 "2024年12月25日"

// 时间格式化
i18n.formatTime(new Date(), 'short'); // "2:30 PM" 或 "14:30"

// 相对时间
i18n.formatRelativeTime(-2, 'day'); // "2 days ago" 或 "2天前"
i18n.formatRelativeTime(3, 'hour'); // "in 3 hours" 或 "3小时后"

// 列表格式化
i18n.formatList(['A', 'B', 'C']); // "A, B, and C" 或 "A、B和C"
```

## API 参考

### 核心函数

- `setupI18n(config)`：使用配置初始化 i18n
- `getI18n()`：获取 i18n 实例（兼容 Svelte 5 runes）
- `autoLoadLanguages(i18n, options)`：自动加载所有可用语言

### 实例属性（响应式）

- `locale`：当前语言环境（配合 `$derived` 响应式）
- `locales`：所有已加载的语言环境
- `isLoading`：加载状态
- `errors`：按语言环境的验证错误
- `meta`：语言元数据（名称、旗帜等）

### 翻译和格式化

- `t(key, params?)`：获取键的翻译
- `setLocale(locale)`：更改当前语言环境（自动保存）
- `formatNumber(num, preset?)`：格式化数字
- `formatCurrency(num, currency?)`：格式化货币
- `formatDate(date, preset?)`：格式化日期
- `formatTime(date, preset?)`：格式化时间
- `formatRelativeTime(value, unit)`：格式化相对时间
- `formatList(items, type?)`：格式化列表

### 组件

```svelte
<!-- Trans 组件用于复杂翻译 -->
<Trans key="terms" let:link>
	继续即表示您同意我们的<a href="/terms">{link}</a>
</Trans>

<!-- LanguageSwitcher 组件 -->
<LanguageSwitcher />
```

## CLI 工具

```bash
# 从源代码提取翻译键
npx svelte-i18n extract

# 验证翻译文件
npx svelte-i18n validate

# 生成 TypeScript 定义
npx svelte-i18n generate-types
```

## 浏览器支持

- 所有现代浏览器（Chrome、Firefox、Safari、Edge）
- IE11（需要 polyfills）

## 贡献

欢迎贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解详情。

## 许可证

MIT © 2024 svelte-i18n 贡献者

## 致谢

受 [i18next](https://www.i18next.com/) 和 [vue-i18n](https://vue-i18n.intlify.dev/) 等成功的 i18n 库启发，专为 Svelte 生态系统适配，注重类型安全和简洁性。
