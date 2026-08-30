# 开发与质量检查

## 常用命令

```bash
pnpm dev              # Vue 2 Playground，端口 5173
pnpm docs:dev         # VitePress，端口 5174
pnpm lint
pnpm test:coverage
pnpm test:performance
pnpm type-check
pnpm compat:check
pnpm docs:check
pnpm release:check
```

`release:check` 会执行发布元数据、lint、覆盖率、类型、组件构建、最低 peer、文档语义、Playground、站点和发布包入口检查。它不会创建提交、tag 或发布 npm 包。

`publish:check` 在 `release:check` 之后额外要求 Changelog 不再包含 `Unreleased` 内容；包的 `prepublishOnly` 会调用它，从而阻止未分配新版本的变更被误发布。本仓库日常开发和合并只运行 `release:check`。

## 兼容环境

- 日常开发：Vue 2.7.16、Element UI 2.15.14。
- 最低 peer：Vue 2.7.1、Element UI 2.4.9。

最低 peer 消费包从 `@itagan/config-form` 的构建产物加载 ESM、类型和样式入口，并执行挂载、受控更新、自定义 model 与校验测试。发布包检查额外加载 CommonJS 入口。

## 配置诊断

开发环境下（`import.meta.env.DEV`），ConfigForm 在挂载时收集配置问题并按 key 去重后以 `console.warn` 输出，不抛错、不影响渲染：

- 注册表：保留名称被忽略、定义不是对象、不支持的定义键（只允许 `is`、`model`、`props`）、`is`/`props`/`model` 类型错误、`model.prop`/`model.event` 必须为字符串、`model.valueToProp`/`model.valueFromEvent` 必须为函数。
- 字段项：`fieldKey`/`type` 非空、渲染 key 重复、`type: 'component'`/`'slot'` 缺少渲染目标、未注册的业务 type（提示当前可用的自定义类型名）、自定义类型在 item 级使用 `component.is/resolveComponent/slot/options/optionProps` 等被禁止的覆盖键。

生产构建不包含诊断逻辑。

## 分支流程

功能和修复在独立 `codex/feature-*` 或 `codex/fix-*` 分支完成。合并前必须运行 `pnpm release:check`，通过后使用非快进合并回 master；默认不自动推送远端。
