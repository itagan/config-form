# 布局与 Slot

ConfigForm 固定的渲染结构是：一个 `el-form`、一个 `el-row`，每个可见字段对应一个 `el-col` 和一个 `el-form-item`。四个层级的属性各管一层，全部支持动态函数：

| 属性 | 作用对象 | 默认值 |
| --- | --- | --- |
| `formProps` | `el-form` | `{}`；`model` 由 ConfigForm 管理，不要在 `formProps` 里传 |
| `rowProps` | `el-row` | `{ gutter: 16 }` |
| `item.colProps` | 字段的 `el-col` | `{ span: 24 }` |
| `item.formItemProps` | 字段的 `el-form-item` | `{}`；`label`、`rules`、`labelWidth` 等按 Element UI 原生用法 |

```vue
<TaskConfigForm
  v-model="model"
  :items="items"
  :form-props="{ labelWidth: '96px', size: 'small' }"
  :row-props="{ gutter: 20 }"
/>
```

```ts
{
  fieldKey: 'address',
  type: 'input',
  colProps: ({ model }) => ({ span: model.expanded ? 24 : 12 }),
  formItemProps: { label: '地址', rules: [{ required: true }] }
}
```

超出一行 24 栅格时由 Element UI 自动换行；字段 `visible: false` 时卸载，不留占位。

## 根级 Slot

根 `ConfigForm` 使用 Element Form 的默认内容插槽，渲染在字段列表之后，并暴露当前 `model`：

```vue
<TaskConfigForm v-model="model" :items="items">
  <template #default>
    <div class="actions">
      <el-button type="primary" @click="submit">提交</el-button>
    </div>
  </template>
</TaskConfigForm>
```

## 字段级 Slot

每个字段可以覆盖三个部位的渲染，名字都指向根组件上的具名 Slot：

| 配置 | 覆盖内容 | 作用域 |
| --- | --- | --- |
| `labelSlot` | `el-form-item` 的 label | 字段上下文 + `propPath` |
| `errorSlot` | 校验错误信息 | 字段上下文 + `propPath` + `error`（Element 校验消息） |
| `component.slot`（type: 'slot'） | 整个字段内容 | 字段上下文 + `propPath` + `component` |
| `leftSlot` / `rightSlot` | 主字段内容两侧 | 字段上下文 + `propPath` |

```ts
{
  key: 'score',
  fieldKey: 'score',
  type: 'rate',
  labelSlot: 'scoreLabel',
  errorSlot: 'scoreError',
  formItemProps: { label: '综合评分', rules: [{ required: true, message: '尚未评分' }] }
}
```

```vue
<TaskConfigForm v-model="model" :items="items">
  <template #scoreLabel="{ propPath }">
    <span>综合评分（{{ propPath }}）</span>
  </template>
  <template #scoreError="{ error }">
    <span class="score-error">★ {{ error }}，请先评分再提交</span>
  </template>
</TaskConfigForm>
```

使用约定：

- `labelSlot`、`errorSlot` 只改变展示，不影响校验行为；`rules` 仍按 `formItemProps` 生效。
- `leftSlot` / `rightSlot` 与主字段同行，适合单位、操作按钮和辅助链接；程序化聚焦仍以主字段为目标。
- `type: 'slot'` 字段没有实际字段组件，键盘导航与自动 Hint 对其内容的覆盖能力有限（内容提供标准可聚焦元素即可参与导航），详见[键盘导航](/features/keyboard-navigation)与 [Hint 说明](/features/hint-tooltip)。

## 与内置布局能力的关系

ConfigForm 不封装弹窗、分组标题、分步等高层布局，需要时用 `type: 'slot'` 或根级 Slot 组合 Element UI 组件实现；24 栅格本身足以表达常见的多列与通栏布局。

## 示例

[JSON Schema 驱动](/examples/schema-driven)演示了 `labelSlot` 与 `errorSlot` 的完整用法。
