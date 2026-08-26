export * from './types'
export { defineFormItems } from './defineFormItems'
export { defineConfigFormType } from './defineConfigFormType'
export { defineConfigFormTypes } from './defineConfigFormTypes'

import type { ConfigFormComponent, FormModel } from './types'

export declare function createConfigForm<TModel extends FormModel = FormModel>(): ConfigFormComponent<TModel>
export declare const ConfigForm: ConfigFormComponent<FormModel>
declare const _default: ConfigFormComponent<FormModel>
export default _default
