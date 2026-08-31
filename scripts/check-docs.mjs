import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const repositoryRoot = process.cwd()
const markdownFiles = []
const ignoredDirectories = new Set(['node_modules', 'dist', '.vitepress'])

function collectMarkdownFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) collectMarkdownFiles(target)
    else if (entry.name.endsWith('.md')) markdownFiles.push(target)
  }
}

for (const file of ['README.md', 'packages/config-form/README.md']) {
  markdownFiles.push(path.join(repositoryRoot, file))
}
collectMarkdownFiles(path.join(repositoryRoot, 'docs'))

const errors = []
const deprecatedPatterns = [
  { pattern: /<ConfigForm[\s\S]{0,240}:readonly=/g, description: '使用已移除的根级 readonly Prop' },
  { pattern: /<ConfigForm[\s\S]{0,240}:disabled=/g, description: '使用已移除的根级 disabled Prop' },
  { pattern: /根级 `disabled`、`readonly` 会作用于全部字段/g, description: '声明已移除的根级交互 Props' },
  { pattern: /（评估中）/g, description: '公共文档仍包含评估中标记' }
]
const markdownLinkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g

const customFieldTypesGuide = fs.readFileSync(path.join(repositoryRoot, 'docs/api/custom-field-types.md'), 'utf8')
for (const requiredSnippet of [
  'createConfigForm<FormData, typeof fieldTypes>()',
  'defineConfigFormItems<FormData, typeof fieldTypes>',
  '<TypedConfigForm :field-types="fieldTypes"'
]) {
  if (!customFieldTypesGuide.includes(requiredSnippet)) {
    errors.push(`docs/api/custom-field-types.md: 缺少可编译的自定义字段类型契约 ${requiredSnippet}`)
  }
}

const schemaDrivenGuide = fs.readFileSync(path.join(repositoryRoot, 'docs/examples/schema-driven.md'), 'utf8')
for (const requiredSnippet of [
  'parseRemoteFormSchema(remoteSchemaText',
  'components: componentRegistry',
  "slots: ['scoreLabel', 'scoreError']",
  '`listeners`、`model`、`is`、`resolveComponent`'
]) {
  if (!schemaDrivenGuide.includes(requiredSnippet)) {
    errors.push(`docs/examples/schema-driven.md: 缺少远程 Schema 安全边界说明 ${requiredSnippet}`)
  }
}

for (const file of markdownFiles) {
  const source = fs.readFileSync(file, 'utf8')
  const relativeFile = path.relative(repositoryRoot, file)

  for (const { pattern, description } of deprecatedPatterns) {
    if (pattern.test(source)) errors.push(`${relativeFile}: ${description}`)
    pattern.lastIndex = 0
  }

  for (const match of source.matchAll(markdownLinkPattern)) {
    const rawUrl = match[1].trim().replace(/^<|>$/g, '')
    if (/^(?:https?:|mailto:|#)/.test(rawUrl)) continue
    const targetPath = rawUrl.split(/[?#]/)[0]
    if (!targetPath) continue
    let target = targetPath.startsWith('/')
      ? path.join(repositoryRoot, 'docs', decodeURIComponent(targetPath.slice(1)))
      : path.resolve(path.dirname(file), decodeURIComponent(targetPath))
    if (targetPath.endsWith('/')) target = path.join(target, 'index.md')
    else if (!path.extname(target)) target += '.md'
    if (!fs.existsSync(target)) errors.push(`${relativeFile}: 相对链接不存在 ${rawUrl}`)
  }
}

if (errors.length) {
  console.error(`Documentation check failed:\n- ${errors.join('\n- ')}`)
  process.exit(1)
}

console.log(`Documentation check passed: ${markdownFiles.length} Markdown files.`)
