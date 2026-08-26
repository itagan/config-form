# 示例索引

独立 Playground 使用 Vue 2.7 和 Element UI 真实运行 ConfigForm，避免与 VitePress 的 Vue 3 运行时混用。

| 示例 | 核心能力 | Playground |
| --- | --- | --- |
| [基础、校验与联动](/examples/basic-form) | 栅格、规则、提交、重置、显隐、事件 | <a href="http://localhost:5173/#/" target="_blank">打开</a> |
| [选项字段映射](/examples/options-mapping) | Select、Radio、Checkbox、optionProps | <a href="http://localhost:5173/#/options" target="_blank">打开</a> |
| [扩展、Slot 与复合字段](/examples/extensions) | 业务 type、具名 Slot、binding.map | <a href="http://localhost:5173/#/extensions" target="_blank">打开</a> |
| [详情与只读模式](/examples/readonly-detail) | 全局只读、text、字段提示 | <a href="http://localhost:5173/#/readonly" target="_blank">打开</a> |

## 本地运行

在仓库根目录分别启动两个站点：

```bash
pnpm dev       # Playground：http://localhost:5173
pnpm docs:dev  # 文档：http://localhost:5174
```

文档页面给出可复制的关键代码，Playground 展示完整运行效果。Playground 从 workspace 包入口加载 `@itagan/config-form`，因此也会验证真实的包导出方式。
