import type { ConfigFormValue, FormModel } from '../types'

/**
 * 为 resetFields 建立独立快照。克隆常见表单值并保留对象原型与循环引用；
 * WeakMap/WeakSet、函数和 DOM 节点等不可枚举状态保持引用，复杂模型可通过 cloneModel 覆盖。
 */
export function cloneFormValue(value: ConfigFormValue, seen = new WeakMap<object, object>()): ConfigFormValue {
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return seen.get(value)

  if (value instanceof Date) return new Date(value.getTime())
  if (value instanceof RegExp) return new RegExp(value.source, value.flags)

  if (value instanceof Map) {
    const result = new Map()
    seen.set(value, result)
    value.forEach((entryValue, key) => {
      result.set(cloneFormValue(key, seen), cloneFormValue(entryValue, seen))
    })
    return result
  }

  if (value instanceof Set) {
    const result = new Set()
    seen.set(value, result)
    value.forEach(entry => result.add(cloneFormValue(entry, seen)))
    return result
  }

  const result: Record<string, ConfigFormValue> | ConfigFormValue[] = Array.isArray(value)
    ? []
    : Object.create(Object.getPrototypeOf(value))
  seen.set(value, result)
  const target = result as Record<string, ConfigFormValue>
  Object.keys(value).forEach(key => {
    target[key] = cloneFormValue(value[key], seen)
  })
  return result
}

export function cloneFormModel<TModel extends FormModel>(model: Readonly<TModel>): TModel {
  return cloneFormValue(model) as TModel
}
