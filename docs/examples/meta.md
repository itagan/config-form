# 业务元数据 meta

<PlaygroundLink route="/meta" />

`meta` 是字段配置上的业务元数据挂载点：ConfigForm 不读取、不校验，只随 `context.itemConfig` 原样透出。示例演示四种典型用法——货币复用、字典描述、权限显隐和埋点上报。

## 同一组件复用多种业务形态

组件只声明普通 Props，不感知 meta；`component.props` 函数读取 `itemConfig.meta` 转成组件属性。同一个 `MoneyInput` 借 `meta.currency` 复用出人民币与美元两个字段：

```ts
component: {
  is: MoneyInput,
  props: context => ({ currency: readMeta(context.itemConfig).currency ?? 'CNY' })
},
meta: { currency: 'USD' }
```

`readMeta` 是业务侧的收敛函数，把 `itemConfig.meta`（`Record<string, unknown>`）转换为自己的 meta 类型：

```ts
interface FieldMeta { currency?: string, dictKey?: string, permissionCode?: string, trackId?: string }

const readMeta = (itemConfig: { meta?: Record<string, unknown> }): FieldMeta =>
  (itemConfig.meta ?? {}) as FieldMeta
```

## 字典 key 与埋点标识

meta 描述"用哪个字典"而不是携带字典数据，选项仍由页面加载后传入；`listeners` 回调读取 `meta.trackId` 决定是否上报：

```ts
component: {
  options: context => dictionaries[readMeta(context.itemConfig).dictKey ?? ''] ?? [],
  listeners: {
    change(context, value) {
      const { trackId } = readMeta(context.itemConfig)
      if (trackId) report(trackId, context.fieldKey, value)
    }
  }
},
meta: { dictKey: 'expense_category', trackId: 'expense_type_change' }
```

## 权限码驱动显隐

`visible` 与组件解析拿到同一份渲染上下文，`meta.permissionCode` 可以直接驱动字段显隐：

```ts
visible: context => hasPermission(readMeta(context.itemConfig).permissionCode),
meta: { permissionCode: 'finance:invoice:view' }
```

## 边界

- ConfigForm 不读取、不校验 meta：字段渲染行为不因 meta 缺失而变化，业务语义完全由使用方负责。
- meta 与 items 其余配置同源响应式，动态回调会在 meta 更新后重新计算。
- 远程 JSON Schema 场景中 meta 只应包含纯数据，组件目标与函数留在客户端注入。

完整的契约与类型说明见[业务元数据 meta](/features/meta)。
