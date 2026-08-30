import { describe, expect, it } from 'vitest'
import { cloneFormModel } from '../modelSnapshot'

describe('cloneFormModel', () => {
  it('clones nested values, dates, maps, sets and circular references', () => {
    class Currency {
      constructor(public code: string) {}
    }

    const source: Record<string, any> = {
      date: new Date('2026-08-31T00:00:00.000Z'),
      map: new Map([['amount', { value: 20 }]]),
      set: new Set([{ id: 1 }]),
      currency: new Currency('CNY'),
      rows: [{ name: 'Ada' }]
    }
    source.self = source

    const result = cloneFormModel(source)

    expect(result).not.toBe(source)
    expect(result.self).toBe(result)
    expect(result.date).not.toBe(source.date)
    expect(result.date.getTime()).toBe(source.date.getTime())
    expect(result.map.get('amount')).toEqual({ value: 20 })
    expect(result.map.get('amount')).not.toBe(source.map.get('amount'))
    expect([...result.set][0]).not.toBe([...source.set][0])
    expect(result.currency).toBeInstanceOf(Currency)
    expect(result.rows[0]).not.toBe(source.rows[0])
  })
})
