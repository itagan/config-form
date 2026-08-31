# ConfigForm API

`ConfigForm` 渲染一个 `el-form`、一个 `el-row`，每个可见字段渲染为一个 `el-col` 和 `el-form-item`。它是受控组件：字段更新会创建下一份 model 并触发 `update:model`，不会直接修改传入对象。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `model` | `FormModel` | 必填 | 受控表单数据；支持 `v-model` 或 `:model.sync` |
| `items` | `FormItemConfig[]` | 必填 | 字段配置，按数组顺序渲染 |
| `formProps` | `object` | `{}` | 透传给 `el-form`；`model` 由 ConfigForm 管理 |
| `rowProps` | `object` | `{ gutter: 16 }` | 透传给唯一的 `el-row` |
| `fieldTypes` | `FieldTypeRegistry` | 条件必填 | 使用自定义 type 时必填；只有内置类型时不可传 |
| `hintOptions` | `ConfigFormHintOptions` | 见下文 | 全局提示策略 |
| `navigationOptions` | `ConfigFormNavigationOptions` | 省略 | Enter 键字段导航；省略时不接管键盘，详见[键盘导航](/features/keyboard-navigation) |

ConfigForm 不提供根级或字段级 `disabled` / `readonly` API。全局禁用通过 `formProps.disabled` 下沉；单字段状态通过 `component.props` 透传给实际 Element 组件。

```vue
<ConfigForm
  ref="formRef"
  v-model="model"
  :items="items"
  :form-props="{ labelWidth: '96px', size: 'small' }"
  :row-props="{ gutter: 20 }"
  @field-change="handleFieldChange"
/>
```

## 数据协议

Vue 2 的组件 model 配置为：

```ts
{
  prop: 'model',
  event: 'update:model'
}
```

因此以下写法等价：

```vue
<ConfigForm v-model="model" :items="items" />
<ConfigForm :model.sync="model" :items="items" />
```

点路径和数组下标都可作为 `fieldKey`：`profile.name`、`addresses[0].city`。写回时仅浅拷贝路径沿线对象，原始根 model 不会被修改。

路径术语保持明确分工：`fieldKey` 是字段自身的业务 model 路径；`binding.map.fieldPath` 是复合绑定写回的业务路径；`valuePath` 是组件值内部路径；Slot 中的 `propPath` 是交给 Element Form 校验的完整路径。在 ConfigForm 中 `propPath` 通常与 `fieldKey` 相同，但两者语义不同。

## 布局规则

每项默认获得 `{ span: 24 }`，再合并 `colProps`。24 栅格超过一行时由 Element UI 自动换行：

```ts
const items = defineConfigFormItems([
  { fieldKey: 'name', type: 'input', colProps: { span: 12 } },
  { fieldKey: 'phone', type: 'input', colProps: { span: 12 } },
  { fieldKey: 'address', type: 'input' }
])
```

## 导出

```ts
import ConfigForm, {
  ConfigForm as NamedConfigForm,
  createConfigForm,
  defineConfigFormItems,
  defineConfigFormType,
  defineConfigFormTypes
} from '@itagan/config-form'
```

`createConfigForm<TModel>()` 返回带业务 model 类型的组件引用，适合需要严格模板类型推导的项目：

```ts
interface CustomerForm {
  name: string
  enabled: boolean
}

const CustomerConfigForm = createConfigForm<CustomerForm>()
```

所有公开类型均可从包根入口导入，包括 `ConfigFormProps`、`ConfigFormExpose`、`ConfigFormEmits`、`FormItemConfig`、`FieldComponentConfig` 与各类上下文类型。

## 开发环境诊断

开发构建会对常见 Schema 错误输出一次性警告：空 `fieldKey/type`、重复渲染 key、缺少组件或 Slot、未知业务 type、无效字段类型定义，以及覆盖保留 type。生产构建不执行这些诊断。

下一步可查看 [FormItem API](/api/form-item)、[事件与 Ref](/api/events-and-ref) 和 [受控数据流](/architecture/controlled-data-flow)。
