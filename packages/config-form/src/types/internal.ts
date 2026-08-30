import type { VNode } from 'vue'
import type { ConfigFormValue, FormItemConfig, FormModel } from '../types'

export type ConfigFormSlot = (props: any) => VNode[] | VNode | undefined
export type ConfigFormRootSlots = Readonly<Record<string, ConfigFormSlot | undefined>>

export interface ConfigFormUpdateApi {
  getCurrentModel: () => FormModel
  setFieldValue: (
    fieldKey: string,
    value: ConfigFormValue,
    originItem?: FormItemConfig
  ) => void
  updateModel: (
    patch: Record<string, ConfigFormValue>,
    originItem?: FormItemConfig
  ) => void
}
