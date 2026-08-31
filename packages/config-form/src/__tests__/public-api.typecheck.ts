import type { Component } from 'vue'
import {
  createConfigForm,
  defineConfigFormType,
  defineConfigFormTypes,
  defineConfigFormItems
} from '../index'
import type {
  ConfigFormExpose,
  ConfigFormEmits,
  ConfigFormFieldBindingContext,
  ConfigFormFormItemErrorSlotContext,
  ConfigFormProps,
  ConfigFormSlotContext,
  FormItemType
} from '../index'

interface BusinessModel {
  amount: number
  currency: string
  [key: string]: any
}

// @ts-expect-error internal resolved component config is not exported from the package entry
type RemovedResolvedComponentConfig = import('../index').ResolvedComponentConfig
// @ts-expect-error the instance type is named ConfigFormExpose
type RemovedConfigFormRef = import('../index').ConfigFormRef
// @ts-expect-error implementation helper is not exported from the package entry
type RemovedComponentProps = import('../index').ComponentProps
// @ts-expect-error component view is inferred through createConfigForm
type RemovedConfigFormComponent = import('../index').ConfigFormComponent
// @ts-expect-error base render context is an implementation detail
type RemovedConfigFormRenderContext = import('../index').ConfigFormRenderContext
// @ts-expect-error slot maps are inferred from the component
type RemovedConfigFormSlots = import('../index').ConfigFormSlots
// @ts-expect-error slot function helpers are inferred from the component
type RemovedConfigFormSlotFn = import('../index').ConfigFormSlotFn
// @ts-expect-error dynamic value helper is represented by public property signatures
type RemovedDynamicValue = import('../index').DynamicValue
// @ts-expect-error empty registry is the default generic and not a public annotation target
type RemovedEmptyFieldTypeRegistry = import('../index').EmptyFieldTypeRegistry
// @ts-expect-error typed definitions are inferred from defineConfigFormType
type RemovedTypedFieldTypeDefinition = import('../index').TypedFieldTypeDefinition
void (null as unknown as RemovedResolvedComponentConfig)
void (null as unknown as RemovedConfigFormRef)
void (null as unknown as RemovedComponentProps)
void (null as unknown as RemovedConfigFormComponent)
void (null as unknown as RemovedConfigFormRenderContext)
void (null as unknown as RemovedConfigFormSlots)
void (null as unknown as RemovedConfigFormSlotFn)
void (null as unknown as RemovedDynamicValue)
void (null as unknown as RemovedEmptyFieldTypeRegistry)
void (null as unknown as RemovedTypedFieldTypeDefinition)

interface MoneyProps {
  currency: string
  precision?: number
}

interface MoneyEvents {
  change: [{ amount: number }]
  blur: []
}

declare const MoneyInput: Component

const money = defineConfigFormType<BusinessModel>()<MoneyProps, MoneyEvents>({
  is: MoneyInput,
  props: ({ model }) => ({ currency: model.currency, precision: 2 }),
  model: { event: 'change' }
})

defineConfigFormTypes<BusinessModel>()({ money })

defineConfigFormType<BusinessModel>()<MoneyProps, MoneyEvents>({
  is: MoneyInput,
  // @ts-expect-error event name must be declared by MoneyEvents
  model: { event: 'input' }
})

defineConfigFormType<BusinessModel>()<MoneyProps, MoneyEvents>({
  is: MoneyInput,
  // @ts-expect-error unknown component prop
  props: { unknown: true }
})

defineConfigFormTypes<BusinessModel>()({
  // @ts-expect-error built-in names are reserved
  input: money
})

defineConfigFormType<BusinessModel>()<MoneyProps, MoneyEvents>({
  is: MoneyInput,
  model: {
    event: 'change',
    valueFromEvent: (context, next) => {
      const current = context.value as { amount: number }
      return { amount: next.amount + (current?.amount ?? 0) }
    }
  }
})

defineConfigFormType<BusinessModel>()<MoneyProps, MoneyEvents>({
  is: MoneyInput,
  model: {
    event: 'change',
    // @ts-expect-error change payload must match the declared event tuple
    valueFromEvent: (context, next: string) => next.length
  }
})

defineConfigFormType<BusinessModel>()<MoneyProps, MoneyEvents>({
  is: MoneyInput,
  model: {
    event: 'change',
    // @ts-expect-error event requires valueFromEvent context of the same model
    valueFromEvent: (context: { unrelated: true }, next: { amount: number }) => next.amount
  }
})

declare const moneyItems: [{ type: 'money' }]

void moneyItems

const narrowFieldTypes = defineConfigFormTypes<BusinessModel>()({ money })
const NarrowForm = createConfigForm<BusinessModel, typeof narrowFieldTypes>()
const narrowItems = defineConfigFormItems<BusinessModel, typeof narrowFieldTypes>([
  {
    fieldKey: 'amount',
    type: 'money',
    component: {
      props: { currency: 'USD' },
      model: { event: 'change', valueFromEvent: (_context, next: { amount: number }) => next.amount }
    }
  },
  { fieldKey: 'name', type: 'input', component: { props: { clearable: true } } }
])

declare const narrowRef: ConfigFormExpose
void NarrowForm
void narrowItems
void narrowRef

const narrowProps: ConfigFormProps<BusinessModel, typeof narrowFieldTypes> = {
  model: { amount: 20, currency: 'CNY' },
  items: narrowItems,
  fieldTypes: narrowFieldTypes
}
void narrowProps

// @ts-expect-error a non-empty registry makes fieldTypes required
const missingRegistryProps: ConfigFormProps<BusinessModel, typeof narrowFieldTypes> = {
  model: { amount: 20, currency: 'CNY' },
  items: narrowItems
}
void missingRegistryProps

declare const bindingContext: ConfigFormFieldBindingContext<BusinessModel>
declare const slotContext: ConfigFormSlotContext<BusinessModel>
declare const errorSlotContext: ConfigFormFormItemErrorSlotContext<BusinessModel>
declare const emits: ConfigFormEmits<BusinessModel>
void bindingContext.bindingValue
slotContext.setBindingValue(slotContext.bindingValue)
void errorSlotContext.error
emits['field-change']({ fieldKey: 'amount', value: 21, previousValue: 20 })

defineConfigFormItems<BusinessModel, typeof narrowFieldTypes>([
  // @ts-expect-error registered types cannot override the render target
  {
    fieldKey: 'amount',
    type: 'money',
    component: { is: MoneyInput }
  }
])

const strictItems: ConfigFormProps<BusinessModel>['items'] = [
  {
    fieldKey: 'name',
    type: 'input',
    leftSlot: 'currencyPrefix',
    rightSlot: 'amountSuffix',
    component: { props: { readonly: true } }
  }
]
void strictItems

const businessProps: ConfigFormProps<BusinessModel> = {
  model: { amount: 20, currency: 'CNY' },
  items: []
}
void businessProps

// @ts-expect-error model is required by the controlled component contract
const missingModelProps: ConfigFormProps<BusinessModel> = { items: [] }
// @ts-expect-error items are required by the schema-driven component contract
const missingItemsProps: ConfigFormProps<BusinessModel> = {
  model: { amount: 20, currency: 'CNY' }
}
void missingModelProps
void missingItemsProps

const builtinType: FormItemType = 'input'
// @ts-expect-error custom names only enter FormItemConfig through a typed field registry
const unknownStandaloneType: FormItemType = 'money'
void builtinType
void unknownStandaloneType

const strictUnknown: ConfigFormProps<BusinessModel>['items'] = [
  // @ts-expect-error unregistered types are rejected without a field type registry
  { fieldKey: 'amount', type: 'money' }
]
void strictUnknown

defineConfigFormItems<BusinessModel, typeof narrowFieldTypes>([
  // @ts-expect-error currency must match the registered props protocol
  {
    fieldKey: 'amount',
    type: 'money',
    component: {
      props: { currency: 42 }
    }
  }
])

defineConfigFormItems<BusinessModel, typeof narrowFieldTypes>([
  // @ts-expect-error blur declares an empty payload tuple
  {
    fieldKey: 'amount',
    type: 'money',
    component: {
      model: {
        event: 'blur',
        valueFromEvent: (_context: ConfigFormFieldBindingContext<BusinessModel>, next: { amount: number }) => next.amount
      }
    }
  }
])
