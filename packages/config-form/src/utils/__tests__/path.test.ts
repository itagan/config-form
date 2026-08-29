import { describe, expect, it } from 'vitest'
import {
  applyPathPatch,
  getValueByPath,
  normalizePath,
  resolveValueByPath,
  setValueByPath
} from '../path'

describe('path utils', () => {
  it('normalizes bracket syntax and dot paths to segments', () => {
    expect(normalizePath('rows[0].name')).toEqual(['rows', '0', 'name'])
    expect(normalizePath('profile.name')).toEqual(['profile', 'name'])
    expect(normalizePath('')).toEqual([])
    expect(normalizePath('a..b')).toEqual(['a', 'b'])
  })

  it('rejects unsafe prototype-oriented segments', () => {
    expect(() => normalizePath('__proto__.polluted')).toThrow(TypeError)
    expect(() => normalizePath('a.constructor')).toThrow(TypeError)
    expect(() => setValueByPath({}, 'prototype.x', 1)).toThrow(TypeError)
  })

  it('resolves values and reports existence', () => {
    const source = { profile: { name: 'Ada' }, rows: [{ id: 1 }] }
    expect(resolveValueByPath(source, 'profile.name')).toEqual({ exists: true, value: 'Ada' })
    expect(resolveValueByPath(source, 'rows[0].id')).toEqual({ exists: true, value: 1 })
    expect(resolveValueByPath(source, 'profile.missing')).toEqual({ exists: false, value: undefined })
    expect(resolveValueByPath(source, '')).toEqual({ exists: false, value: source })
  })

  it('returns the source untouched for empty paths', () => {
    const source = { name: 'Ada' }
    expect(setValueByPath(source, '', 'Grace')).toBe(source)
    expect(applyPathPatch(source, { '': 'Grace' })).toBe(source)
  })

  it('creates intermediate objects and arrays along write paths', () => {
    expect(setValueByPath({}, 'a.b', 1)).toEqual({ a: { b: 1 } })
    expect(setValueByPath({}, 'rows.0.name', 'Ada')).toEqual({ rows: [{ name: 'Ada' }] })
    expect(setValueByPath({}, 'a[1].b', 2)).toEqual({ a: [undefined, { b: 2 }] })
  })

  it('copies existing containers on write without mutating the source', () => {
    const source = { tags: ['a', 'b'], profile: { name: 'Ada' } }
    const next = setValueByPath(source, 'tags.1', 'c')
    expect(next).toEqual({ tags: ['a', 'c'], profile: { name: 'Ada' } })
    expect(source.tags).toEqual(['a', 'b'])
    expect(next).not.toBe(source)

    const nested = setValueByPath(source, 'profile.name', 'Grace')
    expect(nested.profile).not.toBe(source.profile)
    expect(source.profile.name).toBe('Ada')
  })

  it('evicts the oldest entry when the path cache exceeds its limit', () => {
    expect(normalizePath('cached.first')).toEqual(['cached', 'first'])
    for (let index = 0; index < 600; index += 1) normalizePath(`cache-probe-${index}`)
    expect(normalizePath('cache-probe-599')).toEqual(['cache-probe-599'])
    expect(getValueByPath({ a: 1 }, 'a')).toBe(1)
  })

  it('applies patches sequentially over the latest result', () => {
    const next = applyPathPatch({ profile: { name: 'Ada' } }, {
      'profile.name': 'Grace',
      'profile.age': 36
    })
    expect(next).toEqual({ profile: { name: 'Grace', age: 36 } })
  })
})
