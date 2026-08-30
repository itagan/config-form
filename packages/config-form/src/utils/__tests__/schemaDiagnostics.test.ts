import { describe, expect, it } from 'vitest'
import { collectSchemaDiagnostics } from '../schemaDiagnostics'

describe('schema diagnostics', () => {
  it('reports unsupported static readonly strategies', () => {
    expect(collectSchemaDiagnostics({}, [{
      fieldKey: 'name',
      type: 'input',
      readonlyStrategy: 'locked'
    }])).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'readonly-strategy:name' })
    ]))
  })

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

  it('validates model protocol members on registrations', () => {
    const diagnostics = collectSchemaDiagnostics(
      {
        broken: { is: 'x', model: { prop: 1, event: true, valueToProp: 'no', valueFromEvent: 3 } },
        ok: { is: 'y', model: { prop: 'modelValue', event: 'change', valueToProp: () => 1, valueFromEvent: () => 2 } }
      },
      []
    )

    const messages = diagnostics.map(item => item.message)
    expect(messages).toEqual(expect.arrayContaining([
      expect.stringContaining('model.prop must be a string'),
      expect.stringContaining('model.event must be a string'),
      expect.stringContaining('model.valueToProp must be a synchronous function'),
      expect.stringContaining('model.valueFromEvent must be a synchronous function')
    ]))
    expect(diagnostics.some(item => item.key.endsWith(':ok'))).toBe(false)
  })

  it('lists available custom types when reporting unknown field types', () => {
    const withRegistry = collectSchemaDiagnostics(
      { money: { is: 'money-input' }, rating: { is: 'rating-input' } },
      [{ fieldKey: 'amount', type: 'price' }]
    )
    expect(withRegistry[0]?.message).toContain('Available custom types: "money", "rating"')

    const withoutRegistry = collectSchemaDiagnostics({}, [{ fieldKey: 'amount', type: 'price' }])
    expect(withoutRegistry[0]?.message).toContain('No custom field types are registered')
  })

  it('rejects item-level rendering overrides on registered custom types', () => {
    const diagnostics = collectSchemaDiagnostics(
      { money: { is: 'money-input' } },
      [
        { fieldKey: 'amount', type: 'money', component: { is: 'override', props: { currency: 'CNY' } } },
        { fieldKey: 'note', type: 'money', component: { slot: 'custom' } },
        { fieldKey: 'qty', type: 'money', component: { props: { precision: 2 } } }
      ]
    )

    const messages = diagnostics.map(item => item.message)
    expect(messages).toEqual(expect.arrayContaining([
      expect.stringContaining('Custom field type "money" cannot use component.is'),
      expect.stringContaining('Custom field type "money" cannot use component.slot')
    ]))
    expect(messages.some(message => message.includes('component.props'))).toBe(false)
  })
})
