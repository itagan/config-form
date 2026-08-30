# 自定义组件接入

内置 type 之外的组件有三种接入方式，按复用程度从低到高：

| 方式 | type | 适用场景 |
| --- | --- | --- |
| 一次性组件 | `component` | 单个页面临时使用的业务组件 |
| 字段类型注册 | 业务 type 名 | 多处复用、协议稳定的业务组件 |
| 具名 Slot | `slot` | 完全由模板控制的展示内容 |

## 一次性组件（type: 'component'）

```ts
{
  fieldKey: 'range',
  type: 'component',
  component: { is: TimeRangeEditor }
}
```

- 组件目标 `is`（组件对象或全局注册名）与 `resolveComponent`（同步函数，返回组件）二选一；`resolveComponent` 返回 `undefined` 时回退到 `is`。
- `props`、`listeners` 透传；监听器首参固定为字段上下文，可以读写 model。
- `options/optionProps` 在 `type: 'component'` 下不可用——业务组件的选项数据源通过 `props` 自行传入（`el-cascader` 的 `props.options` 同理）。
- 未配置 `model` 协议时，默认使用组件原生 Vue 2 `v-model`（`value` / `input`）。

`resolveComponent` 适合组件目标由运行时数据决定的场景，例如 JSON Schema 只下发组件名，客户端用注册表绑定：

```ts
const items = remoteSchema.map(item => item.type === 'component'
  ? {
      ...item,
      component: {
        ...item.component,
        resolveComponent: ({ itemConfig }) => registry[itemConfig.meta.component]
      }
    }
  : item
)
```

## 字段类型注册（fieldTypes）

多处复用的组件注册为业务 type，只描述稳定的组件目标、默认 Props 和受控协议：

```ts
const money = defineConfigFormType()<{ currency: string }>({
  is: MoneyInput,
  props: { currency: 'CNY' },
  model: { prop: 'value', event: 'input' }
})

const fieldTypes = defineConfigFormTypes()({ money })
```

```vue
<TaskConfigForm v-model="model" :items="items" :field-types="fieldTypes" />
```

- 注册是**实例级**的（通过 `fieldTypes` Prop 传入），不污染全局。
- `type` 保留名（内置 type 与 `component`/`slot`）不可被注册覆盖。
- 显式泛型（`defineConfigFormType<Model>()<Props, Events>`）后，`items` 中该 type 字段的 `component.props`、`listeners` 按注册协议收窄，未注册的 type 名在类型检查阶段直接报错。
- 注册级 `props` 支持动态函数，与字段级 `component.props` 按浅合并、字段级优先。

完整协议见 [自定义字段类型 API](/api/custom-field-types)。

## 受控协议（model）

组件不满足原生 `v-model` 约定时，用 `component.model` 或注册级 `model` 描述协议：

```ts
component: {
  is: RatingEditor,
  model: {
    prop: 'rating',            // 覆盖受控 prop 名
    event: 'change',           // 覆盖写回事件
    valueFromEvent: (context, value) => Number(value) || 0
  }
}
```

- `valueFromEvent` 从事件参数同步生成写回值；上下文为只读渲染上下文。
- `valueToProp` 在写回前把字段值（或 binding 组合值）转换为组件受控值。
- `model: false` 显式关闭自动写回，适合纯展示或完全自行监听的组件。

## 具名 Slot（type: 'slot'）

```ts
{ fieldKey: 'summary', type: 'slot', component: { slot: 'summary' } }
```

```vue
<TaskConfigForm v-model="model" :items="items">
  <template #summary="{ model: currentModel }">
    <el-alert :title="`${currentModel.project} 摘要`" type="success" :closable="false" />
  </template>
</TaskConfigForm>
```

Slot 作用域提供 `model`、`fieldKey`、`value`、`itemConfig`、`propPath` 和 `component`。注意 Slot 字段不创建实际字段组件：ConfigForm 不会自动禁用其内部控件，详情模式下需业务自理（见[详情与只读示例](/examples/readonly-detail)）。

## 示例

- [扩展、Slot 与复合字段](/examples/extensions)：注册 type + binding 复合 + Slot 组合。
- [JSON Schema 驱动](/examples/schema-driven)：`resolveComponent` 运行时绑定远程声明的组件。
