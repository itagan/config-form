# ConfigForm

基于 Vue 2.7、Element UI `el-form` 与栅格布局的配置化表单组件。API 风格与 FormTable 保持一致：字段类型、组件映射、复合 binding、动态配置、插槽上下文和不可变数据写回可以在两者间迁移。

## 安装

组件当前尚未发布到 npm Registry。仓库开发和联调阶段使用 workspace alias 或 Git 依赖；正式发布后安装命令为：

```bash
pnpm add @itagan/config-form
```

使用方需要安装并注册 Vue `>=2.7.1 <3` 与 Element UI `>=2.4.9 <3`。

仓库通过独立消费包持续验证 Vue `2.7.1` 与 Element UI `2.4.9` 的最低 peer 组合；日常开发环境使用 Vue `2.7.16` 与 Element UI `2.15.14`。

## 快速开始

```ts
import ConfigForm, { defineConfigFormItems } from '@itagan/config-form'
import '@itagan/config-form/style.css'

const items = defineConfigFormItems([
  {
    fieldKey: 'profile.name',
    type: 'input',
    colProps: { span: 12 },
    formItemProps: {
      label: '姓名',
      rules: [{ required: true, message: '请输入姓名' }]
    },
    component: {
      props: { clearable: true, placeholder: '请输入姓名' }
    }
  },
  {
    fieldKey: 'status',
    type: 'select',
    colProps: { span: 12 },
    formItemProps: { label: '状态' },
    component: {
      options: [
        { label: '启用', value: 'enabled' },
        { label: '停用', value: 'disabled' }
      ]
    }
  }
])
```

```vue
<ConfigForm
  ref="configFormRef"
  v-model="formModel"
  :items="items"
  :form-props="{ labelWidth: '100px', size: 'small' }"
  :row-props="{ gutter: 16 }"
  @field-change="handleFieldChange"
/>
```

根组件 `v-model` 使用 `model/update:model`，也可以使用 `:model.sync`。每次字段更新都会返回新的 model，不直接修改传入对象。

## 栅格布局

ConfigForm 固定使用一个 `el-row`，所有字段各自渲染为 `el-col`。Element UI 的 24 栅格会在总宽度超过 24 时自动换行，因此不需要额外的多行 Schema：

```ts
const items = defineConfigFormItems([
  { fieldKey: 'name', type: 'input', colProps: { span: 12 } },
  { fieldKey: 'phone', type: 'input', colProps: { span: 12 } },
  { fieldKey: 'address', type: 'input', colProps: { span: 24 } }
])
```

根级 `rowProps` 控制 `gutter`、对齐方式等；字段级 `colProps` 支持 `span`、`offset`、`xs`、`sm`、`md`、`lg`、`xl` 等 Element UI 栅格属性。

## 字段配置

`FormItemConfig` 的常用属性：

| 属性 | 说明 |
| --- | --- |
| `fieldKey` | model 字段路径，支持 `profile.city`、`items[0].name` |
| `type` | 内置类型、`component`、`slot` 或注册的业务类型 |
| `colProps` | 传给外层 `el-col`，默认 `{ span: 24 }` |
| `formItemProps` | 传给 `el-form-item`，包括 label、rules 等 |
| `component` | 字段组件的 props、listeners、options、model 配置 |
| `visible` | 布尔值或 `(context) => boolean` |
| `hint` | 字段提示内容，支持动态回调或 `false` 单独关闭 |
| `hintTrigger` | Tooltip 触发范围：整个 FormItem 或字段内容 |
| `binding` | 将多个 model 路径映射为一个复合组件值 |
| `labelSlot` / `errorSlot` | 自定义 label 和校验错误插槽名 |

内置类型与 FormTable 一致：`input`、`select`、`date`、`time`、`time-select`、`number`、`switch`、`radio`、`checkbox`、`text`、`rate`、`slider`、`color`、`cascader`、`autocomplete`。

动态 `visible`、`colProps`、`formItemProps`、`component.options/optionProps` 回调收到只读渲染上下文：

```ts
interface ConfigFormFieldRenderContext {
  model: Readonly<FormModel>
  fieldKey: string
  value: any
  itemConfig: Readonly<FormItemConfig>
}
```

`component.props` 进一步收到 `ConfigFormFieldBindingContext`，可读取复合映射后的 `bindingValue`。字段禁用、只读等 Element 能力也直接在这里透传。

## 复合字段映射

范围、地址、经纬度等复合组件可沿用 FormTable 的 `binding.map`：

```ts
{
  fieldKey: 'start',
  type: 'component',
  component: { is: DateRangeEditor },
  binding: {
    map: [
      { fieldPath: 'start', valuePath: 'start' },
      { fieldPath: 'end', valuePath: 'end' }
    ]
  }
}
```

组件收到 `{ start, end }`，输入后两个 model 字段在同一次更新中写回。

## 自定义组件与插槽

一次性组件使用 `type: 'component'`：

```ts
{
  fieldKey: 'supplierId',
  type: 'component',
  component: {
    is: SupplierPicker,
    props: ({ model }) => ({ tenantId: model.tenantId }),
    listeners: {
      change: (context, supplier) => context.updateModel({ supplierName: supplier.name })
    }
  }
}
```

需要按当前 model 选择不同组件时，使用 `component.resolveComponent(context)`；返回 `undefined` 会回退到 `component.is`。

完全自定义渲染使用 `type: 'slot'`。插槽上下文提供 `value`、`setValue`、`bindingValue`、`setBindingValue`、`updateModel`、`model`、`itemConfig` 与 `propPath`。

```vue
<template #amountEditor="{ value, setValue }">
  <MoneyInput :value="value" @input="setValue" />
</template>
```

```ts
{
  fieldKey: 'amount',
  type: 'slot',
  component: { slot: 'amountEditor' }
}
```

稳定复用的业务组件可以在实例级注册：

```ts
interface FormData {
  amount: number
  currency: string
}

interface MoneyProps {
  currency: string
  precision?: number
}

interface MoneyEvents {
  change: [{ amount: number }]
}

const money = defineConfigFormType<FormData>()<MoneyProps, MoneyEvents>({
  is: MoneyInput,
  props: ({ model }) => ({ currency: model.currency, precision: 2 }),
  model: { event: 'change' }
})

const fieldTypes = defineConfigFormTypes<FormData>()({ money })

const items = [{ fieldKey: 'amount', type: 'money' }]
```

`defineConfigFormType` 会校验注册默认 Props 和 model 事件名，`defineConfigFormTypes` 会保留 type 名称字面量，并拒绝注册 `input`、`select`、`component`、`slot` 等保留名称。

## 配置诊断

开发环境会检查并去重提示以下问题：

- 字段 `fieldKey` 或 `type` 为空；
- 多个字段使用相同的渲染 key；
- `component` 字段缺少 `component.is/resolveComponent`；
- `slot` 字段缺少 `component.slot`；
- 自定义 type 未注册或注册定义无效；
- `fieldTypes` 覆盖内置保留名称。

同一个 model 路径确实需要渲染多次时，为每项配置不同的 `key` 即可。

## Hint 与交互状态

```vue
<ConfigForm
  v-model="formModel"
  :items="items"
  :hint-options="{ mode: 'tooltip', field: true }"
  :form-props="{ disabled: detailMode }"
/>
```

`hintOptions.mode` 支持 `title`、`tooltip` 和 `false`；`field: true` 会默认使用当前字段值，也可以传入统一格式化函数。字段自身的 `hint` 优先级更高。

`tooltip` 模式使用表单级单例 Tooltip 事件委托展示：悬停或键盘焦点进入字段时出现，`aria-describedby` 自动维护，Escape 可临时关闭。`hintTrigger` 可把触发范围从整个 FormItem（`item`，默认）收窄到字段内容根节点（`content`）。

ConfigForm 不提供额外的 `disabled`、`readonly` Props。全局禁用通过 `formProps.disabled` 交给 Element Form 下沉；单字段状态通过 `component.props` 直接透传给实际字段组件。

## 校验聚焦与键盘导航

```ts
async function submit() {
  if (!await formRef.value?.validate()) {
    await formRef.value?.scrollToFirstError()
    return
  }
  // 提交父组件持有的 formModel
}
```

- `scrollToFirstError()`：滚动到第一个校验失败的字段（居中）并尝试聚焦。
- `focusField(fieldKey)`：聚焦已挂载字段的第一个可聚焦元素，字段隐藏或未知时返回 `false`。
- `validateField(props, callback?)` 返回 `Promise<boolean>`；未挂载或未知字段直接视为失败。

```vue
<ConfigForm
  v-model="formModel"
  :items="items"
  :navigation-options="{ enabled: true }"
/>
```

传入 `navigationOptions` 后，Enter 跳到下一个已挂载字段（Shift+Enter 返回）；隐藏、禁用、只读字段自动跳过，textarea 与输入法组合状态不接管。省略该 prop 时不改变 Enter 原生行为。

## 事件与 Ref

- `update:model(model)`：受控 model 更新。
- `field-change(payload)`：字段粒度更新，包含 `fieldKey`、新值和旧值。
- `form-validate(prop, valid, message)`：透传 Element Form 的逐字段校验结果。
- Ref 校验方法：`validate()`、`validateField()`、`resetFields()`、`clearValidate()`、`getFormRef()`、`scrollToFirstError()`、`focusField()`。
`resetFields()` 使用支持 Date、RegExp、Map、Set、对象原型和循环引用的内部快照器。model 读取与页面级写入由父组件负责；字段内部的组合更新使用上下文 `updateModel`。

本地运行 `pnpm dev` 查看示例，运行 `pnpm test`、`pnpm type-check` 和 `pnpm build` 完成验证；`pnpm test:performance` 可执行 200 字段本地性能基线。
