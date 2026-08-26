import { describe, expect, it } from 'vitest'
import ConfigFormDefault, {
  ConfigForm,
  createConfigForm,
  defineConfigFormType,
  defineConfigFormTypes,
  defineFormItems
} from '../index'

describe('public entry', () => {
  it('exports the component and generic component view', () => {
    expect(ConfigFormDefault).toBe(ConfigForm)
    expect(createConfigForm()).toBe(ConfigForm)
  })

  it('exports configuration helpers', () => {
    expect(defineFormItems([])).toEqual([])
    expect(typeof defineConfigFormType).toBe('function')
    expect(typeof defineConfigFormTypes).toBe('function')
  })
})
