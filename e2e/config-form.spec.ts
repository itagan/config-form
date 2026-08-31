import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const field = (page: Page, fieldKey: string) => (
  page.locator(`[data-config-form-field-prop="${fieldKey}"]`)
)

test('validates, focuses and navigates fields in a real browser', async ({ page }) => {
  await page.goto('/#/interaction')

  const nameInput = field(page, 'name').locator('input')
  const phoneInput = field(page, 'phone').locator('input')
  await nameInput.focus()
  await nameInput.press('Enter')
  await expect(phoneInput).toBeFocused()

  await page.getByRole('button', { name: '校验并提交' }).click()
  await expect(field(page, 'name')).toHaveClass(/is-error/)
  await expect(nameInput).toBeFocused()
})

test('keeps decorated slots outside the field tooltip and focus target', async ({ page }) => {
  await page.goto('/#/adorn')

  const amountField = field(page, 'amount')
  const prefix = amountField.getByText('￥', { exact: true })
  const amountInput = amountField.locator('input')
  const main = amountField.locator('.config-form__field-row-main')

  const prefixBox = await prefix.boundingBox()
  const mainBox = await main.boundingBox()
  expect(prefixBox).not.toBeNull()
  expect(mainBox).not.toBeNull()
  expect(prefixBox!.x + prefixBox!.width).toBeLessThanOrEqual(mainBox!.x)

  await prefix.hover()
  await expect(page.locator('.el-tooltip__popper:visible')).toHaveCount(0)
  await amountInput.hover()
  await expect(page.locator('.el-tooltip__popper:visible')).toContainText('不含税金额，单位万元')

  await page.getByRole('button', { name: '聚焦关键词' }).click()
  await expect(field(page, 'keyword').locator('input')).toBeFocused()
})

test('updates dynamic fields and the controlled model', async ({ page }) => {
  await page.goto('/#/dynamic')

  await expect(field(page, 'budget')).toHaveCount(0)
  await page.getByText('加急', { exact: true }).click()
  await expect(field(page, 'budget')).toBeVisible()

  await page.getByRole('button', { name: '一键填充默认值' }).click()
  await expect(field(page, 'title').locator('input')).toHaveValue('季度巡检')
  await expect(field(page, 'owner.name').locator('input')).toHaveValue('Ada')
})
