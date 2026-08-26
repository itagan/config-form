# 快速开始

## 环境要求

- Vue `>=2.7.1 <3.0.0`
- Element UI `>=2.4.9 <3.0.0`

```bash
pnpm add @itagan/config-form
```

```ts
import ConfigForm, { defineFormItems } from '@itagan/config-form'
import '@itagan/config-form/style.css'

const items = defineFormItems([
  {
    fieldKey: 'name',
    type: 'input',
    colProps: { span: 12 },
    formItemProps: {
      label: '姓名',
      rules: [{ required: true, message: '请输入姓名' }]
    }
  }
])
```

```vue
<ConfigForm ref="formRef" v-model="formModel" :items="items" />
```

根组件 `v-model` 使用 `model/update:model`。字段更新返回新的 model，不直接修改传入对象。
