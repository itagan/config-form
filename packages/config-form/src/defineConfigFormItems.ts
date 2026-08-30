import type {
  EmptyFieldTypeRegistry,
  FieldTypeRegistry,
  FormItemConfig,
  FormModel
} from './types'

/** 为配置数组保留业务 model 与字段类型注册表的类型推导；运行时原样返回。 */
export function defineConfigFormItems<TModel extends FormModel = FormModel>(
  items: FormItemConfig<TModel>[]
): FormItemConfig<TModel>[]
export function defineConfigFormItems<
  TModel extends FormModel = FormModel,
  TFieldTypes extends FieldTypeRegistry<TModel> = EmptyFieldTypeRegistry
>(
  items: FormItemConfig<TModel, TFieldTypes>[]
): FormItemConfig<TModel, TFieldTypes>[]
export function defineConfigFormItems<
  TModel extends FormModel = FormModel,
  TFieldTypes extends FieldTypeRegistry<TModel> = EmptyFieldTypeRegistry
>(
  items: FormItemConfig<TModel, TFieldTypes>[]
): FormItemConfig<TModel, TFieldTypes>[] {
  return items
}
