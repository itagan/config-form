# 基础、校验与动态联动

<PlaygroundLink route="/" />

这个示例覆盖日常表单的最小闭环：双列栅格、动态显隐、Element UI 校验、提交、重置和字段变化事件。

```ts
import { defineConfigFormItems } from '@itagan/config-form'

const items = defineConfigFormItems([
  {
    fieldKey: 'name',
    type: 'input',
    colProps: { span: 12 },
    formItemProps: {
      label: '姓名',
      rules: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
    },
    component: {
      props: { placeholder: '请输入姓名', clearable: true }
    },
    hint: '姓名将用于业务单据展示'
  },
  {
    fieldKey: 'customerType',
    type: 'select',
    colProps: { span: 12 },
    formItemProps: { label: '客户类型' },
    component: {
      options: [
        { label: '个人', value: 'personal' },
        { label: '企业', value: 'company' }
      ]
    }
  },
  {
    fieldKey: 'companyName',
    type: 'input',
    colProps: { span: 12 },
    visible: ({ model }) => model.customerType === 'company',
    formItemProps: { label: '企业名称' }
  }
])
```

```vue
<ConfigForm
  ref="formRef"
  v-model="model"
  :items="items"
  :form-props="{ labelWidth: '96px', size: 'small' }"
  :hint-options="{ mode: 'tooltip' }"
  @field-change="handleFieldChange"
>
  <template #default>
    <el-button type="primary" @click="submit">提交</el-button>
    <el-button @click="formRef.resetFields()">重置</el-button>
  </template>
</ConfigForm>
```

```ts
async function submit() {
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交父组件持有的 model.value
}
```

注意：`resetFields()` 恢复的是 ConfigForm 创建时的 model 快照。如果编辑页需要在异步详情加载后建立新的重置基线，应在数据就绪后再挂载 ConfigForm，或通过 `:key` 重建组件。
