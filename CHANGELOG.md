# 更新日志

本项目的所有重要变更将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## Unreleased

### Added

- 新增 `ConfigFormFieldBindingContext`、Slot 上下文、`ConfigFormEmits` 和泛型 `ConfigFormExpose` 公共类型。
- 新增文档一致性检查、PR/push 发布级 CI、发布元数据检查与防误发布检查。

### Changed

- 根组件拆分为字段项、字段内容和展示计算模块。
- API 与 FormTable 对齐：`defineConfigFormItems` 命名、严格字段类型注册、字段级 `hintTrigger`、最小 `field-change` 载荷和 `Expose` 实例类型。
- 移除字段级 disabled/readonly 策略、左右装饰 Slot、cloneModel、根 prepend/append Slot 和 Ref model 读写方法；交互状态改为 Element Props 透传，操作区改用默认 Slot。

## 0.3.0 - 2026-08-30

### Added

- `FormItemConfig` 重构为按 `type` 区分的判别联合；配置 helper / `createConfigForm` 接受字段类型注册表泛型，自定义 type 字段项的 `component.props/listeners/model` 按注册协议收窄，未注册的 type 名在类型上直接报错。
- 配置诊断新增注册表 model 成员校验、unknown type 可用注册名提示与自定义类型 item 级渲染键检查。

### Changed

- `type: 'component'` 在类型上必须提供 `component.is` 或 `component.resolveComponent`；`type: 'slot'` 必须提供 `component.slot`；内置 type 的 `component` 配置不可再指定渲染目标。运行时校验行为不变。

## 0.2.0 - 2026-08-30

### Added

- Ref 新增 `focusField(fieldKey)` 与 `scrollToFirstError()`，用于程序化聚焦和提交失败后滚动定位；`validateField()` 返回 `Promise<boolean>`，未挂载或未知字段直接视为校验失败。
- 新增 `navigationOptions` prop：启用后 Enter / Shift+Enter 在已挂载字段间导航，自动跳过隐藏、禁用、只读字段，textarea 与输入法组合状态不接管。
- Tooltip 提示模式重构为表单级单例 + 事件委托：实例数从 O(字段数) 降为 O(1)，自动维护 `aria-describedby`，支持 Escape 临时关闭与指针/焦点仲裁。
- 新增字段 `hintTrigger`（`item` | `content`），控制 Tooltip 触发范围是整个 FormItem 还是字段内容根节点。
- 字段类型协议支持事件元组：`defineConfigFormType` 显式声明事件表后，`model.event` 与 `valueFromEvent` 参数类型联动，协议保留按事件名收窄的 `FieldTypeListeners`。
- Playground 新增「校验聚焦与键盘导航」「提示与 Tooltip 单例」演示页。

### Changed

- `hintOptions.mode: 'tooltip'` 时 FormItem 上透传的原生 `title` 会被自动 Hint 取代，避免双重提示。
