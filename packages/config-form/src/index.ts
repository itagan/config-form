import ConfigForm from './ConfigForm.vue'
import type { ConfigFormComponent, FormModel } from './types'

export { defineFormItems } from './defineFormItems'
export { defineConfigFormType } from './defineConfigFormType'
export { defineConfigFormTypes } from './defineConfigFormTypes'
export * from './types'
export { ConfigForm }

export function createConfigForm<TModel extends FormModel = FormModel>(): ConfigFormComponent<TModel> {
  return ConfigForm as unknown as ConfigFormComponent<TModel>
}

export default ConfigForm
