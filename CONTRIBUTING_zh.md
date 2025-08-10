# 贡献指南 - @shelchin/svelte-i18n

感谢您考虑为 @shelchin/svelte-i18n 做出贡献！🎉

## 目录

- [行为准则](#行为准则)
- [如何贡献？](#如何贡献)
- [开发环境搭建](#开发环境搭建)
- [项目结构](#项目结构)
- [Pull Request 流程](#pull-request-流程)
- [代码风格](#代码风格)
- [测试](#测试)
- [文档](#文档)

## 行为准则

参与本项目时，请遵守以下准则：

- 使用友好和包容的语言
- 尊重不同的观点
- 优雅地接受建设性批评
- 专注于对社区最有利的事情

## 如何贡献？

### 报告 Bug

在创建 bug 报告之前，请先检查现有的 issues。创建 bug 报告时，请包含：

- 清晰描述性的标题
- 重现问题的步骤
- 预期行为 vs 实际行为
- 您的环境（操作系统、Node 版本、Svelte 版本）
- 代码示例或最小复现

### 提出功能建议

功能建议作为 GitHub issues 进行跟踪。请包含：

- 清晰描述性的标题
- 功能的详细描述
- 使用场景和示例
- 为什么这个功能会有用

### 添加语言支持

添加新语言翻译：

1. 使用演示中的翻译编辑器 `/editor`
2. 上传现有语言文件（如 `en.json`）
3. 将所有键翻译成目标语言
4. 提交包含新语言文件的 PR

### 第一次贡献代码

不确定从哪里开始？查找这些标签的 issues：

- `good first issue` - 适合初学者的简单问题
- `help wanted` - 需要社区帮助的问题
- `documentation` - 帮助改进文档

## 开发环境搭建

```bash
# 克隆仓库
git clone https://github.com/atshelchin/svelte-i18n.git
cd svelte-i18n

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 运行测试
pnpm test

# 类型检查
pnpm run check

# 代码检查
pnpm run lint
```

## 项目结构

```
svelte-i18n/
├── src/
│   ├── lib/           # 核心库代码
│   │   ├── store.svelte.ts    # 主 i18n 存储
│   │   ├── formatter.ts       # 格式化工具
│   │   ├── namespace.ts       # 命名空间隔离
│   │   └── components/        # Svelte 组件
│   ├── cli/           # CLI 工具
│   │   ├── extract.ts         # 键提取
│   │   ├── validate.ts        # 翻译验证
│   │   └── generate-types.ts  # 类型生成
│   └── routes/        # 演示和编辑器页面
├── static/
│   └── translations/  # 翻译文件
└── tests/            # 测试文件
```

## Pull Request 流程

1. **Fork 和克隆**：Fork 仓库并克隆你的 fork
2. **创建分支**：创建分支（`git checkout -b feature/amazing-feature`）
3. **编码**：进行更改
4. **测试**：确保所有测试通过（`npm test`）
5. **检查**：修复所有代码检查问题（`npm run lint`）
6. **提交**：使用描述性提交信息
7. **推送**：推送到你的 fork
8. **PR**：打开 Pull Request

### 提交信息指南

我们遵循约定式提交：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更改
- `style:` 代码风格更改（格式化等）
- `refactor:` 代码重构
- `test:` 测试添加或更改
- `chore:` 维护任务

示例：

```
feat: 添加阿拉伯语支持
fix: 修正俄语复数形式
docs: 更新 TypeScript 示例
```

## 代码风格

### TypeScript/JavaScript

- 所有新代码使用 TypeScript
- 启用严格模式
- 优先使用 `const` 而非 `let`
- 使用有意义的变量名
- 为公共 API 添加 JSDoc 注释

### Svelte

- 使用 Svelte 5 runes（`$state`、`$derived` 等）
- 保持组件小而专注
- 在 `<script lang="ts">` 中使用 TypeScript
- 遵循无障碍最佳实践

### CSS

- 使用 CSS 自定义属性进行主题设置
- 移动优先的响应式设计
- 确保支持 RTL 语言

## 测试

我们使用 Vitest 进行测试：

```bash
# 运行所有测试
npm test

# 监视模式运行测试
npm run test:unit

# 运行特定测试文件
npm test src/lib/store.test.ts
```

### 编写测试

- 为所有新功能编写测试
- 保持 >80% 的代码覆盖率
- 测试边缘情况和错误条件
- 使用描述性测试名称

示例：

```typescript
describe('formatNumber', () => {
	it('应该使用特定区域的分隔符格式化数字', () => {
		expect(formatNumber(1234.56, 'en')).toBe('1,234.56');
		expect(formatNumber(1234.56, 'de')).toBe('1.234,56');
	});
});
```

## 文档

### 代码文档

- 为所有公共函数添加 JSDoc 注释
- 包含参数描述和返回类型
- 为复杂功能添加示例

### README 更新

- 为新功能更新 README.md
- 保持示例最新
- 更新功能列表

### 翻译文档

- 记录任何新的翻译键
- 更新翻译编辑器指南
- 为新的格式化选项添加示例

## CLI 开发

开发 CLI 工具时：

1. 更新 `src/lib/cli/` 文件
2. 构建 CLI：`npm run build:cli`
3. 本地测试：`node dist/cli/index.js [command]`
4. 更新帮助文本和示例

## 发布流程

通过 GitHub Actions 自动发布：

1. 更新 `package.json` 中的版本
2. 更新 CHANGELOG.md
3. 创建 GitHub release
4. CI/CD 自动发布到 npm

## 有问题？

欢迎：

- 为问题开启 issue
- 参与现有 issue 的讨论
- 联系维护者

感谢您的贡献！🙏
