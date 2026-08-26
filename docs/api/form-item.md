# FormItem API

| 属性 | 说明 |
| --- | --- |
| `key` | 可选稳定渲染身份；同一路径渲染多次时必须显式区分 |
| `fieldKey` | model 字段路径，支持点路径和数组下标 |
| `type` | 内置、component、slot 或注册的业务 type |
| `visible` | 静态值或动态显隐函数 |
| `disabled` / `readonly` | 字段交互状态 |
| `colProps` | 透传给 `el-col`，默认 span 为 24 |
| `formItemProps` | 透传给 `el-form-item`，prop 由 fieldKey 管理 |
| `component` | 字段组件、Props、监听器、选项和 model 协议 |
| `binding` | 多个 model 路径与复合组件值的映射 |
| `hint` | 字段提示内容或关闭标记 |
| `labelSlot` / `errorSlot` | 自定义标签与错误插槽名 |

动态上下文包含只读 model、fieldKey、当前 value 和 itemConfig。字段监听器与 Slot 额外获得 setValue、setBindingValue 和 updateModel。
