import { describe, expect, it } from 'vitest'
import { parseRemoteFormSchema, RemoteFormSchemaError } from '../parseRemoteFormSchema'

const localComponent = { name: 'MoneyInput' }

function parse(value: unknown) {
  return parseRemoteFormSchema(JSON.stringify(value), {
    components: { money: localComponent },
    slots: ['scoreLabel', 'amountPrefix']
  })
}

describe('parseRemoteFormSchema', () => {
  it('accepts declarative built-in fields and binds components through a local registry', () => {
    const items = parse([
      {
        fieldKey: 'name',
        type: 'input',
        labelSlot: 'scoreLabel',
        component: { props: { clearable: true } }
      },
      {
        fieldKey: 'budget',
        type: 'component',
        meta: { component: 'money' },
        component: { props: { currency: 'CNY' } }
      }
    ])

    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({ fieldKey: 'name', type: 'input' })
    const component = items[1].component as { resolveComponent: () => unknown }
    expect(component.resolveComponent()).toBe(localComponent)
  })

  it.each([
    ['unsafe field path', [{ fieldKey: '__proto__.polluted', type: 'input' }]],
    ['unknown field type', [{ fieldKey: 'price', type: 'money' }]],
    ['undeclared slot', [{ fieldKey: 'name', type: 'input', leftSlot: 'remoteAction' }]],
    ['remote listeners', [{ fieldKey: 'name', type: 'input', component: { listeners: { change: 'runCode' } } }]],
    ['remote model protocol', [{ fieldKey: 'name', type: 'input', component: { model: { event: 'change' } } }]],
    ['remote component target', [{ fieldKey: 'budget', type: 'component', meta: { component: 'money' }, component: { is: 'script' } }]],
    ['unknown local component', [{ fieldKey: 'budget', type: 'component', meta: { component: 'missing' }, component: {} }]]
  ])('rejects %s', (_name, schema) => {
    expect(() => parse(schema)).toThrow(RemoteFormSchemaError)
  })

  it('rejects forbidden object keys at any depth', () => {
    const source = '[{"fieldKey":"name","type":"input","component":{"props":{"__proto__":{"polluted":true}}}}]'
    expect(() => parseRemoteFormSchema(source)).toThrow(/forbidden key/)
  })

  it('rejects duplicate render identities and configured field limits', () => {
    expect(() => parse([
      { key: 'same', fieldKey: 'first', type: 'input' },
      { key: 'same', fieldKey: 'second', type: 'input' }
    ])).toThrow(/duplicates render identity/)

    expect(() => parseRemoteFormSchema(JSON.stringify([
      { fieldKey: 'first', type: 'input' },
      { fieldKey: 'second', type: 'input' }
    ]), { maxFields: 1 })).toThrow(/more than 1 fields/)
  })
})
