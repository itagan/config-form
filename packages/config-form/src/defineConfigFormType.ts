import type {
  ComponentProps,
  FieldTypeDefinition,
  FieldTypeEventMap,
  FormModel,
  TypedFieldTypeDefinition
} from './types'

/** 为单个业务字段 type 声明组件 Props 与事件协议。 */
export function defineConfigFormType<TModel extends FormModel = FormModel>() {
  return <
    TProps extends object = ComponentProps,
    TEvents extends Record<keyof TEvents, unknown[]> = FieldTypeEventMap
  >(
    definition: FieldTypeDefinition<TModel, TProps, TEvents>
  ): TypedFieldTypeDefinition<TModel, TProps, TEvents> => (
    definition as TypedFieldTypeDefinition<TModel, TProps, TEvents>
  )
}
