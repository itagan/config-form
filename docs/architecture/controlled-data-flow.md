# 受控数据流

ConfigForm 不维护第二份长期表单状态：

```text
用户输入 → 字段 model 协议 → 路径或 binding 更新
        → emit update:model → 父组件回写 model
        → emit field-change
```

路径写入只浅拷贝被修改链路，其他引用保持不变。为处理父组件下一轮渲染前的连续更新，组件只在当前微任务保存最近一次发出的 model；微任务结束后重新以受控 prop 为准。

因此父组件应在 `update:model` 中同步采用 `$event`（`v-model` / `.sync` 已满足）。如果业务需要异步确认、服务端合并或跨任务队列，应在父层保存草稿并把确认后的 model 重新传入；ConfigForm 不会让内部快照越过微任务继续覆盖外部状态。

`resetFields` 发出初始 model 的副本并清除校验，不允许 Element Form 直接修改传入对象。默认快照器支持 Date、RegExp、Map、Set、数组、对象原型和循环引用；带有不可枚举内部状态的复杂模型可通过 `cloneModel` Prop 提供业务克隆函数。
