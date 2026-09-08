import { ref } from 'vue'
import type {
  ConfigFormFieldChangePayload,
  ConfigFormValue,
  FormModel
} from '../types'
import { getValueByPath, setValueByPath } from '../utils/path'

interface Options {
  getModel: () => FormModel
  emitUpdate: (model: FormModel) => void
  emitFieldChange: (payload: ConfigFormFieldChangePayload) => void
}

/** 合并父组件回写前发生的同步更新，微任务结束后重新以受控 prop 为准。 */
export function useControlledFormUpdate(options: Options) {
  // 受控父组件通常要到下一轮渲染才回写 prop；该版本号让字段在同一轮同步更新中
  // 立即重新求值，避免复合组件连续输入时第二次事件基于旧 value 覆盖第一次输入。
  const revision = ref(0)
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
    revision.value++
    scheduleReset()
    options.emitUpdate(model)
  }

  const updateModel = (
    patch: Record<string, ConfigFormValue>
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
      options.emitFieldChange(change)
    })
  }

  return {
    getCurrentModel,
    getRevision: () => revision.value,
    replaceModel: (model: FormModel) => commitModel(model),
    updateModel,
    setFieldValue: (fieldKey: string, value: ConfigFormValue) => (
      updateModel({ [fieldKey]: value })
    )
  }
}
