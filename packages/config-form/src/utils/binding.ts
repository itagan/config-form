import type {
  ConfigFormValue,
  FieldBindingConfig,
  FieldBindingMapEntry,
  FormModel
} from '../types'
import { getValueByPath, normalizePath, resolveValueByPath, setValueByPath } from './path'

interface CompiledEntry extends FieldBindingMapEntry {
  fieldSegments: readonly string[]
  valueSegments: readonly string[]
}

const cache = new WeakMap<FieldBindingConfig, { entries: CompiledEntry[], arrayRoot: boolean }>()
const arrayIndex = /^(0|[1-9]\d*)$/

function isParent(left: readonly string[], right: readonly string[]) {
  return left.length <= right.length && left.every((part, index) => part === right[index])
}

function compile(binding: FieldBindingConfig) {
  const cached = cache.get(binding)
  if (cached) return cached
  if (!Array.isArray(binding.map) || !binding.map.length) {
    throw new TypeError('[ConfigForm] binding.map must contain at least one entry')
  }

  const entries = binding.map.map(entry => {
    if (!entry || typeof entry.fieldPath !== 'string' || typeof entry.valuePath !== 'string') {
      throw new TypeError('[ConfigForm] binding entries require fieldPath and valuePath')
    }
    const fieldSegments = normalizePath(entry.fieldPath)
    const valueSegments = normalizePath(entry.valuePath)
    if (!fieldSegments.length || !valueSegments.length) {
      throw new TypeError('[ConfigForm] binding paths must not be empty')
    }
    return { ...entry, fieldSegments, valueSegments }
  })

  entries.forEach((entry, index) => entries.slice(index + 1).forEach(other => {
    if (isParent(entry.fieldSegments, other.fieldSegments) || isParent(other.fieldSegments, entry.fieldSegments)) {
      throw new TypeError('[ConfigForm] binding fieldPath values cannot overlap')
    }
    if (isParent(entry.valueSegments, other.valueSegments) || isParent(other.valueSegments, entry.valueSegments)) {
      throw new TypeError('[ConfigForm] binding valuePath values cannot overlap')
    }
  }))

  const roots = new Set(entries.map(entry => arrayIndex.test(entry.valueSegments[0])))
  if (roots.size !== 1) throw new TypeError('[ConfigForm] binding value roots cannot mix arrays and objects')
  const compiled = { entries, arrayRoot: roots.has(true) }
  cache.set(binding, compiled)
  return compiled
}

export function resolveBindingValue(model: Readonly<FormModel>, binding: FieldBindingConfig) {
  const { entries, arrayRoot } = compile(binding)
  let result: FormModel = arrayRoot ? [] : {}
  entries.forEach(entry => {
    result = setValueByPath(result, entry.valuePath, getValueByPath(model, entry.fieldPath))
  })
  return result
}

export function createBindingPatch(binding: FieldBindingConfig, value: ConfigFormValue) {
  const patch: Record<string, ConfigFormValue> = {}
  compile(binding).entries.forEach(entry => {
    const resolved = resolveValueByPath(value, entry.valuePath)
    if (resolved.exists) patch[entry.fieldPath] = resolved.value
    else if (Object.prototype.hasOwnProperty.call(entry, 'fallbackValue')) {
      const fallback = entry.fallbackValue
      patch[entry.fieldPath] = Array.isArray(fallback)
        ? [...fallback]
        : fallback && typeof fallback === 'object' ? { ...fallback } : fallback
    } else if (value === null) patch[entry.fieldPath] = null
  })
  return patch
}
