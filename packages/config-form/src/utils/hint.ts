/** 事件委托使用的内部提示标记，不作为调用方配置入口。 */
export const CONFIG_FORM_HINT_ATTRIBUTE = 'data-config-form-hint'
/** 标识字段 Hint 是否仅由内容根节点触发。 */
export const CONFIG_FORM_HINT_TRIGGER_ATTRIBUTE = 'data-config-form-hint-trigger'
/** 为内容触发模式回退警告提供稳定的字段标识。 */
export const CONFIG_FORM_HINT_FIELD_ATTRIBUTE = 'data-config-form-hint-field'

/** Tooltip 模式下，自动 Hint 在渲染属性中取代同层 title，避免原生提示与 Tooltip 双重展示。 */
export function stripManagedHintTitle<T extends Record<string, unknown>>(sourceProps: T): T {
  const { title: _managed, ...rest } = sourceProps
  return rest as T
}
