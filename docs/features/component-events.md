# 字段组件事件与原生事件

字段配置可以监听组件 `$emit`，也可以监听组件根节点的 DOM 事件。两者使用相同的字段上下文，但事件来源和适用场景不同。

## 快速选择

| 需求 | 配置入口 | 事件参数 |
| --- | --- | --- |
| 字段值按组件 model 协议自动写回 | `component.model` | model 事件原始参数 |
| 监听组件主动 `$emit` 的业务事件 | `component.listeners` | `ConfigFormFieldContext, ...组件参数` |
| 监听组件未 `$emit` 的点击、键盘或鼠标事件 | `component.nativeListeners` | `ConfigFormFieldContext, DOM Event` |
| 监听字段 Slot 内自行创建的节点 | Slot 模板中的 `@事件` / `@事件.native` | Vue 模板原始事件参数 |
| 监听 ConfigForm 根事件 | `<ConfigForm @事件="handler">` | 对应公开事件参数 |

`listeners` 和 `nativeListeners` 都不是 `update:model`、`field-change` 等 ConfigForm 根事件。根事件及实例方法见[事件与实例 API](../api/events-and-ref.md)。

## 配置名与 Vue `.native`

配置对象不会解析 Vue 模板事件语法：

```ts
component: {
  listeners: {
    click: handleComponentClick
  },
  nativeListeners: {
    click: handleRootClick
  }
}
```

- `listeners.click` 对应模板中的 `@click`，只监听组件 `$emit('click')`。
- `listeners` 不支持用 `click.native` 监听根节点；这样写只会监听名为 `click.native` 的组件事件。
- `nativeListeners.click` 已经对应模板中的 `@click.native`，事件名不再附加 `.native`。
- `nativeListeners['click.native']` 不会响应普通 `click` DOM 事件。

如果已有组件确实执行 `$emit('click.native', payload)`，`listeners` 可以按完整字符串精确监听：

```ts
component: {
  listeners: {
    'click.native'(context, payload) {
      handleLegacyEvent(context.model, payload)
    }
  },
  nativeListeners: {
    click(context, event) {
      handleRootClick(context.model, event)
    }
  }
}
```

上面两个 `click` 来源彼此独立：前者只响应字面名称为 `click.native` 的 `$emit`，后者只响应根节点 DOM `click`。注册自定义 Type 时，也可以在事件表中用引号声明 `'click.native': [payload: Payload]` 并获得参数类型。

兼容已有带点事件没有运行时问题，但新组件不建议使用 `.native/.stop/.prevent/.once/.capture/.passive` 等类似 Vue 修饰符的事件名。普通 Vue 模板可能把点号后的内容解释为修饰符；新事件优先使用 `user-confirm`、`detail-open` 或 `update:value` 等无歧义名称。

## 组件事件

组件通过 `$emit('confirm', user, meta)` 发出业务事件时，在 `listeners` 中使用相同事件名。ConfigForm 会在原始参数前注入当前字段上下文：

```ts
component: {
  is: UserSelector,
  listeners: {
    confirm({ model, setValue, updateModel }, user, meta) {
      setValue(user.id)
      updateModel({ ownerName: user.name })
      console.log(model, meta.source)
    }
  }
}
```

业务事件适合表达“确认选择”“搜索”“打开面板”等组件协议。组件可控时，优先让组件发出有业务语义的事件；页面不需要依赖组件内部 DOM 结构。

## 根节点原生事件

组件没有发出所需事件时，通过 `nativeListeners` 监听其根 DOM。典型场景是只读 `el-input` 点击查看详情：

```ts
component: {
  props: {
    readonly: true,
    placeholder: '点击查看详情'
  },
  nativeListeners: {
    click(context, event) {
      event.stopPropagation()
      openDetail(context.model)
    }
  }
}
```

这与用 `focus` 模拟点击不同：点击行为不会被错误表达为输入焦点变化，键盘聚焦和业务打开动作可以分别处理。

事件参数按标准 DOM 事件名推导：

```ts
component: {
  nativeListeners: {
    click(_context, event) {
      event.clientX // MouseEvent
    },
    keydown(_context, event) {
      if (event.key === 'Enter') event.preventDefault() // KeyboardEvent
    }
  }
}
```

原生事件绑定在组件根节点。输入框前后缀、清除按钮或组件内部其他元素产生的冒泡事件也可能到达监听器；需要区分来源时检查 `event.target` 或封装业务组件。

## 原生事件限制

- TypeScript 接受 `GlobalEventHandlersEventMap` 中的标准 DOM 事件名，并按名称推导事件对象；实际可用性仍取决于浏览器。
- 监听目标是字段组件根节点，不会直接绑定组件内部的 `input`、按钮或其他子节点。
- `click`、`keydown` 等可冒泡事件能够从内部节点到达根节点。`focus`、`blur` 等非冒泡事件若发生在内部节点，根节点监听器通常收不到。
- `el-input` 已主动 `$emit` `focus/blur`，应使用 `listeners.focus/blur`；确实需要 DOM 冒泡语义时可评估 `nativeListeners.focusin/focusout`。
- `nativeListeners` 不提供 `.stop/.prevent/.self/.once/.capture/.passive` 或按键修饰符，常用判断和阻止行为直接操作事件对象。
- 字段 Slot 不接受 `nativeListeners`；复杂内部节点监听、捕获、被动监听或单次监听应放在 Slot 模板或业务组件中。
- 未在 `GlobalEventHandlersEventMap` 中的事件名会被 TypeScript 拒绝，运行时也不会绑定。

## 与 model 的关系

三条事件链职责独立：

```text
model event        → 提取新值并触发受控字段写回
listeners          → 响应组件 $emit
nativeListeners    → 响应组件根节点 DOM
```

- 自定义 model 的同名 `listeners` 会在自动写回后执行，保留组件原始事件参数。
- `nativeListeners` 不参与 model 合并，也不会自动调用 `setValue`。
- 组件响应一次 DOM 点击并 `$emit` 同名事件时，`listeners` 与 `nativeListeners` 都会执行；ConfigForm 不去重。
- 事件上下文中的 `value` 是事件触发时的当前字段值。更新数据应使用 `setValue`、`setBindingValue` 或 `updateModel`，不要直接修改 `model`。

需要一次原子写回多个字段时使用 `binding.map` 或在关闭自动 model 后调用一次 `setBindingValue`，详见[复合字段映射](./composite-binding.md)。

## `text` 与 Slot

`type: 'text'` 实际渲染原生 `span`。为保持统一配置，`nativeListeners` 仍然可用，ConfigForm 会在内部将其转换为普通 DOM listener：

```ts
component: {
  props: { class: 'clickable-summary' },
  nativeListeners: {
    click(context) {
      openDetail(context.model)
    }
  }
}
```

`text` 历史上也支持通过 `listeners` 监听 DOM。若同一事件在两处都配置，先执行 `listeners`，再执行 `nativeListeners`。

字段 Slot 的实际组件和根节点由页面创建，因此 Slot 配置不接受 `nativeListeners`。在模板中直接监听：

```vue
<template #owner-field="{ model, component }">
  <UserSelector
    v-bind="component.props"
    v-on="component.listeners"
    @click.native="openDetail(model)"
  />
</template>
```

原生 HTML 节点使用普通 `@click`；只有 Vue 2 组件根节点事件使用 `@click.native`。

## 修饰行为

配置 API 不解析 `click.native.stop` 等模板语法，也不单独提供 `stop/prevent/self/once/capture/passive` 字段。`nativeListeners` 已经包含 `.native` 语义，事件键只写 `click`。直接使用事件对象表达行为：

```ts
nativeListeners: {
  click(context, event) {
    if (event.target !== event.currentTarget) return // self
    event.preventDefault()                           // prevent
    event.stopPropagation()                         // stop
    openDetail(context.model)
  }
}
```

需要 `once/capture/passive`、多个内部交互目标或依赖特定子节点的复杂监听时，优先封装业务组件或使用字段 Slot，使 DOM 约束保留在模板层。

## 相关 API

[Component 与 Binding](../api/component-and-binding.md) · [自定义组件接入](./custom-components.md) · [上下文与 Slot](../api/context-and-slots.md) · [事件与实例](../api/events-and-ref.md)

可运行的完整示例见[字段组件事件与原生事件](/examples/component-events)。
