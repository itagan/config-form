# JSON Schema 驱动

<PlaygroundLink route="/schema" />

这个示例模拟"配置由服务端下发"的场景：`items` 来自可序列化 JSON 字符串，客户端在运行时解析并绑定组件实现。这也是校验 `type: 'component'`、`resolveComponent`、`labelSlot`、`errorSlot` 和多个未在其他示例出现的内置类型的综合用例。

## 数据描述与客户端绑定分离

远程 JSON 中不包含任何函数。自定义组件的目标通过 `meta.component` 声明，解析后在客户端注入 `resolveComponent`：

```ts
const raw = JSON.parse(remoteSchemaText)

const items = raw.map((item: any) => item.type === 'component'
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

```json
{
  "fieldKey": "budget",
  "type": "component",
  "meta": { "component": "money" },
  "component": {},
  "formItemProps": { "label": "项目预算" }
}
```

内置 type 不需要绑定，直接按类型名渲染。整个 Schema 因此保持纯数据——这正是把表单配置放进数据库、接口或低代码平台的前提。

## 切换 Schema

页面顶部在「满意度反馈」与「工作登记」两套 Schema 间切换。切换时整体替换 model 并清除上一套字段的校验残留：

```ts
watch(schemaName, name => {
  formModel.value = { ...schemaDefaults[name] }
  formRef.value?.clearValidate()
})
```

## 自定义 label 与错误渲染

评分字段演示两个 Slot：`labelSlot` 覆盖标签内容（作用域含 `propPath`），`errorSlot` 覆盖校验错误（作用域含 Element 的 `error` 消息）：

```ts
{
  key: 'score',
  fieldKey: 'score',
  type: 'rate',
  labelSlot: 'scoreLabel',
  errorSlot: 'scoreError',
  formItemProps: { label: '综合评分', rules: [{ required: true, message: '尚未评分', trigger: 'change' }] }
}
```

```vue
<template #scoreLabel="{ propPath }">
  <span>综合评分（{{ propPath }}）</span>
</template>
<template #scoreError="{ error }">
  <span class="score-error">★ {{ error }}，请先评分再提交</span>
</template>
```

评分默认值是 `null` 而不是 `0`——`0` 能通过 required 校验，想让"未评分"报错应使用 `null`/空串。

## 覆盖的内置类型

工作登记 Schema 覆盖了其他示例未涉及的类型：`time-select`（开始时间）、`time`（结束时间，`valueFormat` 格式化）、`slider`（投入度）、`cascader`（归类，选项走 `component.props.options`）、`color`（标记颜色），以及反馈表中的 `rate`。

## 适用边界

- 需要动态下发表单配置、或配置由非前端人员维护时用这种模式；纯前端写死的表单直接用 `defineFormItems` 更有类型保障。
- JSON 描述 + 客户端绑定是刻意分层：函数与组件引用不可序列化，注册表留在客户端才能保住类型收窄与诊断能力。
