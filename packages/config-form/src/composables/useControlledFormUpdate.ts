import type {
  ConfigFormFieldChangePayload,
  ConfigFormValue,
  FormItemConfig,
  FormModel
} from '../types'
import { getValueByPath, setValueByPath } from '../utils/path'

interface Options {
  getModel: () => FormModel
  resolveItem: (fieldKey: string) => FormItemConfig | undefined
  emitUpdate: (model: FormModel) => void
  emitFieldChange: (payload: ConfigFormFieldChangePayload) => void
}

/** 合并父组件回写前发生的同步更新，微任务结束后重新以受控 prop 为准。 */
export function useControlledFormUpdate(options: Options) {
  let synchronousBase: FormModel | null = null
  let resetPending = false

  const scheduleReset = () => {
    if (resetPending) return
    resetPending = true
    Promise.resolve().then(() => {
      synchronousBase = null
      resetPending = false
    })
  }

  const getCurrentModel = () => synchronousBase || options.getModel()

  const commitModel = (model: FormModel) => {
    synchronousBase = model
    scheduleReset()
    options.emitUpdate(model)
  }

  const updateModel = (
    patch: Record<string, ConfigFormValue>,
    originItem?: FormItemConfig
  ) => {
    const source = getCurrentModel()
    let nextModel = source
    const changes: Array<{ fieldKey: string, previousValue: ConfigFormValue, value: ConfigFormValue }> = []

    Object.keys(patch).forEach(fieldKey => {
      const previousValue = getValueByPath(nextModel, fieldKey)
      const value = patch[fieldKey]
      if (Object.is(previousValue, value)) return
      nextModel = setValueByPath(nextModel, fieldKey, value)
      changes.push({ fieldKey, previousValue, value })
    })

    if (!changes.length) return
    commitModel(nextModel)
    changes.forEach(change => {
      const itemConfig = options.resolveItem(change.fieldKey) || originItem
      if (!itemConfig) return
      options.emitFieldChange({ ...change, model: nextModel, itemConfig })
    })
  }

  return {
    getCurrentModel,
    replaceModel: (model: FormModel) => commitModel(model),
    updateModel,
    setFieldValue: (fieldKey: string, value: ConfigFormValue, originItem?: FormItemConfig) => (
      updateModel({ [fieldKey]: value }, originItem)
    )
  }
}
