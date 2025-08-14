# Layout Helper 文件分析

## 文件概览

1. **layout-helpers.ts** (512行)
   - 导出: i18nServerLoad, i18nUniversalLoad, i18nClientInit, i18nIsReady, handleSSR, handleClient, handleUniversal
   - 用途: 被 index.ts 导出

2. **layout-load.ts** (488行)
   - 导出: loadI18nSSR, loadI18nUniversal, setupI18nClient, initI18nOnMount
   - 用途: 被 index.ts 导出，被 routes 使用

3. **simple-layout.ts** (420行)
   - 导出: loadI18nSSR, loadI18nUniversal, initI18nClient, handleSSR, handleUniversal, handleClient
   - 用途: 未被导出（可删除）

4. **layout-svelte-helper.ts** (179行)
   - 导出: setupLayoutSvelte
   - 用途: 未被导出（可删除）

## 功能对比

### SSR 加载函数

| 函数                | layout-helpers | layout-load | simple-layout |
| ------------------- | -------------- | ----------- | ------------- |
| SSR加载             | i18nServerLoad | loadI18nSSR | loadI18nSSR   |
| 返回ssrTranslations | ✅             | ✅          | ✅            |
| 支持pathname locale | ❌             | ✅          | ❌            |
| 支持cookie locale   | ✅             | ✅          | ✅            |
| 加载auto-discovered | ✅             | ✅          | ✅            |

### 关键差异

1. **ssrTranslations 处理**
   - 所有版本都返回 `ssrTranslations` 用于自动发现的语言
   - 这对 SSR 至关重要，防止内容闪烁

2. **Pathname 检测**
   - `layout-load.ts` 支持从 URL 路径检测语言（如 /zh/about）
   - `layout-helpers.ts` 和 `simple-layout.ts` 不支持

3. **功能重复**
   - `simple-layout.ts` 几乎是 `layout-load.ts` 的简化版
   - 可以安全删除，因为未被使用

## 重构策略

### 第一阶段：清理未使用的文件

1. ✅ 删除 `simple-layout.ts` (未使用)
2. ✅ 删除 `layout-svelte-helper.ts` (未使用)

### 第二阶段：合并重复功能

1. 保留 `layout-load.ts` 的 pathname 检测功能
2. 保留 `layout-helpers.ts` 的类型定义
3. 合并到统一的 `kit/load.ts`

### 第三阶段：优化和测试

1. 添加 SSR 功能测试
2. 确保 ssrTranslations 正确传递
3. 验证 pathname locale 检测
4. 测试 cookie locale 回退

## 关键功能必须保留

1. **SSR 翻译传递**

   ```typescript
   // 对于自动发现的语言，必须返回 ssrTranslations
   if (isAutoDiscoveredLocale(locale)) {
   	return {
   		ssrTranslations: i18n.translations[locale],
   		isAutoDiscovered: true
   	};
   }
   ```

2. **Pathname 优先级**
   - pathname locale > cookie locale > default locale

3. **客户端水合**
   - 使用 ssrTranslations 防止内容闪烁
   - loadLanguageSync 同步加载翻译
