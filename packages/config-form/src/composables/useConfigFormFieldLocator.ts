import { nextTick } from 'vue'

export const CONFIG_FORM_FIELD_PROP_ATTRIBUTE = 'data-config-form-field-prop'
export const CONFIG_FORM_ROOT_ATTRIBUTE = 'data-config-form-root'

const FOCUSABLE_SELECTOR = [
  'input:not([disabled]):not([readonly])',
  'textarea:not([disabled]):not([readonly])',
  'select:not([disabled])',
  'button:not([disabled])',
  '[contenteditable="true"]:not([aria-disabled="true"])',
  '[tabindex]:not([tabindex="-1"]):not([aria-disabled="true"])'
].join(',')

interface ConfigFormFieldLocatorOptions {
  getContainer: () => HTMLElement | null
  getForm: () => {
    validateField?: (prop: string, callback: (message: string) => void) => void
  } | null
}

/** 将 fieldKey 映射到当前挂载的 FormItem，并提供校验、滚动和聚焦操作。 */
export function useConfigFormFieldLocator(options: ConfigFormFieldLocatorOptions) {
  const warnedReasons = new Set<string>()

  const warnOnce = (reason: string, message: string) => {
    if (!import.meta.env.DEV || warnedReasons.has(reason)) return
    warnedReasons.add(reason)
    console.warn(message)
  }

  const getMountedFields = () => {
    const container = options.getContainer()
    if (!container) return []
    return Array.from(
      container.querySelectorAll<HTMLElement>(`[${CONFIG_FORM_FIELD_PROP_ATTRIBUTE}]`)
    ).filter(element => element.closest(`[${CONFIG_FORM_ROOT_ATTRIBUTE}]`) === container)
  }

  const findFieldElementByFieldKey = (fieldKey: string) => getMountedFields().find(
    element => element.getAttribute(CONFIG_FORM_FIELD_PROP_ATTRIBUTE) === fieldKey
  )

  const resolveMountedField = (fieldKey: string) => {
    const element = findFieldElementByFieldKey(fieldKey)
    if (!element) {
      warnOnce(
        'field-unmounted',
        `[ConfigForm] Field "${fieldKey}" is not currently mounted (unknown fieldKey or hidden field).`
      )
    }
    return element
  }

  const findFocusable = (element: HTMLElement) => {
    if (element.matches(FOCUSABLE_SELECTOR)) return element
    return element.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) || undefined
  }

  const focusElement = (element: HTMLElement) => {
    const target = findFocusable(element)
    if (!target) return false
    target.focus()
    return document.activeElement === target
  }

  const validateField = (fieldProps: string | string[], callback?: (message: string) => void) => {
    const propPaths = Array.isArray(fieldProps) ? fieldProps : [fieldProps]
    return Promise.all(propPaths.map(propPath => new Promise<boolean>((resolve) => {
      // Element UI 对未知/未挂载 prop 不回调（旧版直接抛错），必须先确认已挂载，否则 Promise 永不 settle。
      if (!findFieldElementByFieldKey(propPath)) {
        warnOnce(
          'field-unmounted',
          `[ConfigForm] Field "${propPath}" is not currently mounted (unknown fieldKey or hidden field).`
        )
        resolve(false)
        return
      }
      try {
        options.getForm()?.validateField?.(propPath, (message: string) => {
          callback?.(message)
          resolve(!message)
        })
      } catch {
        resolve(false)
      }
    }))).then(results => results.every(Boolean))
  }

  const focusField = async (fieldKey: string) => {
    await nextTick()
    const element = resolveMountedField(fieldKey)
    return element ? focusElement(element) : false
  }

  const scrollToFirstError = async () => {
    await nextTick()
    const element = getMountedFields().find(field => field.classList.contains('is-error'))
    if (!element) return false
    element.scrollIntoView?.({ block: 'center', inline: 'nearest' })
    focusElement(element)
    return true
  }

  return {
    getMountedFields,
    findFieldElementByFieldKey,
    focusElement,
    validateField,
    focusField,
    scrollToFirstError
  }
}
