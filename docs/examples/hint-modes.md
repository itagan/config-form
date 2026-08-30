# 提示与 Tooltip 单例

<PlaygroundLink route="/hints" />

这个示例是一个详情态表单（只读数据 + 逐字段说明），用于对比 `title` 与 `tooltip` 两种 Hint 模式的行为差异，可以实时切换观察。

## Hint 的三个来源

1. 字段配置 `hint`：字符串或动态函数，优先级最高；`hint: false` 单独关闭该字段（示例中的"联系人"）。
2. `hintOptions.field: true`：默认把非空字段值字符串化作为提示，适合详情态；传函数可统一格式化。
3. `hintOptions.mode: false`：全局关闭。

## 模式对比

```ts
const hintOptions = computed(() => ({
  mode: mode.value,
  hintTrigger: mode.value === 'tooltip' ? hintTrigger.value : undefined
}))
```

| 模式 | 行为 |
| --- | --- |
| `title` | 原生 title 属性，无 JS 开销；悬停有系统延迟 |
| `tooltip` | 整表单一个单例 Tooltip，事件委托驱动；悬停或键盘焦点进入立即出现，Escape 临时关闭 |
| `false` | 全部关闭 |

## 触发区域

`hintTrigger` 只在 tooltip 模式下生效，页面可实时切换对比：

- `item`（默认）：悬停整个 FormItem（含标签区域）触发。
- `content`：仅悬停字段内容根节点触发；Slot 渲染出多个根节点时回退为整个 FormItem 并在开发环境警告。

## 键盘可达性

tooltip 模式下用 Tab 进入字段：焦点触发提示，`aria-describedby` 自动写到实际获得焦点的输入控件上，失焦恢复原值——不破坏调用方已有的 aria 描述。这是详情态表单满足无障碍要求的关键细节。

## 要点

- 大量字段时单例模式把 Tooltip 实例数从 O(字段数) 降到 O(1)，字段增减不产生额外监听器。
- tooltip 模式自动 Hint 会取代 FormItem 上的原生 title，避免双重提示。
- 完整行为（`tooltipProps` 受管属性清单、性能说明）见 [Tooltip 提示单例](/features/hint-tooltip)。
