import { describe, expect, it } from 'vitest'
import { createBindingPatch, resolveBindingValue } from '../binding'

describe('field binding', () => {
  it('maps nested model paths into an object component value', () => {
    const binding = {
      map: [
        { fieldPath: 'period.start', valuePath: 'range.start' },
        { fieldPath: 'period.end', valuePath: 'range.end' }
      ]
    }

    expect(resolveBindingValue({ period: { start: 1, end: 2 } }, binding)).toEqual({
      range: { start: 1, end: 2 }
    })
  })

  it('supports array roots, fallback values and null clearing', () => {
    const binding = {
      map: [
        { fieldPath: 'start', valuePath: '0' },
        { fieldPath: 'end', valuePath: '1', fallbackValue: [] }
      ]
    }

    expect(resolveBindingValue({ start: '09:00', end: '18:00' }, binding)).toEqual(['09:00', '18:00'])
    const fallbackPatch = createBindingPatch(binding, ['10:00'])
    expect(fallbackPatch).toEqual({ start: '10:00', end: [] })
    expect(fallbackPatch.end).not.toBe(binding.map[1].fallbackValue)
    expect(createBindingPatch(binding, null)).toEqual({ start: null, end: [] })
  })

  it('rejects empty, overlapping and mixed-root mappings', () => {
    expect(() => resolveBindingValue({}, { map: [] })).toThrow(/at least one entry/)
    expect(() => resolveBindingValue({}, {
      map: [
        { fieldPath: 'profile', valuePath: 'name' },
        { fieldPath: 'profile.name', valuePath: 'alias' }
      ]
    })).toThrow(/fieldPath values cannot overlap/)
    expect(() => resolveBindingValue({}, {
      map: [
        { fieldPath: 'start', valuePath: '0' },
        { fieldPath: 'end', valuePath: 'range.end' }
      ]
    })).toThrow(/cannot mix arrays and objects/)
  })
})
