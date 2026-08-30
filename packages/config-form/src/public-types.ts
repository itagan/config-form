export * from './types.public'
export { defineConfigFormItems } from './defineConfigFormItems'
export { defineConfigFormType } from './defineConfigFormType'
export { defineConfigFormTypes } from './defineConfigFormTypes'

import type {
  ConfigFormComponent,
  EmptyFieldTypeRegistry,
  FieldTypeRegistry,
  FormModel
} from './types.public'

export declare function createConfigForm<
  TModel extends FormModel = FormModel,
  TFieldTypes extends FieldTypeRegistry<TModel> = EmptyFieldTypeRegistry
>(): ConfigFormComponent<TModel, TFieldTypes>
export declare const ConfigForm: ConfigFormComponent<FormModel>
declare const _default: ConfigFormComponent<FormModel>
export default _default
