# 更新日志

本项目的所有重要变更将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## Unreleased

### Added

- Ref 新增 `focusField(fieldKey)` 与 `scrollToFirstError()`，用于程序化聚焦和提交失败后滚动定位；`validateField()` 返回 `Promise<boolean>`，未挂载或未知字段直接视为校验失败。
- 新增 `navigationOptions` prop：启用后 Enter / Shift+Enter 在已挂载字段间导航，自动跳过隐藏、禁用、只读字段，textarea 与输入法组合状态不接管。
- Tooltip 提示模式重构为表单级单例 + 事件委托：实例数从 O(字段数) 降为 O(1)，自动维护 `aria-describedby`，支持 Escape 临时关闭与指针/焦点仲裁。
- 新增 `hintOptions.hintTrigger`（`item` | `content`），控制 Tooltip 触发范围是整个 FormItem 还是字段内容根节点。
- 字段类型协议支持事件元组：`defineConfigFormType` 显式声明事件表后，`model.event` 与 `valueFromEvent` 参数类型联动，协议保留按事件名收窄的 `FieldTypeListeners`。
- Playground 新增「校验聚焦与键盘导航」「提示与 Tooltip 单例」演示页。

### Changed

- `hintOptions.mode: 'tooltip'` 时 FormItem 上透传的原生 `title` 会被自动 Hint 取代，避免双重提示。
