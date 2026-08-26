# Component 与 Binding

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
