# 开发与质量检查

## 常用命令

```bash
pnpm dev              # Vue 2 Playground，端口 5173
pnpm docs:dev         # VitePress，端口 5174
pnpm lint
pnpm test:coverage
pnpm type-check
pnpm compat:check
pnpm release:check
```

`release:check` 会执行 lint、覆盖率、类型、组件构建、最低 peer、Playground、文档和发布包入口检查。它不会创建提交、tag 或发布 npm 包。

## 兼容环境

- 日常开发：Vue 2.7.16、Element UI 2.15.14。
- 最低 peer：Vue 2.7.1、Element UI 2.4.9。

最低 peer 消费包从 `@itagan/config-form` 的构建产物加载 ESM、类型和样式入口，并执行挂载、受控更新、自定义 model 与校验测试。发布包检查额外加载 CommonJS 入口。

## 分支流程

功能和修复在独立 `codex/feature-*` 或 `codex/fix-*` 分支完成。合并前必须运行 `pnpm release:check`，通过后使用非快进合并回 master；默认不自动推送远端。
