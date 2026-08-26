import type { FieldTypeRegistry, FormItemConfig, FormModel } from './types'

/** 为配置数组保留业务 model 与自定义字段 type 的类型推导。 */
export function defineFormItems<
  TModel extends FormModel = FormModel,
  TFieldTypes extends FieldTypeRegistry<TModel> = FieldTypeRegistry<TModel>
>(items: FormItemConfig<TModel>[]): FormItemConfig<TModel>[] {
  return items
}
