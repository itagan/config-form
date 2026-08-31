<template>
  <TypedConfigForm
    v-model="model"
    :items="items"
    :field-types="fieldTypes"
    @field-change="handleFieldChange"
  >
    <template #currencyPrefix="{ value }">
      <span>{{ value }}</span>
    </template>
  </TypedConfigForm>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  createConfigForm,
  defineConfigFormItems,
  defineConfigFormType,
  defineConfigFormTypes
} from '@itagan/config-form'
import type { ConfigFormFieldChangePayload } from '@itagan/config-form'

interface FormData {
  amount: number
  currency: string
  [key: string]: unknown
}

interface MoneyProps {
  currency: string
  precision?: number
}

interface MoneyEvents {
  change: [{ amount: number }]
}

const money = defineConfigFormType<FormData>()<MoneyProps, MoneyEvents>({
  is: 'el-input',
  props: ({ model }) => ({ currency: model.currency, precision: 2 }),
  model: { event: 'change', valueFromEvent: (_context, payload) => payload.amount }
})
const fieldTypes = defineConfigFormTypes<FormData>()({ money })
const TypedConfigForm = createConfigForm<FormData, typeof fieldTypes>()
const items = defineConfigFormItems<FormData, typeof fieldTypes>([
  {
    fieldKey: 'amount',
    type: 'money',
    leftSlot: 'currencyPrefix',
    component: { props: { currency: 'CNY', precision: 2 } }
  }
])
const model = ref<FormData>({ amount: 20, currency: 'CNY' })
const handleFieldChange = (_payload: ConfigFormFieldChangePayload) => undefined
</script>
