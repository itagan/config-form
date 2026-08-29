import type { Component, DefineComponent } from 'vue'

/** 表单数据中的任意值；运行时不做结构约束，结构由业务模型定义。 */
export type ConfigFormValue = any
/** 受控表单数据；key 支持点路径与数组下标寻址嵌套结构。 */
export type FormModel = Record<string, ConfigFormValue>
/** 透传给底层组件的属性表。 */
export type ComponentProps = Record<string, ConfigFormValue>
/** 配置值：静态值或按当前上下文同步计算的函数；动态函数应保持同步、无副作用。 */
export type DynamicValue<T, TContext> = T | ((context: TContext) => T)
/** 自动 Hint 的归一化值；`false` 显式关闭，`null`/`undefined` 视为无提示。 */
export type ConfigFormHintValue = string | false | null | undefined
/** Hint 展示方式：原生 title、单例 Tooltip 或关闭。 */
export type ConfigFormHintMode = false | 'title' | 'tooltip'
/** Tooltip 触发区域：整个 FormItem 或仅字段内容根节点。 */
export type ConfigFormHintTrigger = 'item' | 'content'
/** 自定义字段类型可选的事件名到原始参数元组协议。 */
export type FieldTypeEventMap = Record<string, unknown[]>

/** select、radio、checkbox 等选项型组件的单个选项。 */
export interface FormItemOption {
  /** 默认展示文本；可通过 optionProps.label 映射其他字段。 */
  label?: ConfigFormValue
  /** 默认受控值；可通过 optionProps.value 映射其他字段。 */
  value?: ConfigFormValue
  /** 是否禁用当前选项；可通过 optionProps.disabled 映射其他字段。 */
  disabled?: boolean
  [key: string]: ConfigFormValue
}

/** 将业务选项对象字段映射到 label、value、disabled 和 key。 */
export interface OptionPropsConfig {
  /** 业务选项对象中作为展示文本的字段名。 */
  label?: string
  /** 业务选项对象中作为受控值的字段名。 */
  value?: string
  /** 业务选项对象中作为禁用状态的字段名。 */
  disabled?: string
  /** 业务选项对象中作为渲染 key 的字段名。 */
  key?: string
}

/** 在业务 model 路径与组件受控值路径之间建立映射的单条条目。 */
export interface FieldBindingMapEntry {
  /** 业务 model 中需要读取和写回的字段路径。 */
  fieldPath: string
  /** 组件值中与 fieldPath 对应的字段路径。 */
  valuePath: string
  /** 组件回传值缺少 valuePath 时写入 fieldPath 的兜底值。 */
  fallbackValue?: ConfigFormValue
}

/** 在行字段路径与组件受控值路径之间建立可序列化的双向映射。 */
export interface FieldBindingConfig {
  /** 字段路径与组件值路径的一对一映射；路径之间不可重复或重叠。 */
  map: FieldBindingMapEntry[]
}

/** 动态配置可读取的基础上下文。 */
export interface ConfigFormRenderContext<TModel extends FormModel = FormModel> {
  /** 当前受控 model 的只读视图。 */
  model: Readonly<TModel>
}

/** 字段渲染期间暴露给动态配置和组件 Props 的上下文。 */
export interface ConfigFormFieldRenderContext<TModel extends FormModel = FormModel>
  extends ConfigFormRenderContext<TModel> {
  /** 当前字段的 model 寻址路径。 */
  fieldKey: string
  /** 当前字段的 model 值。 */
  value: ConfigFormValue
  /** 当前字段的完整配置。 */
  itemConfig: Readonly<FormItemConfig<TModel>>
}

/** 字段完整上下文：在渲染上下文上提供写回能力，供 Slot、监听器和动态配置使用。 */
export interface ConfigFormFieldContext<TModel extends FormModel = FormModel>
  extends ConfigFormFieldRenderContext<TModel> {
  /** 按当前字段寻址写入新值。 */
  setValue: (value: ConfigFormValue) => void
  /** 复合映射后的组件受控值；未配置 binding 时与 value 一致。 */
  bindingValue: ConfigFormValue
  /** 按复合映射写回组件值。 */
  setBindingValue: (value: ConfigFormValue) => void
  /** 在一次受控事务中更新多个 model 路径。 */
  updateModel: (patch: Partial<TModel> & Record<string, ConfigFormValue>) => void
}

/** 字段组件事件监听器签名，第一个参数固定为字段上下文。 */
export type ConfigFormFieldListener<TModel extends FormModel = FormModel> = (
  context: ConfigFormFieldContext<TModel>,
  ...args: unknown[]
) => void

/** 双变签名：允许回调参数按注册协议逆变检查。 */
type ConfigFormFieldValueFromEvent<TModel extends FormModel, TArgs extends unknown[]> = {
  bivarianceHack(
    context: ConfigFormFieldRenderContext<TModel>,
    ...args: TArgs
  ): ConfigFormValue
}['bivarianceHack']

interface BaseFieldModelConfig<TModel extends FormModel> {
  /** 覆盖组件受控 prop 名称，默认使用组件原生 Vue 2 v-model。 */
  prop?: string
  /** 将行字段或 binding.map 组合值同步转换为组件 model prop。 */
  valueToProp?: (
    context: ConfigFormFieldRenderContext<TModel>,
    bindingValue: ConfigFormValue
  ) => ConfigFormValue
}

type FieldModelForEvent<
  TModel extends FormModel,
  TEvents extends Record<keyof TEvents, unknown[]>,
  TEvent extends Extract<keyof TEvents, string>
> = BaseFieldModelConfig<TModel> & {
  event: TEvent
  /** 从只读字段上下文和当前 model 事件参数同步生成新的绑定值。 */
  valueFromEvent?: ConfigFormFieldValueFromEvent<TModel, TEvents[TEvent]>
}

/**
 * 自定义字段组件的受控值协议；未配置时使用组件原生 Vue 2 v-model。
 * 显式传入事件表时，event 与 valueFromEvent 参数元组保持关联。
 */
export type FieldModelConfig<
  TModel extends FormModel = FormModel,
  TEvents extends Record<keyof TEvents, unknown[]> = FieldTypeEventMap
> = string extends keyof TEvents
  ? BaseFieldModelConfig<TModel> & {
      event?: string
      valueFromEvent?: ConfigFormFieldValueFromEvent<TModel, unknown[]>
    }
  : {
      [TEvent in Extract<keyof TEvents, string>]: FieldModelForEvent<TModel, TEvents, TEvent>
    }[Extract<keyof TEvents, string>]

/** 按注册协议的事件名收窄的字段组件监听器表。 */
export type FieldTypeListeners<
  TModel extends FormModel = FormModel,
  TEvents extends Record<keyof TEvents, unknown[]> = FieldTypeEventMap
> = {
  [TEvent in Extract<keyof TEvents, string>]?: (
    context: ConfigFormFieldContext<TModel>,
    ...args: TEvents[TEvent]
  ) => void
}

/** 字段项级组件配置；未指定 type 时按 `component` 渲染一次性组件。 */
export interface FieldComponentConfig<TModel extends FormModel = FormModel> {
  /** 静态 Vue 组件或已注册的字段类型名称。 */
  is?: string | Component
  /** 根据当前字段上下文同步选择组件；返回 undefined 时回退到 is。 */
  resolveComponent?: (
    context: ConfigFormFieldRenderContext<TModel>
  ) => string | Component | undefined
  /** 透传给实际字段组件的属性。 */
  props?: DynamicValue<ComponentProps, ConfigFormFieldRenderContext<TModel>>
  /** 字段组件事件监听器；回调首参固定为可更新的字段上下文。 */
  listeners?: Record<string, ConfigFormFieldListener<TModel>>
  /** select、radio、checkbox 等选项型组件的数据源。 */
  options?: DynamicValue<FormItemOption[], ConfigFormFieldRenderContext<TModel>>
  /** 将业务选项对象字段映射到 label、value、disabled 和 key。 */
  optionProps?: DynamicValue<OptionPropsConfig, ConfigFormFieldRenderContext<TModel>>
  /** 自定义受控值协议；undefined 使用组件原生 Vue 2 v-model，false 禁用写回。 */
  model?: FieldModelConfig<TModel> | false
  /** type: 'slot' 时在根 ConfigForm 上对应的具名 Slot。 */
  slot?: string
}

declare const FIELD_TYPE_PROTOCOL: unique symbol

/** 使用方注册的轻量字段类型，只描述稳定组件目标、model 和默认属性。 */
export interface FieldTypeDefinition<
  TModel extends FormModel = FormModel,
  TProps extends object = ComponentProps,
  TEvents extends Record<keyof TEvents, unknown[]> = FieldTypeEventMap
> {
  /** 必填，组件名称或组件对象。 */
  is: string | Component
  /** 注册级默认 Props；可使用字段渲染上下文。 */
  props?: DynamicValue<Partial<TProps>, ConfigFormFieldRenderContext<TModel>>
  /** 注册级 model 协议，或 false 关闭自动写回。 */
  model?: FieldModelConfig<TModel, TEvents> | false
}

/** defineConfigFormType 返回的协议化定义；品牌仅存在于类型系统，不产生运行时代码。 */
export type TypedFieldTypeDefinition<
  TModel extends FormModel = FormModel,
  TProps extends object = ComponentProps,
  TEvents extends Record<keyof TEvents, unknown[]> = FieldTypeEventMap
> = FieldTypeDefinition<TModel, TProps, TEvents> & {
  readonly [FIELD_TYPE_PROTOCOL]: {
    props: TProps
    events: TEvents
    listeners: FieldTypeListeners<TModel, TEvents>
  }
}

/** 自定义字段类型名称到组件协议的实例级注册表。 */
export type FieldTypeRegistry<TModel extends FormModel = FormModel> = Record<
  string,
  FieldTypeDefinition<TModel, any, any>
>

/** ConfigForm 内置的字段类型名称。 */
export type BuiltinFormItemType =
  | 'input' | 'select' | 'date' | 'time' | 'time-select'
  | 'number' | 'switch' | 'radio' | 'checkbox' | 'text' | 'rate'
  | 'slider' | 'color' | 'cascader' | 'autocomplete'

/** 字段类型名称：内置类型、保留类型，或实例注册表中声明的业务类型。 */
export type FormItemType = BuiltinFormItemType | 'component' | 'slot' | (string & Record<never, never>)
/** 不可被业务字段类型注册表覆盖的保留名称。 */
export type ReservedFormItemType = BuiltinFormItemType | 'component' | 'slot'

/** 单个表单字段的配置；fieldKey 支持点路径（`profile.name`）与数组下标（`rows.0.name`）。 */
export interface FormItemConfig<TModel extends FormModel = FormModel> {
  /** 列表渲染的稳定标识；动态增删字段时用于保持组件实例身份。 */
  key?: string
  /** 必填，当前字段的 model 寻址路径。 */
  fieldKey: string
  /** 内置类型、保留类型或已注册的业务字段类型。 */
  type: FormItemType
  /** 复合值映射；配置后字段按映射读取和写回组件值。 */
  binding?: FieldBindingConfig
  /** 业务自定义元数据；ConfigForm 不读取，仅随上下文透出。 */
  meta?: Record<string, unknown>
  /** 根 ConfigForm 上用于渲染标签内容的具名 Slot。 */
  labelSlot?: string
  /** 根 ConfigForm 上用于渲染错误信息的具名 Slot。 */
  errorSlot?: string
  /** 是否渲染当前字段；返回 false 时字段卸载且不参与校验。 */
  visible?: DynamicValue<boolean, ConfigFormFieldRenderContext<TModel>>
  /** 是否禁用当前字段；与根级 disabled 取并集。 */
  disabled?: DynamicValue<boolean, ConfigFormFieldRenderContext<TModel>>
  /** 是否只读当前字段；与根级 readonly 取并集。 */
  readonly?: DynamicValue<boolean, ConfigFormFieldRenderContext<TModel>>
  /** 字段自动提示内容；`false` 单独关闭，未声明时回退 hintOptions.field。 */
  hint?: DynamicValue<ConfigFormHintValue, ConfigFormFieldRenderContext<TModel>>
  /** 透传给当前字段 el-col 的属性；默认 `{ span: 24 }`。 */
  colProps?: DynamicValue<ComponentProps, ConfigFormFieldRenderContext<TModel>>
  /** 透传给当前字段 el-form-item 的属性（label、rules 等）。 */
  formItemProps?: DynamicValue<ComponentProps, ConfigFormFieldRenderContext<TModel>>
  /** 字段项级组件配置；type 为 'component'/'slot' 或覆盖内置类型行为时使用。 */
  component?: FieldComponentConfig<TModel>
}

/** 表单级自动提示策略；Tooltip 属性仅在对应模式下有效。 */
export interface ConfigFormHintOptions<TModel extends FormModel = FormModel> {
  /** Hint 展示方式；默认使用原生 title，false 关闭全部自动 Hint。 */
  mode?: ConfigFormHintMode
  /** Tooltip 模式下的触发区域：item 为整个 FormItem，content 仅限字段内容根节点。 */
  hintTrigger?: ConfigFormHintTrigger
  /** false/未配置关闭默认字段内容；true 默认字符串化；函数统一格式化。 */
  field?: boolean | ((context: ConfigFormFieldRenderContext<TModel>) => ConfigFormHintValue)
  /** tooltip 模式下透传给单例 el-tooltip 的属性，受管属性会被忽略。 */
  tooltipProps?: ComponentProps
}

/** Enter 键字段导航配置；省略整个 prop 时不接管键盘。 */
export interface ConfigFormNavigationOptions {
  /** 启用 Enter / Shift+Enter 字段导航；传入空对象同样启用。 */
  enabled?: boolean
}

/** field-change 事件的载荷。 */
export interface ConfigFormFieldChangePayload<TModel extends FormModel = FormModel> {
  /** 变化字段的 model 寻址路径。 */
  fieldKey: string
  /** 新值。 */
  value: ConfigFormValue
  /** 上一份值。 */
  previousValue: ConfigFormValue
  /** 触发事件时的下一份 model。 */
  model: TModel
  /** 关联的字段配置；未配置在 items 中的路径为 undefined。 */
  itemConfig: Readonly<FormItemConfig<TModel>>
}

/** ConfigForm 的完整公共 Props。 */
export interface ConfigFormProps<TModel extends FormModel = FormModel> {
  /** 受控表单数据，v-model 对应的数据源。 */
  model: TModel
  /** 字段配置数组，按数组顺序渲染。 */
  items?: FormItemConfig<TModel>[]
  /** 透传给 el-form；model 与 disabled 由 ConfigForm 管理。 */
  formProps?: ComponentProps & { model?: never }
  /** 透传给唯一的 el-row；默认 `{ gutter: 16 }`。 */
  rowProps?: ComponentProps
  /** 当前实例的业务字段类型注册表。 */
  fieldTypes?: FieldTypeRegistry<TModel>
  /** 全局提示策略。 */
  hintOptions?: ConfigFormHintOptions<TModel>
  /** Enter 键字段导航；省略时不接管键盘。 */
  navigationOptions?: ConfigFormNavigationOptions
  /** 禁用全部字段并下沉到字段组件。 */
  disabled?: boolean
  /** 全局只读；同时禁用 Element Form 交互。 */
  readonly?: boolean
}

/** ConfigForm 实例暴露的方法集合；通过模板 Ref 获取。 */
export interface ConfigFormRef {
  /** 校验全部字段；无论 Element UI resolve 或 reject 都返回 Promise<boolean>。 */
  validate: (callback?: (valid: boolean, fields?: ConfigFormValue) => void) => Promise<boolean>
  /** 校验一个或多个字段；未挂载或未知字段直接视为失败。 */
  validateField: (props: string | string[], callback?: (message: string) => void) => Promise<boolean>
  /** 恢复为组件创建时 model 的深拷贝，并清除校验状态。 */
  resetFields: () => void
  /** 清除全部或指定字段校验状态。 */
  clearValidate: (props?: string | string[]) => void
  /** 按点路径或数组路径读取本轮最新值。 */
  getFieldValue: (fieldKey: string) => ConfigFormValue
  /** 更新一个路径。 */
  setFieldValue: (fieldKey: string, value: ConfigFormValue) => void
  /** 在一次受控事务中更新多个路径；patch 的 key 可为路径。 */
  setFieldsValue: (patch: Record<string, ConfigFormValue>) => void
  /** 获取包含尚未被父组件回写更新的本轮最新 model。 */
  getModel: () => FormModel
  /** 获取底层 Element UI el-form 实例。 */
  getFormRef: () => unknown
  /** 聚焦已挂载字段的第一个可聚焦元素；字段隐藏或未知时返回 false。 */
  focusField: (fieldKey: string) => Promise<boolean>
  /** 滚动到第一个校验失败的字段（居中）并尝试聚焦；无报错字段时返回 false。 */
  scrollToFirstError: () => Promise<boolean>
}

/** ConfigForm 组件的类型视图；运行时与默认导出是同一组件实例。 */
export type ConfigFormComponent<TModel extends FormModel = FormModel> = DefineComponent<
  ConfigFormProps<TModel>,
  Record<string, never>,
  any
>

/** ConfigForm 内部解析完成后的字段组件配置；供渲染层消费，不作为调用方入口。 */
export interface ResolvedFieldComponent<TModel extends FormModel = FormModel> {
  /** 实际渲染的组件目标。 */
  is?: string | Component
  /** 已合并注册级默认值与字段项覆盖的最终属性。 */
  props: ComponentProps
  /** 已归一化的事件监听器表。 */
  listeners: Record<string, (...args: unknown[]) => void>
  /** 已解析的选项数据源。 */
  options: FormItemOption[]
  /** 已解析的选项字段映射。 */
  optionProps?: OptionPropsConfig
  /** 生效的受控值协议。 */
  model?: FieldModelConfig<TModel> | false
}
