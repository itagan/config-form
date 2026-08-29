const MANAGED_TOOLTIP_PROPS = new Set([
  'content',
  'reference',
  'popper',
  'manual',
  'value',
  'enterable'
])

/** 归一化单例 Tooltip 属性，并保护 ConfigForm 自身管理的显隐和引用协议。 */
export function resolveHintTooltipProps(tooltipProps: Record<string, unknown>): Record<string, unknown> {
  const passthrough = Object.keys(tooltipProps).reduce<Record<string, unknown>>((result, key) => {
    if (!MANAGED_TOOLTIP_PROPS.has(key)) result[key] = tooltipProps[key]
    return result
  }, {})
  const customPopperClass = typeof passthrough.popperClass === 'string'
    ? passthrough.popperClass
    : ''

  return {
    placement: 'top',
    effect: 'dark',
    openDelay: 100,
    ...passthrough,
    popperClass: ['config-form-hint-tooltip', customPopperClass].filter(Boolean).join(' ')
  }
}
