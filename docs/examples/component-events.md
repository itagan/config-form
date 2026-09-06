# 字段组件事件与原生事件

<PlaygroundLink route="/component-events" />

字段配置可以监听组件 `$emit`，也可以监听组件根节点的 DOM 事件。两者首参都是字段上下文，可直接读写 model：`listeners` 对应组件主动发出的业务事件，`nativeListeners` 对应组件没有 `$emit` 的点击、键盘等根节点 DOM 事件。

## 只读字段的点击详情

只读 `el-input` 不会发出 click 业务事件，用 `nativeListeners` 监听其根节点 DOM 直接打开详情：

```ts
{
  fieldKey: 'contractNo',
  type: 'input',
  formItemProps: { label: '合同编号' },
  component: {
    props: { readonly: true, placeholder: '点击查看详情' },
    nativeListeners: {
      click(context, event) {
        event.stopPropagation()
        openDetail(context.fieldKey, String(context.value))
      }
    }
  }
}
```

`type: 'text'` 渲染原生 `span`，同样配置 `nativeListeners` 即可点击；ConfigForm 会在内部把它适配为普通 DOM listener。

## 组件事件与原生事件组合

同一字段的 `listeners` 与 `nativeListeners` 相互独立、不去重。示例中审批意见字段同时使用两类监听：`keydown` 来自根节点 DOM（内部 input 冒泡），`clear` 来自组件 `$emit`：

```ts
component: {
  props: { clearable: true },
  nativeListeners: {
    keydown(context, event) {
      if (event.key !== 'Enter') return
      appendLog('根节点 keydown.enter（内部 input 冒泡）')
    }
  },
  listeners: {
    clear(context) {
      appendLog('$emit clear → 记录一次清空操作')
    }
  }
}
```

组件已主动 `$emit` 的事件（如 `el-input` 的 `blur`）应使用 `listeners`，示例中负责人字段在 blur 回调里直接 `setValue` 去除首尾空格。

## 边界

- 事件名按 `GlobalEventHandlersEventMap` 推导事件对象类型；`.stop/.prevent` 等模板修饰符不在此解析，直接操作事件对象。
- `focus`、`blur` 等非冒泡事件若发生在组件内部节点，根节点监听器通常收不到；`el-input` 的 `focus/blur` 应使用 `listeners`。
- `type: 'slot'` 不接受 `nativeListeners`，Slot 模板内用 `@click.native` 自行监听。

完整的事件分层选择、带点事件兼容与限制说明见[字段组件事件](/features/component-events)。
