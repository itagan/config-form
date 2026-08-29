import { describe, expect, it } from 'vitest'
import { resolveHintTooltipProps } from '../hintTooltipRuntime'

describe('hint tooltip runtime', () => {
  it('applies managed defaults and strips managed props from passthrough', () => {
    const resolved = resolveHintTooltipProps({
      content: '覆盖内容',
      manual: true,
      value: true,
      enterable: true,
      reference: {},
      popper: {},
      placement: 'bottom',
      effect: 'light'
    })

    expect(resolved).toMatchObject({
      placement: 'bottom',
      effect: 'light',
      openDelay: 100,
      popperClass: 'config-form-hint-tooltip'
    })
    expect(resolved).not.toHaveProperty('content')
    expect(resolved).not.toHaveProperty('manual')
    expect(resolved).not.toHaveProperty('value')
    expect(resolved).not.toHaveProperty('enterable')
    expect(resolved).not.toHaveProperty('reference')
    expect(resolved).not.toHaveProperty('popper')
  })

  it('merges custom popper classes with the internal class', () => {
    const resolved = resolveHintTooltipProps({ popperClass: 'business-tooltip' })
    expect(resolved.popperClass).toBe('config-form-hint-tooltip business-tooltip')
  })
})
