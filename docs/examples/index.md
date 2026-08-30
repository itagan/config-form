# 示例索引

独立 Playground 使用 Vue 2.7 和 Element UI 真实运行 ConfigForm，避免与 VitePress 的 Vue 3 运行时混用。每个示例对应文档站的一页说明，Playground 中可以查看实时 model 预览。

## 基础

| 示例 | 核心能力 | Playground |
| --- | --- | --- |
| [基础、校验与联动](/examples/basic-form) | 栅格、规则、提交、重置、显隐、事件 | <PlaygroundLink route="/">打开</PlaygroundLink> |
| [选项字段映射](/examples/options-mapping) | Select、Radio、Checkbox、optionProps | <PlaygroundLink route="/options">打开</PlaygroundLink> |

## 进阶

| 示例 | 核心能力 | Playground |
| --- | --- | --- |
| [动态字段与增删](/examples/dynamic-form) | 数组路径、稳定 key、动态显隐、批量事务 | <PlaygroundLink route="/dynamic">打开</PlaygroundLink> |
| [扩展、Slot 与复合字段](/examples/extensions) | 业务 type、具名 Slot、binding.map | <PlaygroundLink route="/extensions">打开</PlaygroundLink> |
| [JSON Schema 驱动](/examples/schema-driven) | 远程配置下发、resolveComponent、label/error Slot | <PlaygroundLink route="/schema">打开</PlaygroundLink> |

## 状态与体验

| 示例 | 核心能力 | Playground |
| --- | --- | --- |
| [详情与只读模式](/examples/readonly-detail) | 全局只读、text、字段提示 | <PlaygroundLink route="/readonly">打开</PlaygroundLink> |
| [校验聚焦与键盘导航](/examples/interaction-validation) | Enter 导航、scrollToFirstError、focusField | <PlaygroundLink route="/interaction">打开</PlaygroundLink> |
| [提示与 Tooltip 单例](/examples/hint-modes) | title/tooltip 对比、hintTrigger、无障碍 | <PlaygroundLink route="/hints">打开</PlaygroundLink> |

第一次使用建议按从上到下的顺序阅读；查阅具体 API 时从对应页面进入 [API 目录](/api/config-form)。

## 本地运行

在仓库根目录分别启动两个站点：

```bash
pnpm dev       # Playground，端口 5173
pnpm docs:dev  # 文档，端口 5174
```

文档页面给出可复制的关键代码，Playground 展示完整运行效果。Playground 从 workspace 包入口加载 `@itagan/config-form`，因此也会验证真实的包导出方式。

同站部署时设置 `VITE_SITE_BASE`（如 GitHub Pages 的 `/config-form/`），Playground 会随 `pnpm site:build` 并入文档站 `/playground` 子路径，导航和页面内入口自动使用站内地址。如需指向独立部署的线上 Playground，设置 `VITE_PLAYGROUND_URL`；未设置时默认使用本地开发端口。
