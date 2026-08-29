import type { Component, DefineComponent } from 'vue'

export type ConfigFormValue = any
export type FormModel = Record<string, ConfigFormValue>
export type ComponentProps = Record<string, ConfigFormValue>
export type DynamicValue<T, TContext> = T | ((context: TContext) => T)
export type ConfigFormHintValue = string | false | null | undefined
export type ConfigFormHintMode = false | 'title' | 'tooltip'
export type ConfigFormHintTrigger = 'item' | 'content'
export type FieldTypeEventMap = Record<string, unknown[]>

export interface FormItemOption {
  label?: ConfigFormValue
  value?: ConfigFormValue
  disabled?: boolean
  [key: string]: ConfigFormValue
}

export interface OptionPropsConfig {
  label?: string
  value?: string
  disabled?: string
  key?: string
}

export interface FieldBindingMapEntry {
  fieldPath: string
  valuePath: string
  fallbackValue?: ConfigFormValue
}

export interface FieldBindingConfig {
  map: FieldBindingMapEntry[]
}

export interface ConfigFormRenderContext<TModel extends FormModel = FormModel> {
  model: Readonly<TModel>
}

export interface ConfigFormFieldRenderContext<TModel extends FormModel = FormModel>
  extends ConfigFormRenderContext<TModel> {
  fieldKey: string
  value: ConfigFormValue
  itemConfig: Readonly<FormItemConfig<TModel>>
}

export interface ConfigFormFieldContext<TModel extends FormModel = FormModel>
  extends ConfigFormFieldRenderContext<TModel> {
  setValue: (value: ConfigFormValue) => void
  bindingValue: ConfigFormValue
  setBindingValue: (value: ConfigFormValue) => void
  updateModel: (patch: Partial<TModel> & Record<string, ConfigFormValue>) => void
}

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
  prop?: string
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

export interface FieldComponentConfig<TModel extends FormModel = FormModel> {
  is?: string | Component
  resolveComponent?: (
    context: ConfigFormFieldRenderContext<TModel>
  ) => string | Component | undefined
  props?: DynamicValue<ComponentProps, ConfigFormFieldRenderContext<TModel>>
  listeners?: Record<string, ConfigFormFieldListener<TModel>>
  options?: DynamicValue<FormItemOption[], ConfigFormFieldRenderContext<TModel>>
  optionProps?: DynamicValue<OptionPropsConfig, ConfigFormFieldRenderContext<TModel>>
  model?: FieldModelConfig<TModel> | false
  slot?: string
}

declare const FIELD_TYPE_PROTOCOL: unique symbol

export interface FieldTypeDefinition<
  TModel extends FormModel = FormModel,
  TProps extends object = ComponentProps,
  TEvents extends Record<keyof TEvents, unknown[]> = FieldTypeEventMap
> {
  is: string | Component
  props?: DynamicValue<Partial<TProps>, ConfigFormFieldRenderContext<TModel>>
  model?: FieldModelConfig<TModel, TEvents> | false
}

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

export type FieldTypeRegistry<TModel extends FormModel = FormModel> = Record<
  string,
  FieldTypeDefinition<TModel, any, any>
>

export type BuiltinFormItemType =
  | 'input' | 'select' | 'date' | 'time' | 'time-select'
  | 'number' | 'switch' | 'radio' | 'checkbox' | 'text' | 'rate'
  | 'slider' | 'color' | 'cascader' | 'autocomplete'

export type FormItemType = BuiltinFormItemType | 'component' | 'slot' | (string & Record<never, never>)
export type ReservedFormItemType = BuiltinFormItemType | 'component' | 'slot'

export interface FormItemConfig<TModel extends FormModel = FormModel> {
  key?: string
  fieldKey: string
  type: FormItemType
  binding?: FieldBindingConfig
  meta?: Record<string, unknown>
  labelSlot?: string
  errorSlot?: string
  visible?: DynamicValue<boolean, ConfigFormFieldRenderContext<TModel>>
  disabled?: DynamicValue<boolean, ConfigFormFieldRenderContext<TModel>>
  readonly?: DynamicValue<boolean, ConfigFormFieldRenderContext<TModel>>
  hint?: DynamicValue<ConfigFormHintValue, ConfigFormFieldRenderContext<TModel>>
  colProps?: DynamicValue<ComponentProps, ConfigFormFieldRenderContext<TModel>>
  formItemProps?: DynamicValue<ComponentProps, ConfigFormFieldRenderContext<TModel>>
  component?: FieldComponentConfig<TModel>
}

export interface ConfigFormHintOptions<TModel extends FormModel = FormModel> {
  mode?: ConfigFormHintMode
  /** Tooltip 模式下的触发区域：item 为整个 FormItem，content 仅限字段内容根节点。 */
  hintTrigger?: ConfigFormHintTrigger
  field?: boolean | ((context: ConfigFormFieldRenderContext<TModel>) => ConfigFormHintValue)
  tooltipProps?: ComponentProps
}

export interface ConfigFormNavigationOptions {
  enabled?: boolean
}

export interface ConfigFormFieldChangePayload<TModel extends FormModel = FormModel> {
  fieldKey: string
  value: ConfigFormValue
  previousValue: ConfigFormValue
  model: TModel
  itemConfig: Readonly<FormItemConfig<TModel>>
}

export interface ConfigFormProps<TModel extends FormModel = FormModel> {
  model: TModel
  items?: FormItemConfig<TModel>[]
  formProps?: ComponentProps & { model?: never }
  rowProps?: ComponentProps
  fieldTypes?: FieldTypeRegistry<TModel>
  hintOptions?: ConfigFormHintOptions<TModel>
  navigationOptions?: ConfigFormNavigationOptions
  disabled?: boolean
  readonly?: boolean
}

export interface ConfigFormRef {
  validate: (callback?: (valid: boolean, fields?: ConfigFormValue) => void) => Promise<boolean>
  validateField: (props: string | string[], callback?: (message: string) => void) => Promise<boolean>
  resetFields: () => void
  clearValidate: (props?: string | string[]) => void
  getFieldValue: (fieldKey: string) => ConfigFormValue
  setFieldValue: (fieldKey: string, value: ConfigFormValue) => void
  setFieldsValue: (patch: Record<string, ConfigFormValue>) => void
  getModel: () => FormModel
  getFormRef: () => unknown
  focusField: (fieldKey: string) => Promise<boolean>
  scrollToFirstError: () => Promise<boolean>
}

export type ConfigFormComponent<TModel extends FormModel = FormModel> = DefineComponent<
  ConfigFormProps<TModel>,
  Record<string, never>,
  any
>

export interface ResolvedFieldComponent<TModel extends FormModel = FormModel> {
  is?: string | Component
  props: ComponentProps
  listeners: Record<string, (...args: unknown[]) => void>
  options: FormItemOption[]
  optionProps?: OptionPropsConfig
  model?: FieldModelConfig<TModel> | false
}
