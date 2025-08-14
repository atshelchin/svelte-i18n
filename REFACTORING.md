# src/lib 目录重构跟踪文档

## 目标

采用更实用的 DDD 分层架构，减少目录嵌套，消除重复代码，提高可维护性。

## 重构原则

1. **渐进式重构**：每次只改动一小部分
2. **保持功能不变**：所有 API 和功能保持不变
3. **测试驱动**：每步都要通过所有测试
4. **及时提交**：每完成一步就提交代码

## 目标架构

```
src/lib/
├── core/                    # 核心域逻辑
│   ├── i18n.ts             # 主i18n实例和配置
│   ├── store.svelte.ts     # Svelte响应式store
│   ├── translator.ts       # 翻译核心逻辑
│   ├── formatter.ts        # 格式化功能
│   └── types.ts            # 核心类型定义
│
├── services/               # 应用服务层
│   ├── config.ts          # 配置管理
│   ├── loader.ts          # 翻译加载器
│   ├── discovery.ts       # 自动发现
│   └── persistence.ts     # 持久化
│
├── utils/                  # 工具函数
│   ├── locale.ts          # 语言检测和处理
│   ├── path.ts            # 路径和URL处理
│   ├── language-meta.ts   # 语言元数据
│   └── validation.ts      # 验证工具
│
├── kit/                    # SvelteKit集成
│   ├── load.ts            # 统一的load函数
│   ├── ssr.ts             # SSR特定逻辑
│   └── client.ts          # 客户端初始化
│
├── components/             # UI组件
├── cli/                    # CLI工具
├── tests/                  # 所有测试
├── translations/           # 库自身的翻译
├── types/                  # 类型定义
└── index.ts               # 主入口
```

## 重构步骤

### 第一步：合并重复的 layout helper 文件 ✅

**目标**：将 `layout-helpers.ts`, `layout-load.ts`, `simple-layout.ts`, `layout-svelte-helper.ts` 合并
**状态**：已完成

#### 分析

- `layout-helpers.ts` - 基础的 layout helper 函数（被导出使用）- 512行
- `layout-load.ts` - 主要的 loadI18nSSR 和 loadI18nClient 函数（被导出使用）- 488行
- `simple-layout.ts` - 简化版的 load 函数（未被导出）- 420行
- `layout-svelte-helper.ts` - Svelte 组件的 helper（未被导出）- 179行

这些文件有很多重复逻辑，可以合并成一个统一的文件。

#### 进度

✅ 1. 创建新的 `kit/load.ts` 文件作为统一入口
✅ 2. 更新 `index.ts` 使用新的 `kit/load.ts`
✅ 3. 删除未使用的文件：

- `simple-layout.ts` (420行)
- `layout-svelte-helper.ts` (179行)
- 共删除 599 行未使用代码
  ✅ 4. 创建功能分析文档 `docs/helper-analysis.md`
  ✅ 5. 创建对比分析文档 `docs/helper-comparison.md`
  ✅ 6. 创建统一的 SSR 实现 `kit/ssr-load.ts`
- 合并了 `i18nServerLoad` 和 `loadI18nSSR` 的功能
- 保留了pathname检测功能
- 保持向后兼容
  ✅ 7. 所有测试通过（142个单元测试，14个e2e测试）
  ✅ 8. 完成所有函数迁移到 kit 目录
  ✅ 9. 删除 layout-helpers.ts 和 layout-load.ts (999行)
  ✅ 10. 创建完整的 kit 目录结构

### 第二步：创建 tests 目录并移动测试文件 ⏸️

**目标**：将所有测试文件移到独立的 tests 目录
**状态**：待开始

### 第三步：扁平化 domain/services 到 utils ⏸️

**目标**：减少目录嵌套，将 domain/services 的内容移到 utils
**状态**：待开始

### 第四步：重组 infrastructure 到 services ⏸️

**目标**：将 infrastructure 下的内容重组到 services 和 utils
**状态**：待开始

### 第五步：创建 core 目录并重组核心逻辑 ⏸️

**目标**：将核心业务逻辑移到 core 目录
**状态**：待开始

### 第六步：创建 kit 目录整合 SvelteKit 相关 ⏸️

**目标**：所有 SvelteKit 特定代码移到 kit 目录
**状态**：待开始

### 第七步：合并 unified.ts 和 typed-unified.ts ⏸️

**目标**：消除命名混乱，合并相似功能
**状态**：待开始

### 第八步：最终清理和优化 ⏸️

**目标**：清理未使用的代码，优化导出
**状态**：待开始

## 进度记录

### 2025-01-14

- 创建重构计划文档
- 开始第一步：分析 layout helper 文件
- 创建 `kit/load.ts` 作为统一入口
- 删除2个未使用的 helper 文件（599行代码）
- 创建 helper 功能分析文档
- 创建统一的 SSR 实现 `kit/ssr-load.ts`
- 添加全面的 SSR 功能测试（12个测试用例）
- 修复所有 TypeScript 类型问题
- **成果**：
  - 删除了599行未使用的代码
  - 创建了统一的 SSR 实现，保留了pathname检测功能
  - 增加了测试覆盖率
  - 修复了类型系统兼容性问题
  - 所有测试通过（142个单元测试，14个e2e测试）

---

_每完成一步都会更新此文档_
