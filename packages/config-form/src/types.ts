import type { Component, DefineComponent, VNode } from 'vue'
import type { ElForm } from 'element-ui/types/form'

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

/** 组件 Props 使用的只读字段绑定上下文。 */
export interface ConfigFormFieldBindingContext<TModel extends FormModel = FormModel>
  extends ConfigFormFieldRenderContext<TModel> {
  /** 复合映射后的组件受控值；未配置 binding 时与 value 一致。 */
  readonly bindingValue: ConfigFormValue
}

/** 字段完整上下文：在绑定上下文上提供写回能力，供 Slot 和监听器使用。 */
export interface ConfigFormFieldContext<TModel extends FormModel = FormModel>
  extends ConfigFormFieldBindingContext<TModel> {
  /** 按当前字段寻址写入新值。 */
  setValue: (value: ConfigFormValue) => void
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

/** 根据当前字段上下文同步选择实际渲染组件。 */
export type FieldComponentResolver<TModel extends FormModel = FormModel> = (
  context: ConfigFormFieldRenderContext<TModel>
) => string | Component | undefined

/** 字段项级组件配置；未指定 type 时按 `component` 渲染一次性组件。 */
export interface FieldComponentConfig<TModel extends FormModel = FormModel> {
  /** 静态 Vue 组件或已注册的字段类型名称。 */
  is?: string | Component
  /** 根据当前字段上下文同步选择组件；返回 undefined 时回退到 is。 */
  resolveComponent?: FieldComponentResolver<TModel>
  /** 透传给实际字段组件的属性。 */
  props?: DynamicValue<ComponentProps, ConfigFormFieldBindingContext<TModel>>
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
  props?: DynamicValue<Partial<TProps>, ConfigFormFieldBindingContext<TModel>>
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

/** 不可被业务字段类型注册表覆盖的保留名称。 */
export type ReservedFormItemType = BuiltinFormItemType | 'component' | 'slot'
/** 未使用注册表时可直接配置的字段类型名称。 */
export type FormItemType = ReservedFormItemType

/** 未声明自定义字段类型时使用的严格空注册表；此时 Custom 联合分支为 never。 */
export type EmptyFieldTypeRegistry = Record<never, never>

/** 已注册的自定义字段类型名称。 */
export type RegisteredFormItemType<TFieldTypes> = Extract<keyof TFieldTypes, string>

/** 所有字段配置共享的基础属性；各联合分支通过 type 区分。 */
export interface BaseFormItemConfig<TModel extends FormModel = FormModel> {
  /** 列表渲染的稳定标识；动态增删字段时用于保持组件实例身份。 */
  key?: string
  /** 必填，当前字段的 model 寻址路径。 */
  fieldKey: string
  /** 复合值映射；配置后字段按映射读取和写回组件值。 */
  binding?: FieldBindingConfig
  /** 业务自定义元数据；ConfigForm 不读取，仅随上下文透出。 */
  meta?: Record<string, unknown>
  /** 根 ConfigForm 上用于渲染标签内容的具名 Slot。 */
  labelSlot?: string
  /** 根 ConfigForm 上用于渲染错误信息的具名 Slot。 */
  errorSlot?: string
  /** 根 ConfigForm 上用于渲染字段内容左侧装饰的具名 Slot。 */
  leftSlot?: string
  /** 根 ConfigForm 上用于渲染字段内容右侧装饰的具名 Slot。 */
  rightSlot?: string
  /** 是否渲染当前字段；返回 false 时字段卸载且不参与校验。 */
  visible?: DynamicValue<boolean, ConfigFormFieldRenderContext<TModel>>
  /** 字段自动提示内容；`false` 单独关闭，未声明时回退 hintOptions.field。 */
  hint?: DynamicValue<ConfigFormHintValue, ConfigFormFieldRenderContext<TModel>>
  /** Tooltip 模式下的触发区域；默认整个 FormItem。 */
  hintTrigger?: ConfigFormHintTrigger
  /** 透传给当前字段 el-col 的属性；默认 `{ span: 24 }`。 */
  colProps?: DynamicValue<ComponentProps, ConfigFormFieldRenderContext<TModel>>
  /** 透传给当前字段 el-form-item 的属性（label、rules 等）。 */
  formItemProps?: DynamicValue<ConfigFormFormItemProps, ConfigFormFieldRenderContext<TModel>>
}

/** 使用内置字段类型渲染的配置。 */
export interface BuiltinFormItemConfig<TModel extends FormModel = FormModel>
  extends BaseFormItemConfig<TModel> {
  /** 内置字段类型。 */
  type: BuiltinFormItemType
  /** 字段组件的动态属性、监听器、选项与 model 覆盖；不可重新指定渲染目标。 */
  component?: FieldComponentConfig<TModel> & { is?: never, resolveComponent?: never, slot?: never }
}

/** 组件目标的异或约束：is 与 resolveComponent 二选一。 */
type ComponentTargetConfig<TModel extends FormModel = FormModel> =
  | { is: string | Component, resolveComponent?: FieldComponentResolver<TModel>, slot?: never }
  | { is?: never, resolveComponent: FieldComponentResolver<TModel>, slot?: never }

/** 直接指定静态或动态 Vue 组件的配置；选项数据源由业务层自行传入。 */
type DirectFieldComponentConfig<TModel extends FormModel = FormModel> = Omit<
  FieldComponentConfig<TModel>,
  'options' | 'optionProps'
> & { options?: never, optionProps?: never }

/** 使用一次性组件渲染的配置。 */
export interface ComponentFormItemConfig<TModel extends FormModel = FormModel>
  extends BaseFormItemConfig<TModel> {
  type: 'component'
  /** 必须通过 is 或 resolveComponent 提供组件目标。 */
  component: DirectFieldComponentConfig<TModel> & ComponentTargetConfig<TModel>
}

/** 使用根 ConfigForm 具名 Slot 渲染内容的字段配置。 */
export interface SlotFormItemConfig<TModel extends FormModel = FormModel>
  extends BaseFormItemConfig<TModel> {
  type: 'slot'
  /** 必须通过 slot 指定具名 Slot，不创建实际字段组件。 */
  component: FieldComponentConfig<TModel> & { slot: string, is?: never, resolveComponent?: never }
}

/** 从注册表定义中还原声明时的组件 Props 协议。 */
type RegisteredFieldTypeProps<TDefinition> = TDefinition extends {
  readonly [FIELD_TYPE_PROTOCOL]: { props: object }
} ? TDefinition[typeof FIELD_TYPE_PROTOCOL]['props'] : ComponentProps

/** 从注册表定义中还原按事件名收窄的监听器表。 */
type RegisteredFieldTypeListeners<TModel extends FormModel, TDefinition> =
  TDefinition extends {
    readonly [FIELD_TYPE_PROTOCOL]: { listeners: object }
  } ? TDefinition[typeof FIELD_TYPE_PROTOCOL]['listeners']
    : Record<string, ConfigFormFieldListener<TModel>>

/** 从注册表定义中还原声明时的事件元组协议。 */
type RegisteredFieldTypeEvents<TDefinition> = TDefinition extends {
  readonly [FIELD_TYPE_PROTOCOL]: { events: infer TEvents }
} ? TEvents extends Record<keyof TEvents, unknown[]>
    ? TEvents
    : FieldTypeEventMap
  : FieldTypeEventMap

/** 取注册表中指定类型名的定义。 */
type RegisteredFieldTypeDefinition<TFieldTypes, TType extends PropertyKey> =
  TFieldTypes extends Record<TType, infer TDefinition> ? TDefinition : never

/** 已注册自定义类型字段的收窄组件配置；渲染协议键全部禁止。 */
type CustomFieldComponentConfig<
  TModel extends FormModel,
  TDefinition
> = {
  props?: DynamicValue<
    Partial<RegisteredFieldTypeProps<TDefinition>>,
    ConfigFormFieldBindingContext<TModel>
  >
  listeners?: RegisteredFieldTypeListeners<TModel, TDefinition>
  model?: FieldModelConfig<TModel, RegisteredFieldTypeEvents<TDefinition>> | false
  is?: never
  resolveComponent?: never
  slot?: never
  options?: never
  optionProps?: never
}

/** 为注册表中的每个业务类型名生成一个收窄分支，未注册的名称无法通过类型检查。 */
type CustomFormItemConfig<
  TModel extends FormModel,
  TFieldTypes extends FieldTypeRegistry<TModel>
> = {
  [TType in RegisteredFormItemType<TFieldTypes>]: BaseFormItemConfig<TModel> & {
    type: TType
    component?: CustomFieldComponentConfig<TModel, RegisteredFieldTypeDefinition<TFieldTypes, TType>>
  }
}[RegisteredFormItemType<TFieldTypes>]

/**
 * 单个表单字段的配置；fieldKey 支持点路径（`profile.name`）与数组下标（`rows.0.name`）。
 * 显式传入字段类型注册表后，自定义 type 的 component 配置按注册协议收窄。
 */
export type FormItemConfig<
  TModel extends FormModel = FormModel,
  TFieldTypes extends FieldTypeRegistry<TModel> = EmptyFieldTypeRegistry
> =
  | BuiltinFormItemConfig<TModel>
  | ComponentFormItemConfig<TModel>
  | SlotFormItemConfig<TModel>
  | CustomFormItemConfig<TModel, TFieldTypes>

/** 表单级自动提示策略；Tooltip 属性仅在对应模式下有效。 */
export interface ConfigFormHintOptions<TModel extends FormModel = FormModel> {
  /** Hint 展示方式；默认使用原生 title，false 关闭全部自动 Hint。 */
  mode?: ConfigFormHintMode
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
export interface ConfigFormFieldChangePayload {
  /** 变化字段的 model 寻址路径。 */
  fieldKey: string
  /** 新值。 */
  value: ConfigFormValue
  /** 上一份值。 */
  previousValue: ConfigFormValue
}

export type ConfigFormFormProps = ComponentProps & { model?: never }
export type ConfigFormFormItemProps = ComponentProps & { prop?: never }

interface BaseConfigFormProps<
  TModel extends FormModel = FormModel,
  TFieldTypes extends FieldTypeRegistry<TModel> = EmptyFieldTypeRegistry
> {
  /** 受控表单数据，v-model 对应的数据源。 */
  model: TModel
  /** 字段配置数组，按数组顺序渲染。 */
  items: FormItemConfig<TModel, TFieldTypes>[]
  /** 透传给 el-form；model 由 ConfigForm 管理。全局禁用通过 `disabled` 透传，由 Element Form 原生下沉。 */
  formProps?: ConfigFormFormProps
  /** 透传给唯一的 el-row；默认 `{ gutter: 16 }`。 */
  rowProps?: ComponentProps
  /** 全局提示策略。 */
  hintOptions?: ConfigFormHintOptions<TModel>
  /** Enter 键字段导航；省略时不接管键盘。 */
  navigationOptions?: ConfigFormNavigationOptions
}

type ConfigFormFieldTypesProp<TFieldTypes> = keyof TFieldTypes extends never
  ? { fieldTypes?: never }
  : { fieldTypes: TFieldTypes }

/** ConfigForm 的完整公共 Props；传入字段类型注册表后 fieldTypes 与 items 同步收窄。 */
export type ConfigFormProps<
  TModel extends FormModel = FormModel,
  TFieldTypes extends FieldTypeRegistry<TModel> = EmptyFieldTypeRegistry
> = BaseConfigFormProps<TModel, TFieldTypes> & ConfigFormFieldTypesProp<TFieldTypes>

/** FormItem label Slot 上下文。 */
export interface ConfigFormFormItemSlotContext<TModel extends FormModel = FormModel>
  extends ConfigFormFieldContext<TModel> {
  propPath: string
}

/** FormItem error Slot 上下文。 */
export interface ConfigFormFormItemErrorSlotContext<TModel extends FormModel = FormModel>
  extends ConfigFormFormItemSlotContext<TModel> {
  error: string
}

/** 字段内容 Slot 上下文。 */
export interface ConfigFormSlotContext<TModel extends FormModel = FormModel>
  extends ConfigFormFormItemSlotContext<TModel> {
  component: ResolvedComponentConfig<TModel>
}

export type ConfigFormSlotFn<T = ConfigFormValue> = (slotProps: T) => VNode[] | VNode | undefined
export type ConfigFormSlots = Record<string, ConfigFormSlotFn | undefined>

/** ConfigForm 返回当前项目安装的 Element UI Form 原生实例。 */
export type ConfigFormElementFormRef = ElForm

/** ConfigForm 实例暴露的方法集合；通过模板 Ref 获取。 */
export interface ConfigFormExpose {
  /** 校验全部字段；无论 Element UI resolve 或 reject 都返回 Promise<boolean>。 */
  validate: (callback?: (valid: boolean, fields?: ConfigFormValue) => void) => Promise<boolean>
  /** 校验一个或多个字段；未挂载或未知字段直接视为失败。 */
  validateField: (fieldKeys: string | string[], callback?: (message: string) => void) => Promise<boolean>
  /** 恢复为组件创建时 model 的内部快照，并清除校验状态。 */
  resetFields: () => void
  /** 清除全部或指定字段校验状态。 */
  clearValidate: (fieldKeys?: string | string[]) => void
  /** 获取底层 Element UI el-form 实例。 */
  getFormRef: () => ConfigFormElementFormRef | null
  /** 聚焦已挂载字段的第一个可聚焦元素；字段隐藏或未知时返回 false。 */
  focusField: (fieldKey: string) => Promise<boolean>
  /** 滚动到第一个校验失败的字段（居中）并尝试聚焦；无报错字段时返回 false。 */
  scrollToFirstError: () => Promise<boolean>
}

/** ConfigForm 自身事件签名。 */
export type ConfigFormEmits<TModel extends FormModel = FormModel> = {
  'update:model': (model: TModel) => void
  'field-change': (payload: ConfigFormFieldChangePayload) => void
  'form-validate': (prop: string, valid: boolean, message: string | null) => void
}

type ConfigFormTemplateProps<
  TModel extends FormModel,
  TFieldTypes extends FieldTypeRegistry<TModel>
> = Omit<ConfigFormProps<TModel, TFieldTypes>, 'model'> & (
  | { model: TModel, modelValue?: never }
  | { modelValue: TModel, model?: TModel }
)

/** ConfigForm 组件的类型视图；运行时与默认导出是同一组件实例。 */
export type ConfigFormComponent<
  TModel extends FormModel = FormModel,
  TFieldTypes extends FieldTypeRegistry<TModel> = EmptyFieldTypeRegistry
> = DefineComponent<
  ConfigFormTemplateProps<TModel, TFieldTypes>,
  ConfigFormExpose,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  ConfigFormEmits<TModel>,
  keyof ConfigFormEmits<TModel>
> & { model: { prop: 'model', event: 'update:model' } }

/** ConfigForm 内部解析完成后的字段组件配置，不从包根入口导出。 */
export interface ResolvedComponentConfig<TModel extends FormModel = FormModel> {
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
