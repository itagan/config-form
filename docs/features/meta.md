# 业务元数据（meta）

`meta` 是字段配置上的业务元数据挂载点：任意字段分支（内置 type、`component`、`slot`、注册业务 type）都可以声明一份纯数据对象，ConfigForm 自身不读取、不校验，只随字段上下文原样透出。适合把业务侧才知道的信息——单位、精度、字典 key、权限码、埋点标识等——随字段声明一起挂载，再在组件 Props、动态配置和回调中按需取用。

组件本身保持与 ConfigForm 解耦：只声明普通 Props，不感知 `meta` 的存在。`meta` 扮演的是"配置侧数据 → 组件 Props"的桥梁。

## 挂载与读取

配置侧直接写在字段项上：

```ts
{
  fieldKey: 'amount',
  type: 'input',
  meta: { unit: '万元', precision: 2 }
}
```

读取侧统一通过 `context.itemConfig.meta`。`itemConfig` 是当前字段的完整配置，所有字段级上下文都携带它：

| 读取位置 | 上下文 | 典型用途 |
| --- | --- | --- |
| `component.props`（含注册级 props） | `ConfigFormFieldBindingContext` | 把挂载数据转成组件 Props |
| `visible` / `hint` / `colProps` / `formItemProps` | `ConfigFormFieldRenderContext` | 按 meta 驱动显隐、提示与布局 |
| `resolveComponent` | `ConfigFormFieldRenderContext` | 按 meta 声明解析组件目标 |
| `listeners`、`model.valueFromEvent` / `valueToProp` | `ConfigFormFieldContext` / 渲染上下文 | 回调中携带业务语义 |
| `type: 'slot'` 的具名 Slot | Slot 作用域（含 `itemConfig`） | 模板中读取挂载数据 |

`meta` 的静态类型是 `Record<string, unknown>`，建议在读取处收敛为业务类型，后续示例都基于这个辅助函数：

```ts
interface FieldMeta {
  unit?: string
  precision?: number
  dictKey?: string
}

const readMeta = (itemConfig: { meta?: Record<string, unknown> }): FieldMeta =>
  (itemConfig.meta ?? {}) as FieldMeta
```

## 基础示例：把业务数据挂载给组件

同一个业务组件在不同字段挂不同 `meta`，即可复用出不同表现：

```ts
const items = defineConfigFormItems<FormData>([
  {
    fieldKey: 'amount',
    type: 'component',
    component: {
      is: MoneyInput,
      props: (context) => {
        const { unit, precision } = readMeta(context.itemConfig)
        return { unit, precision: precision ?? 2 }
      }
    },
    meta: { unit: '万元', precision: 2 },
    formItemProps: { label: '预算金额' }
  },
  {
    fieldKey: 'category',
    type: 'select',
    component: {
      // 字典 key 挂在 meta 上，选项数据由页面加载后传入
      props: (context) => ({ options: loadDict(readMeta(context.itemConfig).dictKey) })
    },
    meta: { dictKey: 'expense_category' },
    formItemProps: { label: '费用类别' }
  }
])
```

`MoneyInput` 只声明 `unit`、`precision` 两个 Props；选项字段的字典 key 放在 `meta.dictKey`，页面层负责加载，避免把整份数据塞进配置。

## 显隐与组件解析

`visible` 与 `resolveComponent` 收到同一份渲染上下文，可以按 meta 做权限和目标控制：

```ts
{
  fieldKey: 'invoiceTitle',
  type: 'input',
  meta: { permissionCode: 'finance:invoice:view' },
  visible: (context) => hasPermission(readMeta(context.itemConfig).permissionCode),
  formItemProps: { label: '发票抬头' }
}
```

远程 JSON Schema 场景下，`meta` 只下发组件名，客户端用注册表解析实际组件：

```ts
component: {
  resolveComponent: (context) => {
    const { componentName } = readMeta(context.itemConfig)
    // 返回 undefined 时回退到 is 或默认渲染目标
    return componentName ? registry[componentName] : undefined
  }
}
```

## Slot 与监听器

`type: 'slot'` 的 Slot 作用域包含 `itemConfig`，模板里通过页面暴露的读取函数取值；监听器首参是可写字段上下文，`meta` 同样经由 `itemConfig` 读取：

```vue
<template #scoreEditor="{ itemConfig }">
  <ScoreInput :max="readMeta(itemConfig).max" />
</template>
```

```ts
listeners: {
  change: (context, value) => {
    report(readMeta(context.itemConfig).trackId, context.fieldKey, value)
  }
}
```

## 收窄配置侧的 meta 类型

希望配置数组整体带上业务 meta 类型时，在配置边界包一层工厂：

```ts
import type { FormItemConfig, FormModel } from '@itagan/config-form'

type BizItemConfig<T extends FormModel> = FormItemConfig<T> & { meta?: FieldMeta }

const defineBizItems = <T extends FormModel>(items: BizItemConfig<T>[]): FormItemConfig<T>[] =>
  items

const items = defineBizItems<FormData>([
  { fieldKey: 'amount', type: 'input', meta: { unit: '万元' }, formItemProps: { label: '预算金额' } }
])
```

ConfigForm 对 `meta` 不可见，这个边界断言不影响运行时行为；ConfigForm 侧仍按 `Record<string, unknown>` 原样透出。

## 边界与响应式

- ConfigForm 不读取、不校验 `meta`：字段渲染行为不因 meta 缺失而变化，业务语义完全由使用方负责。
- `meta` 与 items 其余配置同源响应式：动态 Props、`visible`、`hint` 和组件解析都在计算属性中执行，响应式更新某字段的 meta 后会重新计算。
- meta 是字段级挂载点；跨字段共享的数据不必复制进每个 meta，在回调里直接读取页面数据即可。
- 远程 JSON Schema 场景中 `meta` 只应包含纯数据，组件目标与函数留在客户端注入，见 [JSON Schema 驱动](/examples/schema-driven)。

## 相关页面

- [上下文与 Slot](/api/context-and-slots)：三类上下文的完整字段定义。
- [自定义组件接入](/features/custom-components)：`resolveComponent` 结合 `meta.component` 的注册表绑定。
- [JSON Schema 驱动](/examples/schema-driven)：远程下发 meta 的安全边界与白名单解析。
