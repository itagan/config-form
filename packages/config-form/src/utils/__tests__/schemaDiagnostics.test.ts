import { describe, expect, it } from 'vitest'
import { collectSchemaDiagnostics } from '../schemaDiagnostics'

describe('schema diagnostics', () => {
  it('reports invalid registrations, duplicate keys and missing render targets', () => {
    const diagnostics = collectSchemaDiagnostics(
      {
        input: { is: 'el-input' },
        broken: { is: '', listeners: {} }
      },
      [
        { fieldKey: 'name', type: 'input' },
        { fieldKey: 'name', type: 'component' },
        { fieldKey: 'custom', type: 'slot', component: { slot: '' } },
        { fieldKey: 'unknown', type: 'money' }
      ]
    )

    const messages = diagnostics.map(item => item.message)
    expect(messages).toEqual(expect.arrayContaining([
      expect.stringContaining('"input" is reserved'),
      expect.stringContaining('unsupported keys "listeners"'),
      expect.stringContaining('Duplicate render key "name"'),
      expect.stringContaining('requires component.is'),
      expect.stringContaining('requires a non-empty component.slot'),
      expect.stringContaining('Unknown field type "money"')
    ]))
  })

  it('accepts valid custom registrations and explicit unique item keys', () => {
    expect(collectSchemaDiagnostics(
      { money: { is: 'money-input', props: { currency: 'CNY' } } },
      [
        { key: 'price', fieldKey: 'amount', type: 'money' },
        { key: 'original-price', fieldKey: 'amount', type: 'money' }
      ]
    )).toEqual([])
  })
})
