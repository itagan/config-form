# ConfigForm Workspace

`ConfigForm` 是一个基于 `Vue 2.7 + Element UI + TypeScript` 的配置驱动表单组件。本页只说明仓库开发；组件行为与 API 统一以 [VitePress 文档](./docs/index.md)为准。

## 在线站点

- 文档与示例站：<https://itagan.github.io/config-form/>
- 在线 Playground：<https://itagan.github.io/config-form/playground/>

## 源码仓库

- GitHub 主仓库：<https://github.com/itagan/config-form>
- Gitee 国内镜像：<https://gitee.com/itagan/config-form>

两个仓库同步维护；GitHub 用于源码发布和公共协作，Gitee 为国内访问提供镜像。

## 组件包

`@itagan/config-form` 计划发布到 npm Registry，发布前业务项目可通过 Git 仓库或 workspace alias 引用源码。安装与 API 说明见 [`packages/config-form/README.md`](./packages/config-form/README.md) 与[快速开始](./docs/guide/quick-start.md)。

## 仓库结构

```text
packages/
  config-form/       # 组件包（发布包 @itagan/config-form）
  config-form-min-peer/  # 最低 peer dependency 兼容校验包
playground/          # Vue 2.7 调试和示例应用
docs/                # Vue 3 / VitePress 文档站与统一站点产物
```

核心入口：

- 组件包源码：`packages/config-form/src`
- npm 包入口：`packages/config-form/src/index.ts`
- 调试应用：`playground/src`
- 文档总站：[docs/index.md](./docs/index.md)

## 常用命令

```bash
pnpm install
pnpm dev
pnpm site:dev
pnpm site:build
pnpm site:build:github
pnpm site:check:github
pnpm site:preview
pnpm lint
pnpm type-check
pnpm test
pnpm test:coverage
pnpm test:performance
pnpm build
pnpm compat:check
pnpm docs:check
pnpm pack:check
pnpm release:check
```

命令说明：

- `pnpm dev`：启动 `playground`，用于本地调试组件。
- `pnpm site:dev`：同时启动 Playground 与文档站，保持两个 Vue 运行时隔离。
- `pnpm site:build`：构建单个可部署目录，文档位于 `/`，Playground 位于 `/playground/`。
- `pnpm site:build:github`：按 GitHub Pages 的 `/config-form/` 子路径构建文档和 Playground。
- `pnpm site:check:github`：校验 GitHub Pages 构建的资源和页面路径。
- `pnpm site:preview`：预览 `pnpm site:build` 生成的统一站点。
- `pnpm lint`：检查组件包和 playground 的 TypeScript/Vue 代码规范。
- `pnpm type-check`：检查组件包和 playground。
- `pnpm test`：运行组件包核心逻辑单测。
- `pnpm test:coverage`：运行组件测试并校验覆盖率阈值。
- `pnpm test:performance`：运行 200 字段本地性能基线，用于相邻版本回归对比。
- `pnpm build`：先构建 npm 包，再构建 playground 和文档站。
- `pnpm compat:check`：使用最低 peer dependency 组合验证构建后的包入口。
- `pnpm pack:check`：检查 npm tarball 内容、声明文件和 ESM/CommonJS 导出。
- `pnpm docs:check`：检查文档相对链接、已移除 API 和公共状态描述。
- `pnpm release:check`：执行发布元数据、Lint、覆盖率、类型、构建、文档、同站校验和 npm 打包预检；不会发布。

## 调试页面

完整路由和用途统一维护在[示例索引](./docs/examples/index.md)。本地运行 `pnpm site:dev` 可同时启动 Playground 和 VitePress 文档站。

`playground` 通过 workspace alias 直接引用 `packages/config-form/src/index.ts`，开发时无需先构建组件包。

文档和示例保留独立源码目录，避免 Vue 2.7 与 VitePress 的 Vue 3 依赖混用；发布时由 `pnpm site:build` 合并为 `docs/.vitepress/dist`，只需部署一个静态目录和一个域名。

## 文档

- [VitePress 文档总站](./docs/index.md)
- [示例索引](./docs/examples/index.md)
- [ConfigForm API](./docs/api/config-form.md)
- [排错指南](./docs/guide/troubleshooting.md)
- [更新记录](./CHANGELOG.md)

## 发布前检查

```bash
pnpm release:check
```

master 推送到 GitHub 后会自动部署文档与示例站（`.github/workflows/deploy-pages.yml`）。
