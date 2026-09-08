import type { ConfigFormValue, FormModel } from '../types'

/**
 * 为 resetFields 建立独立快照。仅克隆普通对象、数组及明确支持的内建值，
 * 保留循环与共享引用；其他对象保持引用，不回滚其内部状态。
 */
export function cloneFormValue(value: ConfigFormValue, seen = new WeakMap<object, object>()): ConfigFormValue {
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return seen.get(value)

  const prototype = Object.getPrototypeOf(value)
  if (prototype === Date.prototype || prototype === RegExp.prototype) {
    const result = prototype === Date.prototype
      ? new Date(value.getTime())
      : new RegExp(value.source, value.flags)
    if (result instanceof RegExp) result.lastIndex = value.lastIndex
    seen.set(value, result)
    return result
  }

  if (prototype === Map.prototype) {
    const result = new Map()
    seen.set(value, result)
    value.forEach((entryValue: ConfigFormValue, key: ConfigFormValue) => {
      result.set(cloneFormValue(key, seen), cloneFormValue(entryValue, seen))
    })
    return result
  }

  if (prototype === Set.prototype) {
    const result = new Set()
    seen.set(value, result)
    value.forEach((entry: ConfigFormValue) => result.add(cloneFormValue(entry, seen)))
    return result
  }

  const isArray = Array.isArray(value) && prototype === Array.prototype
  if (!isArray && prototype !== Object.prototype && prototype !== null) return value

  const result: Record<string, ConfigFormValue> | ConfigFormValue[] = isArray
    ? new Array(value.length)
    : Object.create(prototype)
  seen.set(value, result)
  const target = result as Record<string, ConfigFormValue>
  Object.keys(value).forEach(key => {
    Object.defineProperty(target, key, {
      value: cloneFormValue(value[key], seen),
      enumerable: true,
      configurable: true,
      writable: true
    })
  })
  return result
}

export function cloneFormModel<TModel extends FormModel>(model: Readonly<TModel>): TModel {
  return cloneFormValue(model) as TModel
}
