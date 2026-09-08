import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHintTooltipTargetResolver } from '../composables/hintTooltipTargets'
import {
  CONFIG_FORM_HINT_ATTRIBUTE,
  CONFIG_FORM_HINT_TRIGGER_ATTRIBUTE
} from '../utils/hint'

const HINT_TARGET_SELECTOR = '.config-form__hint-target'

function buildFieldContainer(options: { trigger?: 'content' } = {}) {
  const container = document.createElement('div')
  container.setAttribute('data-config-form-root', '')
  container.innerHTML = `
    <div class="el-form-item"
      data-config-form-hint="含税金额"
      ${options.trigger ? `data-config-form-hint-trigger="${options.trigger}"` : ''}
      data-config-form-hint-field="amount"
    >
      <div class="el-form-item__content">
        <div class="config-form__field-row">
          <span class="config-form__field-row-side"><button id="side-button" type="button">￥</button></span>
          <span class="config-form__hint-target"><input id="main-input" /></span>
          <span class="config-form__field-row-side"><span id="side-unit">万元</span></span>
        </div>
      </div>
    </div>`
  document.body.appendChild(container)
  return container
}

describe('hintTooltipTargets with decorated field rows', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 30, width: 100, height: 30,
      toJSON: () => ({})
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('anchors tooltip positioning to the main content inside a decorated row', () => {
    const container = buildFieldContainer()
    const formItem = container.querySelector('.el-form-item') as HTMLElement
    const resolver = createHintTooltipTargetResolver(() => container)

    const anchor = resolver.resolveReferenceTarget(formItem)
    expect(anchor).toBe(container.querySelector(HINT_TARGET_SELECTOR))
  })

  it('keeps content trigger scoped to the main content, ignoring side decorations', () => {
    const container = buildFieldContainer({ trigger: 'content' })
    const resolver = createHintTooltipTargetResolver(() => container)
    const sideButton = container.querySelector('#side-button') as HTMLElement
    const mainInput = container.querySelector('#main-input') as HTMLElement

    expect(resolver.findHintTarget(sideButton)).toBeNull()
    expect(resolver.findHintTarget(mainInput)).toBe(
      container.querySelector('.el-form-item')
    )
  })

  it.each(['width', 'height'] as const)('rejects zero %s on the main content and recovers after resize', dimension => {
    const container = buildFieldContainer({ trigger: 'content' })
    const formItem = container.querySelector('.el-form-item') as HTMLElement
    const main = container.querySelector(HINT_TARGET_SELECTOR) as HTMLElement
    const resolver = createHintTooltipTargetResolver(() => container)
    const rect = main.getBoundingClientRect()
    const measure = vi.spyOn(main, 'getBoundingClientRect').mockReturnValue({ ...rect, [dimension]: 0 })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    expect(resolver.resolveReferenceTarget(formItem)).toBe(formItem)
    expect(resolver.resolveReferenceTarget(formItem)).toBe(formItem)
    expect(warn).toHaveBeenCalledTimes(1)
    measure.mockReturnValue(rect)
    expect(resolver.resolveReferenceTarget(formItem)).toBe(main)
  })

  it.each(['hidden', 'display', 'visibility'])('rejects a main content target hidden by %s', reason => {
    const container = buildFieldContainer()
    const formItem = container.querySelector('.el-form-item') as HTMLElement
    const main = container.querySelector(HINT_TARGET_SELECTOR) as HTMLElement
    if (reason === 'hidden') main.hidden = true
    else main.style[reason as 'display' | 'visibility'] = reason === 'display' ? 'none' : 'hidden'
    const resolver = createHintTooltipTargetResolver(() => container)
    expect(resolver.resolveReferenceTarget(formItem)).toBe(formItem)
  })

  it('rejects a zero-size direct root even when its child reports a size', () => {
    const container = buildFieldContainer()
    const formItem = container.querySelector('.el-form-item') as HTMLElement
    const row = container.querySelector('.config-form__field-row') as HTMLElement
    vi.spyOn(row, 'getBoundingClientRect').mockReturnValue({ ...row.getBoundingClientRect(), width: 0 })
    expect(createHintTooltipTargetResolver(() => container).resolveReferenceTarget(formItem)).toBe(formItem)
  })

  it('falls back to the whole form item when the content root is ambiguous', () => {
    const container = document.createElement('div')
    container.setAttribute('data-config-form-root', '')
    container.innerHTML = `
      <div class="el-form-item" ${CONFIG_FORM_HINT_ATTRIBUTE}="tip" ${CONFIG_FORM_HINT_TRIGGER_ATTRIBUTE}="content">
        <div class="el-form-item__content">
          <span class="config-form__field-row-side">a</span>
          <span class="config-form__field-row-side">b</span>
        </div>
      </div>`
    document.body.appendChild(container)
    const formItem = container.querySelector('.el-form-item') as HTMLElement
    const resolver = createHintTooltipTargetResolver(() => container)

    expect(resolver.resolveReferenceTarget(formItem)).toBe(formItem)
  })
})
