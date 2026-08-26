import type { Component, DefineComponent } from 'vue'

export type ConfigFormValue = any
export type FormModel = Record<string, ConfigFormValue>
export type ComponentProps = Record<string, ConfigFormValue>
export type DynamicValue<T, TContext> = T | ((context: TContext) => T)
export type ConfigFormHintValue = string | false | null | undefined
export type ConfigFormHintMode = false | 'title' | 'tooltip'
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

export interface FieldModelConfig<
  TModel extends FormModel = FormModel,
  TEvents extends Record<keyof TEvents, unknown[]> = FieldTypeEventMap
> {
  prop?: string
  event?: Extract<keyof TEvents, string> | (string extends keyof TEvents ? string : never)
  valueToProp?: (
    context: ConfigFormFieldRenderContext<TModel>,
    bindingValue: ConfigFormValue
  ) => ConfigFormValue
  valueFromEvent?: (
    context: ConfigFormFieldRenderContext<TModel>,
    ...args: unknown[]
  ) => ConfigFormValue
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

export type FormItemType = BuiltinFormItemType | 'component' | 'slot' | (string & {})
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
  field?: boolean | ((context: ConfigFormFieldRenderContext<TModel>) => ConfigFormHintValue)
  tooltipProps?: ComponentProps
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
  disabled?: boolean
  readonly?: boolean
}

export interface ConfigFormRef {
  validate: (callback?: (valid: boolean, fields?: ConfigFormValue) => void) => Promise<boolean>
  validateField: (props: string | string[], callback?: (message: string) => void) => void
  resetFields: () => void
  clearValidate: (props?: string | string[]) => void
  getFieldValue: (fieldKey: string) => ConfigFormValue
  setFieldValue: (fieldKey: string, value: ConfigFormValue) => void
  setFieldsValue: (patch: Record<string, ConfigFormValue>) => void
  getModel: () => FormModel
  getFormRef: () => unknown
}

export type ConfigFormComponent<TModel extends FormModel = FormModel> = DefineComponent<
  ConfigFormProps<TModel>,
  {},
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
