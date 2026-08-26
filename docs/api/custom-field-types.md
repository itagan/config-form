# 自定义字段类型

稳定复用的业务组件可注册为实例级 type：

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

input、select、component、slot 等公开名称不可覆盖。一次性组件优先使用 `type: 'component'`，完全自定义模板使用 `type: 'slot'`。
