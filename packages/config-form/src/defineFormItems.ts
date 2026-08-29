import type {
  EmptyFieldTypeRegistry,
  FieldTypeRegistry,
  FormItemConfig,
  FormModel
} from './types'

/** 为配置数组保留业务 model 的类型推导；运行时原样返回传入数组。 */
export function defineFormItems<TModel extends FormModel = FormModel>(
  items: FormItemConfig<TModel>[]
): FormItemConfig<TModel>[]
/** 显式传入字段类型注册表（通常为 `typeof fieldTypes`），启用自定义 type 的组件配置收窄。 */
export function defineFormItems<
  TModel extends FormModel = FormModel,
  TFieldTypes extends FieldTypeRegistry<TModel> = EmptyFieldTypeRegistry
>(
  items: FormItemConfig<TModel, TFieldTypes>[]
): FormItemConfig<TModel, TFieldTypes>[]
export function defineFormItems<
  TModel extends FormModel = FormModel,
  TFieldTypes extends FieldTypeRegistry<TModel> = EmptyFieldTypeRegistry
>(
  items: FormItemConfig<TModel, TFieldTypes>[]
): FormItemConfig<TModel, TFieldTypes>[] {
  return items
}
