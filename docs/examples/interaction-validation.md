# 校验聚焦与键盘导航

<PlaygroundLink route="/interaction" />

长表单的两个效率问题：连续录入时频繁伸手摸鼠标，提交失败后找不到哪个字段报错。这个示例演示 Enter 键导航与程序化聚焦的完整组合。

## Enter 字段导航

传入 `navigationOptions` 启用（省略整个 Prop 时不接管键盘）：

```vue
<TaskConfigForm
  ref="formRef"
  v-model="model"
  :items="items"
  :navigation-options="{ enabled: true }"
/>
```

- Enter 前进、Shift+Enter 后退，到达首尾后停止，不循环。
- 导航顺序来自实际 DOM，自动跳过隐藏、禁用、只读或无可聚焦内容的字段。
- textarea 中 Enter 仍会换行（示例里的备注字段），输入法组合期间不接管。

## 提交失败后的错误定位

```ts
async function submit() {
  const valid = await formRef.value.validate()
  if (!valid) {
    await formRef.value.scrollToFirstError()
    Message.warning('请检查第一个报错字段')
    return
  }
  Message.success('校验通过')
}
```

`scrollToFirstError()` 滚动到第一个报错字段（居中）并尝试聚焦；清空姓名或手机号后点「校验并提交」即可看到效果。没有任何报错字段时返回 `false`，不产生滚动。

## 程序化跳转

「跳转到备注」按钮演示 `focusField`，适合从外部（如校验提示、审批意见）把用户带到指定字段：

```ts
await formRef.value.focusField('remark')
```

## 要点

- 三者共用同一套挂载字段查询与聚焦规则，行为一致：用户用 Enter 连续录入，程序用 `focusField` 精确跳转，失败兜底交给 `scrollToFirstError`。
- 键盘导航的全部规则（组合键、textarea、自定义组件参与导航的条件）见[键盘导航](/features/keyboard-navigation)。
