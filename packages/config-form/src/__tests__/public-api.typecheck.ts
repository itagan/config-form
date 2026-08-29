import type { Component } from 'vue'
import {
  createConfigForm,
  defineConfigFormType,
  defineConfigFormTypes,
  defineFormItems
} from '../index'
import type {
  ConfigFormFieldRenderContext,
  ConfigFormProps,
  ConfigFormRef,
  EmptyFieldTypeRegistry
} from '../index'

interface BusinessModel {
  amount: number
  currency: string
  [key: string]: any
}

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
const narrowItems = defineFormItems<BusinessModel, typeof narrowFieldTypes>([
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

declare const narrowRef: ConfigFormRef
void NarrowForm
void narrowItems
void narrowRef

defineFormItems<BusinessModel, typeof narrowFieldTypes>([
  // @ts-expect-error registered types cannot override the render target
  {
    fieldKey: 'amount',
    type: 'money',
    component: { is: MoneyInput }
  }
])

const strictItems: ConfigFormProps<BusinessModel, EmptyFieldTypeRegistry>['items'] = [
  { fieldKey: 'name', type: 'input' }
]
void strictItems

const strictUnknown: ConfigFormProps<BusinessModel, EmptyFieldTypeRegistry>['items'] = [
  // @ts-expect-error unregistered types are rejected without a field type registry
  { fieldKey: 'amount', type: 'money' }
]
void strictUnknown

defineFormItems<BusinessModel, typeof narrowFieldTypes>([
  // @ts-expect-error currency must match the registered props protocol
  {
    fieldKey: 'amount',
    type: 'money',
    component: {
      props: { currency: 42 }
    }
  }
])

defineFormItems<BusinessModel, typeof narrowFieldTypes>([
  // @ts-expect-error blur declares an empty payload tuple
  {
    fieldKey: 'amount',
    type: 'money',
    component: {
      model: {
        event: 'blur',
        valueFromEvent: (_context: ConfigFormFieldRenderContext<BusinessModel>, next: { amount: number }) => next.amount
      }
    }
  }
])
