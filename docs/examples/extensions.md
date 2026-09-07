# 扩展、Slot 与复合字段

<PlaygroundLink route="/extensions" />

这个场景组合三种扩展方式：注册可复用的金额 type、用 Slot 完全控制摘要渲染、用 `binding.map` 将开始和结束时间交给一个复合编辑器。

## 注册业务字段 type

```ts
interface FormData {
  project: string
  amount: number
  currency: string
  start: string
  end: string
  summary: string
}

interface MoneyProps {
  currency: string
  precision?: number
}

interface MoneyEvents {
  input: [number]
}

const money = defineConfigFormType<FormData>()<MoneyProps, MoneyEvents>({
  is: MoneyInput,
  props: ({ model }) => ({ currency: model.currency, precision: 2 })
})

const fieldTypes = defineConfigFormTypes<FormData>()({ money })
```

## 配置复合字段和 Slot

```ts
const items = defineConfigFormItems<FormData>([
  {
    fieldKey: 'amount',
    type: 'money',
    colProps: { span: 12 },
    formItemProps: { label: '金额' }
  },
  {
    fieldKey: 'start',
    type: 'component',
    component: { is: TimeRangeEditor },
    binding: {
      map: [
        { fieldPath: 'start', valuePath: 'start' },
        { fieldPath: 'end', valuePath: 'end' }
      ]
    },
    formItemProps: { label: '工作时段' }
  },
  {
    fieldKey: 'summary',
    type: 'slot',
    component: { slot: 'summary' },
    formItemProps: { label: '摘要' }
  }
])
```

```vue
<ConfigForm
  v-model="model"
  :items="items"
  :field-types="fieldTypes"
>
  <template #summary="{ model: currentModel }">
    <el-alert
      :closable="false"
      :title="`${currentModel.project} / ${currentModel.amount} 元`"
      type="success"
    />
  </template>
</ConfigForm>
```

这里 `fieldKey: 'start'` 同时作为校验 prop 和事件身份；组件实际接收的值由 binding 组装为 `{ start, end }`。更新复合值后，两个字段在同一份新 model 中写回。

## 原生组件插槽

示例页的项目输入框通过 `component.nativeSlots` 使用 Input 的 `prepend/append`，负责人使用 Autocomplete 的作用域插槽：

```ts
{
  fieldKey: 'owner',
  type: 'autocomplete',
  component: {
    props: { fetchSuggestions }, // 使用原生建议查询回调
    nativeSlots: { default: 'ownerSuggestion' }
  }
}
```

```vue
<template #ownerSuggestion="{ slotProps }">
  <span>{{ slotProps.item.value }} · {{ slotProps.item.role }}</span>
</template>
```

选择建议项仍走原生组件的 v-model；不需要另建包装组件。字段读写能力通过同级的 `field` 参数获取，详见[原生组件插槽](/api/context-and-slots#原生组件插槽)。
