# layout-helpers.ts vs layout-load.ts 详细对比

## 导出函数对比

### layout-helpers.ts 导出

- `i18nServerLoad` - SSR加载函数
- `i18nUniversalLoad` - 通用加载函数
- `i18nClientInit` - 客户端初始化
- `i18nIsReady` - 检查就绪状态
- `handleSSR` - SSR处理（兼容性）
- `handleClient` - 客户端处理（兼容性）
- `handleUniversal` - 通用处理（兼容性）

### layout-load.ts 导出

- `loadI18nSSR` - SSR加载函数
- `loadI18nUniversal` - 通用加载函数
- `setupI18nClient` - 客户端设置
- `initI18nOnMount` - onMount初始化

## 功能对比表

| 功能                | i18nServerLoad | loadI18nSSR | 差异            |
| ------------------- | -------------- | ----------- | --------------- |
| **基本功能**        |
| 处理cookie locale   | ✅             | ✅          | 相同            |
| 加载auto-discovered | ✅             | ✅          | 相同            |
| 返回ssrTranslations | ✅             | ✅          | 相同            |
| **Pathname支持**    |
| 支持URL参数         | ❌             | ✅          | loadI18nSSR更强 |
| 提取pathname locale | ❌             | ✅          | loadI18nSSR独有 |
| **返回值**          |
| locale              | ✅             | ✅          | 相同            |
| locales             | ✅             | ✅          | 相同            |
| ssrTranslations     | ✅             | ✅          | 相同            |
| isAutoDiscovered    | ✅             | ✅          | 相同            |
| i18nReady           | ✅             | ✅          | 相同            |

## 使用情况

### 在文档中

- `i18nServerLoad` - 在 SIMPLIFIED_USAGE.md 中被引用
- `loadI18nSSR` - 在实际路由中使用 (src/routes/+layout.server.ts)

### 在测试中

- 两者都没有直接的单元测试

## 重要代码差异

### 1. Pathname Locale 检测 (loadI18nSSR 独有)

```typescript
// loadI18nSSR 中
const pathnameLocale = extractLocaleFromPathname(pathname);
if (pathnameLocale) {
	if (i18n.locales.includes(pathnameLocale)) {
		locale = pathnameLocale;
	} else if (isAutoDiscoveredLocale(pathnameLocale)) {
		locale = pathnameLocale;
	}
}
```

### 2. 参数差异

```typescript
// i18nServerLoad - 不接受URL
i18nServerLoad(i18n, cookies, options?)

// loadI18nSSR - 接受URL参数
loadI18nSSR(i18n, cookies, url?, options?)
```

## 合并策略

### 推荐方案：保留更强大的功能

1. 使用 `loadI18nSSR` 的实现（支持pathname）
2. 保留两个函数名以保持向后兼容
3. 让 `i18nServerLoad` 内部调用 `loadI18nSSR`

### 实现方式

```typescript
// 统一实现
export async function loadI18nSSR(i18n, cookies, url?, options?) {
	// 完整实现，支持pathname
}

// 向后兼容
export async function i18nServerLoad(i18n, cookies, options?) {
	return loadI18nSSR(i18n, cookies, undefined, options);
}
```

## 风险评估

- **低风险**：两个函数的核心逻辑相同
- **注意点**：必须保留 ssrTranslations 的返回
- **测试重点**：pathname locale 检测功能
