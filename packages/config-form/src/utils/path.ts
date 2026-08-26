import type { ConfigFormValue, FormModel } from '../types'

const PATH_CACHE_LIMIT = 512
const pathCache = new Map<string, readonly string[]>()
const unsafeSegments = new Set(['__proto__', 'prototype', 'constructor'])
const arrayIndex = /^(0|[1-9]\d*)$/

function isObjectLike(value: unknown): value is FormModel {
  return value !== null && typeof value === 'object'
}

export function normalizePath(path: string): readonly string[] {
  const cached = pathCache.get(path)
  if (cached) return cached

  const segments = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)
  const unsafe = segments.find(segment => unsafeSegments.has(segment))
  if (unsafe) throw new TypeError(`[ConfigForm] unsafe field path "${path}"`)

  if (pathCache.size >= PATH_CACHE_LIMIT) {
    const oldest = pathCache.keys().next().value
    if (oldest !== undefined) pathCache.delete(oldest)
  }
  pathCache.set(path, segments)
  return segments
}

export function resolveValueByPath(
  source: Readonly<FormModel>,
  path: string
): { exists: boolean, value: ConfigFormValue } {
  const segments = normalizePath(path)
  let current: ConfigFormValue = source
  for (const segment of segments) {
    if (!isObjectLike(current) || !Object.prototype.hasOwnProperty.call(current, segment)) {
      return { exists: false, value: undefined }
    }
    current = current[segment]
  }
  return { exists: segments.length > 0, value: current }
}

export function getValueByPath(source: Readonly<FormModel>, path: string): ConfigFormValue {
  return resolveValueByPath(source, path).value
}

/** 沿字段路径浅拷贝，返回新的根 model。 */
export function setValueByPath<T extends FormModel>(source: T, path: string, value: ConfigFormValue): T {
  const segments = normalizePath(path)
  if (!segments.length) return source

  const root: FormModel = Array.isArray(source) ? [...source] : { ...source }
  let current = root
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = value
      return
    }
    const existing = current[segment]
    if (Array.isArray(existing)) current[segment] = [...existing]
    else if (isObjectLike(existing)) current[segment] = { ...existing }
    else current[segment] = arrayIndex.test(segments[index + 1]) ? [] : {}
    current = current[segment]
  })
  return root as T
}

export function applyPathPatch<T extends FormModel>(
  source: T,
  patch: Record<string, ConfigFormValue>
): T {
  return Object.keys(patch).reduce(
    (model, path) => setValueByPath(model, path, patch[path]),
    source
  )
}
