# Tooltip 提示单例与无障碍

`hintOptions.mode: 'tooltip'` 下，ConfigForm 不再为每个字段包一层 `el-tooltip`，而是整表挂载一个单例 Tooltip，通过根节点事件委托驱动：

```vue
<ConfigForm
  v-model="model"
  :items="items"
  :hint-options="{ mode: 'tooltip' }"
/>
```

## 行为

- 指针悬停或键盘焦点进入带 Hint 的字段时展示；指针与焦点同时存在时指针优先。
- `aria-describedby` 自动维护：焦点触发时写到实际获得焦点的输入控件上，失焦恢复原值，不破坏调用方已有的 aria 描述。
- Escape 临时关闭当前提示；切换目标后允许重新展示。
- 字段动态显隐、内容更新时定位自动刷新；同一微任务内的观察通知合并处理，根节点替换或卸载会取消待处理的旧刷新。失效的 DOM 引用会被自动清理。
- Tooltip 模式下自动 Hint 取代 FormItem 上的原生 `title`，避免双重提示。

## 触发区域

字段配置的 `hintTrigger` 控制悬停触发范围（仅 tooltip 模式）：

- `item`（默认）：悬停整个 FormItem（含 label）触发，Tooltip 定位在可见内容根节点上。
- `content`：仅悬停字段内容根节点触发。目标需要可见且实际宽高均大于 0；左右插槽布局中的主内容也遵循此规则。字段内容 Slot 没有有效目标或存在多个可见根节点时回退为整个 FormItem，并在开发环境给出警告。

默认 `item` 模式也会过滤零尺寸定位目标，无法确定唯一有效目标时定位到整个 FormItem。

`title` 模式不受 `hintTrigger` 影响，始终以原生 title 展示在内容包装节点上。

Hint 内容支持字符串与数字，数字（包括 `0`）自动转换为字符串展示；`false` 单独关闭当前字段。

## 性能

单例模式将 Tooltip 实例数从 O(字段数) 降为 O(1)；事件监听统一挂在表单根节点上，字段增减不产生额外的监听器。

## 透传与兼容边界

`hintOptions.tooltipProps` 可设置 placement、effect、openDelay、popperClass 等 Element Tooltip 属性。`content`、`reference`、`popper`、`manual`、`value`、`enterable` 由 ConfigForm 管理，传入这些属性不会覆盖内部协议；`enterable` 固定为 false，提示不承载可交互内容。

单例定位通过内部适配层调用 Element UI 2 的 `referenceElm`、`doDestroy`、`updatePopper` 等实例内部接口。这不是 Element 的公共 API 保证，升级依赖时需要运行 Tooltip 回归测试和最低版本兼容检查。仅在 tooltip 模式挂载单例及事件委托；默认 title 模式使用原生提示。

## 相关 API

[Hint、事件与 Ref](../api/events-and-ref.md)
