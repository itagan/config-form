# 排错指南

按症状定位。所有现象都假设使用的是最新构建的组件包与正确的 Vue 2.7 + Element UI 环境。

## 字段修改后页面没有更新

**症状**：输入了值，但依赖该值的界面（或 `model-preview`）不变。

排查顺序：

1. 确认用的是 `v-model`（等价于 `:model` + `@update:model`），而不是只传了 `:model`。
2. 受控组件约定是父组件持有 model：页面逻辑不可变替换 model；字段 Slot 或监听器使用 `updateModel` / `setValue`，不要直接修改传入对象。
3. 字段配置了 `binding` 时，写回目标是 `fieldPath` 而不是 `fieldKey`；检查映射的路径拼写。
4. `component.model` 被配置为 `false` 时自动写回是关闭的（设计行为）。

## 校验不触发或结果不符合预期

1. `rules` 应写在 `formItemProps` 中，不是 `component.props`。
2. `visible: false` 的字段已卸载，不参与 `validate`；需要"隐藏但校验"时改用 `disabled` 或 `readonly`。
3. `validateField` 传入未挂载或未配置的字段路径会直接失败，这是约定行为。
4. 校验消息渲染在 `el-form-item` 下方；想自定义展示用 `errorSlot`，不要试图从 `form-validate` 事件自行拼 UI 再渲染回表单内。

## resetFields 恢复到了"旧数据"

`resetFields()` 的基线是 **ConfigForm 创建时**的 model 快照。编辑页异步加载详情后再重置，恢复的是加载前的空表单。解决：详情就绪后再挂载组件，或用 `:key` 在数据就绪时重建组件建立新基线。

## 类型检查报错：items 不能赋值给 FormItemConfig

- 使用了具体业务 model 类型（如 `defineConfigFormItems<TaskModel>`）时，模板里的组件也要用对应的泛型实例：`createConfigForm<TaskModel>()` 返回的组件与 `FormItemConfig<TaskModel>[]` 匹配。
- 直接写 `type: 'money'` 这类未注册名报错时，要么通过 `fieldTypes` 注册（见[扩展模型](/architecture/extension-model)），要么改用 `type: 'component'` + `component.is`。
- `type: 'component'` 分支下 `options/optionProps` 被类型禁止：业务组件的选项走 `component.props`。

## Slot 没有渲染

1. `type: 'slot'` 字段需要 `component: { slot: '名字' }`，且根组件上存在同名 `<template #名字>`。
2. `labelSlot` / `errorSlot` 同理，注意名字写在字段配置上、模板写在根 ConfigForm 上。
3. 字段 `visible: false` 时整个字段（含 Slot）不渲染。

## Tooltip 提示不出现或行为异常

1. 该字段配置了 `hint: false`，或 `hintOptions.field` 返回了 `false/null`——这是显式关闭。
2. `mode: 'title'` 下没有 Tooltip，只有原生 title；确认 `mode: 'tooltip'`。
3. `hintTrigger: 'content'` 且 Slot 渲染出多个根节点时回退为整个 FormItem 触发（开发环境有警告）。
4. 生产构建没有诊断警告——只看开发环境控制台。

## 动态配置没有生效

1. 动态函数必须**同步**返回；在回调里发请求、写 model 都是不支持的。
2. `visible`/`disabled` 依赖的数据必须已经在 model 里；远程数据先写回 model 再渲染。
3. items 数组本身是 computed 时，确认依赖的响应式数据在同一个 computed 里被读取（见[动态字段](/features/dynamic-fields)示例）。

## 键盘导航不接管 Enter

`navigationOptions` 整个省略时 ConfigForm 不接管键盘。传 `{ enabled: true }` 或空对象启用。textarea、输入法组合期间、Ctrl/Cmd/Alt+Enter 保持原生行为，详见[键盘导航](/features/keyboard-navigation)。

## 其他

- 未见过的开发环境警告清单与含义见 [ConfigForm API 的诊断一节](/api/config-form#开发环境诊断)。
- 仍然无法解决时，用 [Playground](/examples/) 构造最小复现，附在 issue 里。
