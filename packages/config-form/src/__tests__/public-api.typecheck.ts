import type { Component } from 'vue'
import {
  defineConfigFormType,
  defineConfigFormTypes
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
