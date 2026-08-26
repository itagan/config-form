# 受控数据流

ConfigForm 不维护第二份长期表单状态：

```text
用户输入 → 字段 model 协议 → 路径或 binding 更新
        → emit update:model → 父组件回写 model
        → emit field-change
```

路径写入只浅拷贝被修改链路，其他引用保持不变。为处理父组件下一轮渲染前的连续更新，组件只在当前微任务保存最近一次发出的 model；微任务结束后重新以受控 prop 为准。

`resetFields` 发出初始 model 的副本并清除校验，不允许 Element Form 直接修改传入对象。
