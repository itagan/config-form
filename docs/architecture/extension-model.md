# 扩展模型

ConfigForm 的字段渲染有四个扩展层次，从固定到开放：

```text
内置 type（15 种 Element UI 映射）
  → 业务字段类型注册（fieldTypes，实例级）
    → type: 'component'（一次性组件目标）
      → type: 'slot'（完全交由模板）
```

选择原则：能用内置 type 就不注册；组件协议稳定且多处复用才注册 type；单点临时需求用 `type: 'component'`；展示形态完全由模板决定时用 `type: 'slot'`。

## 内置类型层

15 个内置 type 直接映射 Element UI 组件：`input`、`select`、`date`、`time`、`time-select`、`number`、`switch`、`radio`、`checkbox`、`text`、`rate`、`slider`、`color`、`cascader`、`autocomplete`。选项型字段（select/radio/checkbox）由 ConfigForm 生成子节点并支持 `options/optionProps` 映射；其余组件的专属配置（如 cascader 的 `props.options`）通过 `component.props` 原生透传。

内置 type 是保留名，业务注册表不可覆盖；`component` 与 `slot` 同为保留名。覆盖保留名在开发环境会触发诊断警告。

## 注册层：fieldTypes

`defineConfigFormType` / `defineConfigFormTypes` 生成实例级注册表，通过 `fieldTypes` Prop 传入，不污染全局：

```ts
const money = defineConfigFormType()<{ currency: string }>({
  is: MoneyInput,
  props: { currency: 'CNY' },
  model: { prop: 'value', event: 'input' }
})

const fieldTypes = defineConfigFormTypes()({ money })
```

注册定义只包含三部分：

| 成员 | 职责 |
| --- | --- |
| `is` | 必填；组件对象或全局注册名 |
| `props` | 注册级默认 Props（静态或动态函数），与字段级浅合并 |
| `model` | 受控协议；省略时使用原生 Vue 2 v-model，`false` 关闭自动写回 |

### 类型收窄

`defineConfigFormType` 的返回类型携带品牌协议（仅存在于类型系统）。把注册表传入 `createConfigForm<TModel>()` 或 `defineFormItems<TModel, TFieldTypes>` 后：

- `type: 'money'` 成为合法的联合分支，其 `component.props` 按注册的 Props 协议收窄。
- 未注册的 type 名在类型检查阶段直接报错，而不是等到运行时警告。
- 显式声明事件元组（如 `input: [number]`）后，`listeners` 的回调参数同样收窄。

## 组件目标层与模板层

`type: 'component'` 与 `type: 'slot'` 服务于注册层覆盖不到的场景，行为细节见[自定义组件接入](/features/custom-components)。与注册层的关系：

- 一次性组件不走注册表，诊断只校验"提供了 is 或 resolveComponent"。
- `resolveComponent` 让组件目标成为运行时决定，是 JSON Schema 下发场景中"数据描述 + 客户端绑定"的官方入口。
- `type: 'slot'` 的字段没有字段组件，ConfigForm 对它的唯一介入是布局、校验 prop 与上下文透出。

## 设计边界

- 扩展只发生在**字段渲染层**。受控写回、校验、诊断、Hint、导航对四种扩展方式一视同仁——自定义组件只要遵守 model 协议就自动获得受控更新、`field-change`、`focusField` 等能力。
- 注册表是实例级的：同一页面可以挂载两份不同 `fieldTypes` 的 ConfigForm，互不影响。
- ConfigForm 不提供全局字段类型注册 API，避免隐式耦合；跨页面复用通过导出注册表常量实现。
