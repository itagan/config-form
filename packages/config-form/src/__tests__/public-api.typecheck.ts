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
