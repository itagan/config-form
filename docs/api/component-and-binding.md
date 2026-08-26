# Component 与 Binding

## FieldComponentConfig

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `is` | `string \| Component` | `type: 'component'` 的组件目标 |
| `resolveComponent` | `(context) => string \| Component \| undefined` | 动态解析组件；`undefined` 时回退到 `is` |
| `props` | `object \| (context) => object` | 组件 Props |
| `listeners` | `Record<string, (context, ...args) => void>` | 组件事件监听；第一个参数固定为字段上下文 |
| `options` | `FormItemOption[] \| (context) => FormItemOption[]` | select/radio/checkbox 子选项 |
| `optionProps` | `OptionPropsConfig \| (context) => OptionPropsConfig` | 选项字段名映射 |
| `model` | `FieldModelConfig \| false` | 自定义组件 model 协议；`false` 表示不自动写回 |
| `slot` | `string` | `type: 'slot'` 的具名 Slot 名称 |

## 自定义组件

```ts
{
  fieldKey: 'supplierId',
  type: 'component',
  component: {
    is: SupplierPicker,
    props: ({ model }) => ({ tenantId: model.tenantId }),
    listeners: {
      change: (context, supplier) => context.updateModel({
        supplierName: supplier.name
      })
    }
  }
}
```

`resolveComponent(context)` 可动态选择组件；返回 undefined 时回退到 `is`。自定义 model 可声明 `prop`、`event`、`valueToProp` 和 `valueFromEvent`。

## 自定义 model 协议

默认使用目标 Vue 组件声明的 model 协议；没有声明时为 `value/input`。业务组件协议不同时可显式配置：

```ts
{
  fieldKey: 'supplierId',
  type: 'component',
  component: {
    is: SupplierPicker,
    model: {
      prop: 'selectedId',
      event: 'select',
      valueToProp: (_context, value) => value || null,
      valueFromEvent: (_context, supplier) => supplier.id
    },
    listeners: {
      select: (context, supplier) => {
        context.updateModel({ supplierName: supplier.name })
      }
    }
  }
}
```

model 写回先执行，同名 `listeners` 随后执行，因此监听器上下文可读取本轮最新 model。设为 `model: false` 时只触发监听器，不自动写回字段。

## 选项映射

```ts
component: {
  options: businessOptions,
  optionProps: {
    label: 'text',
    value: 'code',
    disabled: 'locked',
    key: 'id'
  }
}
```

缺省映射为同名的 `label/value/disabled`；未提供 `key` 时使用选项 value。完整案例见[选项字段映射](/examples/options-mapping)。

## 复合字段

```ts
binding: {
  map: [
    { fieldPath: 'start', valuePath: 'start' },
    { fieldPath: 'end', valuePath: 'end' }
  ]
}
```

组件收到 `{ start, end }`，更新时两个 model 路径在同一次事务中写回。fieldPath 与 valuePath 不允许重复或相互包含。

`fieldPath` 是业务 model 路径，`valuePath` 是组件值路径。两侧均支持点路径和数组下标：

```ts
binding: {
  map: [
    { fieldPath: 'location.lng', valuePath: '0' },
    { fieldPath: 'location.lat', valuePath: '1', fallbackValue: 0 }
  ]
}
```

所有 `valuePath` 的根必须同为对象或同为数组。组件回传值缺少某个路径时：存在 `fallbackValue` 就写入其浅拷贝；回传值为 `null` 时写入 `null`；其他情况保留原 model 字段。

为避免写入歧义，同一侧的路径不能重复，也不能互为父子，例如 `address` 与 `address.city` 不能同时出现。
