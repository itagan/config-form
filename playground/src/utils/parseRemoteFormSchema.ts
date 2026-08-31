import type { Component } from 'vue'
import type { FormItemConfig } from '@itagan/config-form'

type UnknownRecord = Record<string, unknown>

const builtinTypes = new Set([
  'input', 'select', 'date', 'time', 'time-select', 'number', 'switch', 'radio',
  'checkbox', 'text', 'rate', 'slider', 'color', 'cascader', 'autocomplete'
])
const allowedTypes = new Set([...builtinTypes, 'component', 'slot'])
const allowedItemKeys = new Set([
  'key', 'fieldKey', 'type', 'binding', 'meta', 'labelSlot', 'errorSlot',
  'leftSlot', 'rightSlot', 'visible', 'hint', 'hintTrigger', 'colProps',
  'formItemProps', 'component'
])
const forbiddenKeys = new Set(['__proto__', 'prototype', 'constructor'])
const builtinComponentKeys = new Set(['props', 'options', 'optionProps'])
const componentFieldKeys = new Set(['props'])

export interface RemoteFormSchemaOptions {
  components?: Record<string, Component | string>
  slots?: readonly string[]
  maxFields?: number
  maxBytes?: number
}

export class RemoteFormSchemaError extends Error {
  constructor(message: string) {
    super(`[RemoteFormSchema] ${message}`)
    this.name = 'RemoteFormSchemaError'
  }
}

function fail(message: string): never {
  throw new RemoteFormSchemaError(message)
}

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function assertRecord(value: unknown, location: string): asserts value is UnknownRecord {
  if (!isRecord(value)) fail(`${location} must be an object.`)
}

function assertAllowedKeys(value: UnknownRecord, allowed: Set<string>, location: string) {
  const unsupported = Object.keys(value).filter(key => !allowed.has(key))
  if (unsupported.length) {
    fail(`${location} contains unsupported keys: ${unsupported.join(', ')}.`)
  }
}

function assertSafeJson(value: unknown, location: string, depth = 0): void {
  if (depth > 12) fail(`${location} exceeds the maximum nesting depth.`)
  if (typeof value === 'string' && value.length > 10_000) {
    fail(`${location} contains a string longer than 10,000 characters.`)
  }
  if (Array.isArray(value)) {
    if (value.length > 1_000) fail(`${location} contains too many array entries.`)
    value.forEach((entry, index) => assertSafeJson(entry, `${location}[${index}]`, depth + 1))
    return
  }
  if (!isRecord(value)) return
  const keys = Object.keys(value)
  if (keys.length > 100) fail(`${location} contains too many properties.`)
  keys.forEach(key => {
    if (forbiddenKeys.has(key)) fail(`${location} contains forbidden key "${key}".`)
    assertSafeJson(value[key], `${location}.${key}`, depth + 1)
  })
}

function assertPath(value: unknown, location: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) fail(`${location} must be a non-empty string.`)
  if (value.length > 200) fail(`${location} is longer than 200 characters.`)
  const segments = value.split(/[.[\]]+/).filter(Boolean)
  if (!segments.length || segments.some(segment => forbiddenKeys.has(segment))) {
    fail(`${location} contains an unsafe path segment.`)
  }
}

function assertOptionalRecord(value: unknown, location: string) {
  if (value !== undefined) assertRecord(value, location)
}

function validateBinding(value: unknown, location: string) {
  if (value === undefined) return
  assertRecord(value, location)
  assertAllowedKeys(value, new Set(['map']), location)
  if (!Array.isArray(value.map) || value.map.length === 0) fail(`${location}.map must be a non-empty array.`)
  value.map.forEach((entry, index) => {
    const entryLocation = `${location}.map[${index}]`
    assertRecord(entry, entryLocation)
    assertAllowedKeys(entry, new Set(['fieldPath', 'valuePath', 'fallbackValue']), entryLocation)
    assertPath(entry.fieldPath, `${entryLocation}.fieldPath`)
    assertPath(entry.valuePath, `${entryLocation}.valuePath`)
  })
}

function validateSlot(value: unknown, location: string, slots: Set<string>) {
  if (value === undefined) return
  if (typeof value !== 'string' || !value.trim()) fail(`${location} must be a non-empty string.`)
  if (!slots.has(value)) fail(`${location} references undeclared local slot "${value}".`)
}

function validateComponent(
  item: UnknownRecord,
  location: string,
  components: Record<string, Component | string>,
  slots: Set<string>
): UnknownRecord | undefined {
  if (item.component === undefined && builtinTypes.has(String(item.type))) return undefined
  assertRecord(item.component, `${location}.component`)

  if (item.type === 'component') {
    assertAllowedKeys(item.component, componentFieldKeys, `${location}.component`)
    assertRecord(item.meta, `${location}.meta`)
    const componentName = item.meta.component
    if (typeof componentName !== 'string' || !componentName.trim()) {
      fail(`${location}.meta.component must name a locally registered component.`)
    }
    if (!Object.prototype.hasOwnProperty.call(components, componentName)) {
      fail(`${location}.meta.component references unknown local component "${componentName}".`)
    }
    assertOptionalRecord(item.component.props, `${location}.component.props`)
    return {
      ...item.component,
      resolveComponent: () => components[componentName]
    }
  }

  if (item.type === 'slot') {
    assertAllowedKeys(item.component, new Set(['slot']), `${location}.component`)
    validateSlot(item.component.slot, `${location}.component.slot`, slots)
    return item.component
  }

  assertAllowedKeys(item.component, builtinComponentKeys, `${location}.component`)
  assertOptionalRecord(item.component.props, `${location}.component.props`)
  assertOptionalRecord(item.component.optionProps, `${location}.component.optionProps`)
  if (item.component.options !== undefined && !Array.isArray(item.component.options)) {
    fail(`${location}.component.options must be an array.`)
  }
  return item.component
}

/**
 * 将不可信的远程 JSON 收窄为 ConfigForm 配置。
 * 远程数据只能描述声明式属性；组件与 Slot 必须来自调用方提供的本地白名单。
 */
export function parseRemoteFormSchema(
  source: string,
  options: RemoteFormSchemaOptions = {}
): FormItemConfig[] {
  const maxBytes = options.maxBytes ?? 100_000
  const maxFields = options.maxFields ?? 200
  if (!Number.isInteger(maxBytes) || maxBytes < 1) fail('maxBytes must be a positive integer.')
  if (!Number.isInteger(maxFields) || maxFields < 1) fail('maxFields must be a positive integer.')
  if (new Blob([source]).size > maxBytes) fail(`schema exceeds the ${maxBytes}-byte limit.`)

  let parsed: unknown
  try {
    parsed = JSON.parse(source)
  } catch (error) {
    fail(`invalid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
  assertSafeJson(parsed, 'schema')
  if (!Array.isArray(parsed)) fail('schema root must be an array.')
  if (parsed.length > maxFields) fail(`schema contains more than ${maxFields} fields.`)

  const components = options.components ?? {}
  const slots = new Set(options.slots ?? [])
  const identities = new Set<string>()

  return parsed.map((rawItem, index) => {
    const location = `field #${index + 1}`
    assertRecord(rawItem, location)
    assertAllowedKeys(rawItem, allowedItemKeys, location)
    assertPath(rawItem.fieldKey, `${location}.fieldKey`)
    if (typeof rawItem.type !== 'string' || !allowedTypes.has(rawItem.type)) {
      fail(`${location}.type is not an allowed field type.`)
    }
    if (rawItem.key !== undefined && (typeof rawItem.key !== 'string' || !rawItem.key.trim())) {
      fail(`${location}.key must be a non-empty string when provided.`)
    }

    const identity = typeof rawItem.key === 'string' ? rawItem.key : rawItem.fieldKey
    if (identities.has(identity)) fail(`${location} duplicates render identity "${identity}".`)
    identities.add(identity)

    validateBinding(rawItem.binding, `${location}.binding`)
    assertOptionalRecord(rawItem.meta, `${location}.meta`)
    assertOptionalRecord(rawItem.colProps, `${location}.colProps`)
    assertOptionalRecord(rawItem.formItemProps, `${location}.formItemProps`)
    ;['labelSlot', 'errorSlot', 'leftSlot', 'rightSlot'].forEach(key => (
      validateSlot(rawItem[key], `${location}.${key}`, slots)
    ))
    if (rawItem.visible !== undefined && typeof rawItem.visible !== 'boolean') {
      fail(`${location}.visible must be a boolean.`)
    }
    if (rawItem.hint !== undefined && rawItem.hint !== null && rawItem.hint !== false && typeof rawItem.hint !== 'string') {
      fail(`${location}.hint must be a string, false or null.`)
    }
    if (rawItem.hintTrigger !== undefined && rawItem.hintTrigger !== 'item' && rawItem.hintTrigger !== 'content') {
      fail(`${location}.hintTrigger must be "item" or "content".`)
    }

    const component = validateComponent(rawItem, location, components, slots)
    return {
      ...rawItem,
      ...(component === undefined ? {} : { component })
    } as unknown as FormItemConfig
  })
}
