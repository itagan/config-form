import { isReservedType } from './utils/field'
import type { FieldTypeRegistry, FormModel, ReservedFormItemType } from './types'

type WithoutReservedNames = Partial<Record<ReservedFormItemType, never>>

/** 批量声明当前 ConfigForm 实例使用的业务字段类型注册表。 */
export function defineConfigFormTypes<TModel extends FormModel = FormModel>() {
  return <TTypes extends FieldTypeRegistry<TModel>>(
    types: TTypes & WithoutReservedNames
  ): TTypes => {
    const reservedName = Object.keys(types).find(isReservedType)
    if (reservedName) {
      throw new Error(`[ConfigForm] Field type "${reservedName}" is reserved and cannot be registered.`)
    }
    return types
  }
}
