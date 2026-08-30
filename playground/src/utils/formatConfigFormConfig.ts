import type { FormItemConfig, FormModel } from '@itagan/config-form'

/** 将演示页正在使用的 items 配置转换成可读代码，避免维护第二份静态示例。 */
export function formatConfigFormConfig<TModel extends FormModel>(
  items: FormItemConfig<TModel>[]
) {
  return JSON.stringify(items, (key, value) => {
    if (key === 'is' && value && typeof value !== 'string') {
      return `[Component ${value.name || value.options?.name || 'Anonymous'}]`
    }

    if (typeof value === 'function') {
      return value.toString()
    }

    return value
  }, 2)
}
