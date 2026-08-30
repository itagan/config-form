# 架构总览

## 定位

ConfigForm 是 Vue 2.7 + Element UI 的配置驱动表单组件，负责三件事：

1. **布局**：把 `items` 数组渲染成 `el-form → el-row → el-col → el-form-item` 的固定结构。
2. **受控更新**：把字段组件的输出按路径或 binding 映射写回，通过 `update:model` 交给父组件。
3. **扩展点**：内置字段类型、一次性组件、Slot 与业务字段类型注册四种渲染方式，以及动态配置上下文。

它**不负责**：表单数据持有（父组件维护 model）、提交流程、异步请求、Element UI 之外的组件行为。这些边界让 Schema 保持纯数据、可序列化。

## 模块结构

```text
packages/config-form/src/
  index.vue                  # 根组件：布局、Slot、诊断入口
  FieldRenderer.ts           # 字段组件解析与渲染（组件目标/Props/事件/选项/model 协议）
  SlotRenderer.ts            # 具名 Slot 的通用渲染器
  ConfigFormHint.ts / .vue   # Hint 策略与单例 Tooltip
  defineFormItems.ts         # items 的类型收窄入口
  defineConfigFormType(s).ts # 业务字段类型注册的类型协议
  composables/               # 受控写回、校验、导航、Hint 等组合式逻辑
  types.ts / public-types.ts # 完整公共类型（包入口直接导出）
```

## 渲染管线

一次渲染中，每个字段经历以下步骤：

```text
items（校验诊断，仅开发环境）
  → visible 求值，不可见字段直接卸载
  → 组件目标解析（内置 type / is / resolveComponent / slot）
  → 合并注册级默认 Props 与字段级 component.props
  → 解析 options / optionProps / model 协议
  → 渲染 el-col + el-form-item + 字段组件（含 labelSlot / errorSlot / Hint）
```

所有动态函数在求值时收到同一份字段上下文（`model` 只读视图、`fieldKey`、`value`、`itemConfig`），必须同步、无副作用；配置对象在渲染期不会被修改。

## 受控写回

用户输入 → 字段 model 协议（路径或 binding 映射）→ 生成下一份 model → `emit update:model` → 父组件回写 → `emit field-change`。写回只浅拷贝被修改链路。为处理父组件回写前的连续更新，组件在当前微任务内暂存最近一次发出的 model，微任务结束后以受控 prop 为准。详见[受控数据流](/architecture/controlled-data-flow)。

## 开发环境诊断

开发构建会对 Schema 的常见错误输出一次性警告：空 `fieldKey/type`、重复渲染 key、缺少组件或 Slot、未知业务 type、无效字段类型定义、覆盖保留 type。生产构建不执行诊断，不产生运行时开销。

## 与 FormTable 的关系

ConfigForm 与 [FormTable](https://github.com/itagan/form-table) 共享同一套受控写回与扩展模型设计：ConfigForm 面向普通表单布局，FormTable 面向表格内编辑。两者的字段类型注册协议、Hint 单例和键盘导航行为保持一致的设计语言。
