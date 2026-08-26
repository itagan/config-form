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
pnpm test:coverage
pnpm lint
pnpm type-check
pnpm compat:check
pnpm build
pnpm pack:check
pnpm release:check
```

`release:check` 只执行质量验证，不创建 tag、不推送版本，也不会发布 npm 包。最低兼容消费包固定使用 Vue 2.7.1 与 Element UI 2.4.9。

组件安装和 API 说明见 [`packages/config-form/README.md`](./packages/config-form/README.md)。
