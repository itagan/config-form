import ConfigFormRuntime from './index.vue'
import type { ConfigFormComponent, EmptyFieldTypeRegistry, FieldTypeRegistry, FormModel } from './types'

export { defineConfigFormItems } from './defineConfigFormItems'
export { defineConfigFormType } from './defineConfigFormType'
export { defineConfigFormTypes } from './defineConfigFormTypes'
export * from './types.public'

const ConfigForm = ConfigFormRuntime as unknown as ConfigFormComponent<FormModel>
export { ConfigForm }

/** 返回同一运行时组件的业务 model 与字段类型注册表泛型视图，不创建包装组件或额外实例。 */
export function createConfigForm<
  TModel extends FormModel = FormModel,
  TFieldTypes extends FieldTypeRegistry<TModel> = EmptyFieldTypeRegistry
>(): ConfigFormComponent<TModel, TFieldTypes> {
  return ConfigForm as unknown as ConfigFormComponent<TModel, TFieldTypes>
}

export default ConfigForm
