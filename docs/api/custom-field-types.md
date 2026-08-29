# 自定义字段类型

稳定复用的业务组件可注册为实例级 type。注册表只作用于当前 ConfigForm，不修改全局状态。

```ts
const money = defineConfigFormType<FormData>()<MoneyProps, MoneyEvents>({
  is: MoneyInput,
  props: ({ model }) => ({ currency: model.currency }),
  model: { event: 'change' }
})

const fieldTypes = defineConfigFormTypes<FormData>()({ money })
```

```vue
<ConfigForm :field-types="fieldTypes" :items="items" v-model="model" />
```

字段 type 定义仅支持：

| 属性 | 说明 |
| --- | --- |
| `is` | 必填，组件名称或组件对象 |
| `props` | 注册级默认 Props；可使用字段渲染上下文 |
| `model` | 注册级 model 协议，或 `false` 关闭自动写回 |

字段项的 `component.props/model` 会覆盖注册级配置，适合在个别表单中微调：

```ts
const items = defineFormItems<FormData>([
  {
    fieldKey: 'amount',
    type: 'money',
    component: {
      props: ({ model }) => ({ currency: model.currency, precision: 0 })
    }
  }
])
```

`defineConfigFormType` 的两段调用用于先固定 model，再推导组件 Props 与事件协议；它只提供类型约束，不注册全局组件。`defineConfigFormTypes` 保留 type 名称字面量，并在运行时拒绝保留名称。

## 事件元组协议

`defineConfigFormType` 的第二个泛型是事件名到参数元组的映射。显式声明后，`model.event` 只能取已声明的事件名，`valueFromEvent` 的参数随之获得对应元组类型：

```ts
interface MoneyEvents {
  change: [{ amount: number }]
  blur: []
}

const money = defineConfigFormType<FormData>()<MoneyProps, MoneyEvents>({
  is: MoneyInput,
  model: {
    event: 'change',
    valueFromEvent: (context, next) => next.amount
  }
})
```

未声明事件表时协议保持宽松：`event` 接受任意字符串，`valueFromEvent` 参数为 `unknown[]`。协议中同时保留按事件名收窄的监听器类型 `FieldTypeListeners`，可用于给字段组件的回调表补全签名。

`input`、`select`、全部其他内置 type，以及 `component`、`slot` 不可覆盖。一次性组件优先使用 `type: 'component'`，完全自定义模板使用 `type: 'slot'`。

## 选择方式

| 场景 | 建议 |
| --- | --- |
| 只在一处使用的业务组件 | `type: 'component'` |
| 多表单复用且协议稳定 | 注册业务 type |
| 需要完全控制模板结构 | `type: 'slot'` |
| 组件目标随 model 改变 | `component.resolveComponent` |

完整组合示例见[扩展、Slot 与复合字段](/examples/extensions)。
