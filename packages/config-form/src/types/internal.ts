import type { VNode } from 'vue'
import type { ConfigFormSlots, ConfigFormValue, FormModel } from '../types'

export type ConfigFormSlot = (props: any) => VNode[] | VNode | undefined
export type ConfigFormRootSlots = Readonly<ConfigFormSlots>

export interface ConfigFormUpdateApi {
  getCurrentModel: () => FormModel
  setFieldValue: (
    fieldKey: string,
    value: ConfigFormValue
  ) => void
  updateModel: (
    patch: Record<string, ConfigFormValue>
  ) => void
}
