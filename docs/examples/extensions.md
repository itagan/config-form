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
const items = defineFormItems<FormData>([
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
