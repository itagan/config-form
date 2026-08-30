---
layout: home

hero:
  name: ConfigForm
  text: Vue 2.7 配置驱动表单
  tagline: 基于 Element UI el-form 与栅格布局，统一字段渲染、校验和受控数据更新。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 浏览 API
      link: /api/form-item

features:
  - title: 配置驱动
    details: 使用 FormItemConfig 描述布局、组件、选项、校验和动态交互。
  - title: 可扩展
    details: 支持自定义组件、具名 Slot、业务字段 type 和复合字段 binding。
  - title: 受控更新
    details: model 不可变写回，同步连续更新自动合并，并保留字段粒度事件。
---

[打开 Playground ↗](http://localhost:5173/)

## 选择你的入口

| 当前目标 | 推荐入口 |
| --- | --- |
| 第一次安装并跑通第一个表单 | [快速开始](./guide/quick-start.md) |
| 查询属性、事件、Slot 或 Ref | [ConfigForm API](./api/config-form.md) |
| 接入自定义组件或复杂字段 | [自定义组件接入](./features/custom-components.md) |
| 理解受控更新和渲染边界 | [架构总览](./architecture/overview.md) |
| 查看完整业务组合 | [示例索引](./examples/index.md) |
| 排查渲染、更新或校验异常 | [排错指南](./guide/troubleshooting.md) |

## 核心边界

- `items` 负责字段描述，`type/component/slot` 负责字段渲染；`fieldKey` 支持点路径与数组下标寻址嵌套结构。
- `model` 由页面或 Store 维护，ConfigForm 通过受控事件写回新对象，不修改传入数据。
- Element UI 继续负责具体组件行为；校验规则按 Element 原生方式配置，请求和业务联动由页面负责。
- 自定义字段 type 用于复用已经稳定的业务组件协议，不是基础接入的前置步骤。
