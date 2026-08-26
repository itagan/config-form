# ConfigForm Workspace

Vue 2.7 + Element UI 配置驱动表单组件仓库。

## 目录

- `packages/config-form`：发布包 `@itagan/config-form`
- `playground`：Vue 2 综合示例站
- `docs`：独立 VitePress 文档站
- `scripts`：发布包检查

## 开发

```bash
pnpm install
pnpm dev          # Playground：http://localhost:5173
pnpm docs:dev     # 文档：http://localhost:5174
pnpm site:dev     # 同时启动两者
```

## 验证

```bash
pnpm test
pnpm type-check
pnpm build
pnpm pack:check
pnpm release:check
```

组件安装和 API 说明见 [`packages/config-form/README.md`](./packages/config-form/README.md)。
