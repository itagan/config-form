import { isReservedType } from './field'

export interface SchemaDiagnostic {
  key: string
  message: string
}

type UnknownRecord = Record<string, unknown>
const definitionKeys = new Set(['is', 'model', 'props'])
const forbiddenItemComponentKeys = ['is', 'resolveComponent', 'slot', 'options', 'optionProps']

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isComponentTarget(value: unknown) {
  return (typeof value === 'string' && value.trim().length > 0)
    || typeof value === 'function'
    || isRecord(value)
}

function validateDefinition(name: string, definition: unknown): SchemaDiagnostic[] {
  const prefix = `[ConfigForm] Invalid field type "${name}"`
  if (!isRecord(definition)) {
    return [{ key: `definition:${name}`, message: `${prefix}: definition must be an object.` }]
  }
  const diagnostics: SchemaDiagnostic[] = []
  const unsupported = Object.keys(definition).filter(key => !definitionKeys.has(key))
  if (unsupported.length) {
    diagnostics.push({
      key: `definition-keys:${name}:${unsupported.join(',')}`,
      message: `${prefix}: unsupported keys ${unsupported.map(key => `"${key}"`).join(', ')}; only is, model and props are supported.`
    })
  }
  if (!isComponentTarget(definition.is)) {
    diagnostics.push({
      key: `definition-is:${name}`,
      message: `${prefix}: "is" must be a non-empty component name or component object.`
    })
  }
  if (definition.props !== undefined && typeof definition.props !== 'function' && !isRecord(definition.props)) {
    diagnostics.push({
      key: `definition-props:${name}`,
      message: `${prefix}: "props" must be an object or synchronous function.`
    })
  }
  const model = definition.model
  if (model !== undefined && model !== false) {
    if (!isRecord(model)) {
      diagnostics.push({
        key: `definition-model:${name}`,
        message: `${prefix}: "model" must be false or an object.`
      })
    } else {
      for (const key of ['prop', 'event']) {
        if (model[key] !== undefined && typeof model[key] !== 'string') {
          diagnostics.push({
            key: `definition-model-${key}:${name}`,
            message: `${prefix}: model.${key} must be a string.`
          })
        }
      }
      for (const key of ['valueToProp', 'valueFromEvent']) {
        if (model[key] !== undefined && typeof model[key] !== 'function') {
          diagnostics.push({
            key: `definition-model-${key}:${name}`,
            message: `${prefix}: model.${key} must be a synchronous function.`
          })
        }
      }
    }
  }
  return diagnostics
}

/** 收集配置问题；调用方负责开发环境门控以及按 key 去重输出。 */
export function collectSchemaDiagnostics(
  fieldTypes: UnknownRecord,
  items: unknown[]
): SchemaDiagnostic[] {
  const diagnostics: SchemaDiagnostic[] = []
  const registeredNames = Object.keys(fieldTypes)
  const customNames = registeredNames.filter(name => !isReservedType(name))

  registeredNames.forEach(name => {
    if (isReservedType(name)) {
      diagnostics.push({
        key: `reserved:${name}`,
        message: `[ConfigForm] Field type "${name}" is reserved; the registered definition is ignored.`
      })
      return
    }
    diagnostics.push(...validateDefinition(name, fieldTypes[name]))
  })

  const identities = new Map<string, number>()
  items.forEach((value, index) => {
    if (!isRecord(value)) {
      diagnostics.push({
        key: `item:${index}`,
        message: `[ConfigForm] Invalid item #${index + 1}: configuration must be an object.`
      })
      return
    }
    const fieldKey = typeof value.fieldKey === 'string' ? value.fieldKey.trim() : ''
    const type = typeof value.type === 'string' ? value.type.trim() : ''
    const location = fieldKey || `#${index + 1}`
    if (!fieldKey) {
      diagnostics.push({
        key: `field-key:${index}`,
        message: `[ConfigForm] Invalid field "${location}": fieldKey must be a non-empty string.`
      })
    }
    if (!type) {
      diagnostics.push({
        key: `type:${index}`,
        message: `[ConfigForm] Invalid field "${location}": type must be a non-empty string.`
      })
      return
    }

    const identity = String(value.key || fieldKey)
    const previousIndex = identities.get(identity)
    if (identity && previousIndex !== undefined) {
      diagnostics.push({
        key: `identity:${identity}`,
        message: `[ConfigForm] Duplicate render key "${identity}" at fields #${previousIndex + 1} and #${index + 1}; provide unique item.key values.`
      })
    } else if (identity) identities.set(identity, index)

    const component = isRecord(value.component) ? value.component : undefined
    if (type === 'component' && !(
      component && (isComponentTarget(component.is) || typeof component.resolveComponent === 'function')
    )) {
      diagnostics.push({
        key: `component-target:${identity || index}`,
        message: `[ConfigForm] Component field "${location}" requires component.is or component.resolveComponent.`
      })
    } else if (type === 'slot' && !(
      component && typeof component.slot === 'string' && component.slot.trim()
    )) {
      diagnostics.push({
        key: `slot-target:${identity || index}`,
        message: `[ConfigForm] Slot field "${location}" requires a non-empty component.slot.`
      })
    } else if (!isReservedType(type) && registeredNames.includes(type)) {
      // 已注册的自定义类型不得在 item 级重新指定渲染协议；高级渲染应改用 type: "component"/"slot"。
      forbiddenItemComponentKeys.forEach(key => {
        if (component && component[key] !== undefined) {
          diagnostics.push({
            key: `item-key:${type}:${key}`,
            message: `[ConfigForm] Custom field type "${type}" cannot use component.${key} at field "${location}"; use type: "component" or "slot" for advanced rendering.`
          })
        }
      })
    } else if (!isReservedType(type) && !registeredNames.includes(type)) {
      const available = customNames.length
        ? ` Available custom types: ${customNames.map(name => `"${name}"`).join(', ')}.`
        : ' No custom field types are registered on this instance.'
      diagnostics.push({
        key: `unknown:${type}`,
        message: `[ConfigForm] Unknown field type "${type}" at field "${location}".${available} Register it through fieldTypes or use type: "component".`
      })
    }
  })
  return diagnostics
}
