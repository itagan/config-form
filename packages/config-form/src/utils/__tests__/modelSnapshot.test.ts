import { describe, expect, it } from 'vitest'
import { cloneFormModel } from '../modelSnapshot'

describe('cloneFormModel', () => {
  it('clones supported values while preserving cycles, aliases and null prototypes', () => {
    const shared = { value: 20 }
    const date = new Date('2026-08-31T00:00:00.000Z')
    const regexp = /name/g
    regexp.lastIndex = 2
    const dictionary = Object.assign(Object.create(null), { shared })
    const source: Record<string, any> = {
      date, dateAlias: date, regexp, regexpAlias: regexp,
      map: new Map([[shared, shared]]), set: new Set([shared]),
      dictionary, rows: [shared], sparse: new Array(3),
      specialKey: JSON.parse('{"__proto__":{"safe":true}}')
    }
    source.self = source
    source.map.set(source, source)
    source.set.add(source)

    const result = cloneFormModel(source)
    expect(result).not.toBe(source)
    expect(result.self).toBe(result)
    expect(result.date).not.toBe(date)
    expect(result.date.getTime()).toBe(date.getTime())
    expect(result.dateAlias).toBe(result.date)
    expect(result.regexp).not.toBe(regexp)
    expect(result.regexp.source).toBe(regexp.source)
    expect(result.regexp.flags).toBe('g')
    expect(result.regexp.lastIndex).toBe(2)
    expect(result.regexpAlias).toBe(result.regexp)
    expect(result.rows[0]).not.toBe(shared)
    expect(result.map.get(result.rows[0])).toBe(result.rows[0])
    expect(result.map.get(result)).toBe(result)
    expect(result.set.has(result.rows[0])).toBe(true)
    expect(result.set.has(result)).toBe(true)
    expect(Object.getPrototypeOf(result.dictionary)).toBeNull()
    expect(result.dictionary.shared).toBe(result.rows[0])
    expect(result.sparse).toHaveLength(3)
    expect(0 in result.sparse).toBe(false)
    expect(Object.getPrototypeOf(result.specialKey)).toBe(Object.prototype)
    expect(Object.prototype.hasOwnProperty.call(result.specialKey, '__proto__')).toBe(true)
    expect(result.specialKey.__proto__).toEqual({ safe: true })
  })

  it('preserves opaque objects and custom instances with usable internal state', () => {
    class Counter {
      #value = 1
      increment() { this.#value++ }
      read() { return this.#value }
    }
    class CustomMap extends Map {}
    const key = {}
    const source = {
      counter: new Counter(), customMap: new CustomMap().set(key, 1),
      blob: new Blob(['abc']), file: new File(['abc'], 'note.txt'),
      bytes: new Uint8Array([1, 2]), weakMap: new WeakMap([[key, 3]]),
      weakSet: new WeakSet([key]), node: document.createElement('span'),
      callback: () => 42
    }
    const result = cloneFormModel(source)
    for (const key of Object.keys(source) as Array<keyof typeof source>) {
      expect(result[key]).toBe(source[key])
    }
    source.counter.increment()
    expect(result.counter.read()).toBe(2)
    expect(result.customMap.get(key)).toBe(1)
    expect(result.blob.size).toBe(3)
    expect(result.file.name).toBe('note.txt')
    expect(result.bytes.byteLength).toBe(2)
    expect(result.weakMap.get(key)).toBe(3)
    expect(result.weakSet.has(key)).toBe(true)
    expect(result.node.tagName).toBe('SPAN')
    expect(result.callback()).toBe(42)
  })
})
