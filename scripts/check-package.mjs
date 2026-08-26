import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'

const packageDir = resolve('packages/config-form')
const requiredFiles = [
  'dist/config-form.es.js',
  'dist/config-form.umd.cjs',
  'dist/style.css',
  'dist/types/public-types.d.ts',
  'README.md',
  'LICENSE'
]

const packed = spawnSync(
  'npm',
  ['pack', '--dry-run', '--json', '--ignore-scripts'],
  { cwd: packageDir, encoding: 'utf8' }
)
if (packed.status !== 0) {
  process.stderr.write(packed.stderr || packed.stdout)
  process.exit(packed.status || 1)
}

const result = JSON.parse(packed.stdout)[0]
const files = new Set(result.files.map(file => file.path))
for (const file of requiredFiles) {
  if (!files.has(file)) throw new Error(`Missing packed file: ${file}`)
}
for (const file of files) {
  if (file.startsWith('src/') || file.includes('__tests__') || file.includes('playground')) {
    throw new Error(`Unexpected packed file: ${file}`)
  }
}

function collectTextFiles(directory) {
  return readdirSync(directory).flatMap(name => {
    const path = resolve(directory, name)
    if (statSync(path).isDirectory()) return collectTextFiles(path)
    return /\.(?:js|cjs|ts|json|md|css)$/.test(name) ? [path] : []
  })
}

const publicFiles = [
  resolve(packageDir, 'package.json'),
  resolve(packageDir, 'README.md'),
  ...collectTextFiles(resolve(packageDir, 'dist'))
]
const legacyProduct = ['Easy', 'Form'].join('')
const legacySlug = ['easy', 'form'].join('-')
for (const file of publicFiles) {
  const content = readFileSync(file, 'utf8')
  if (content.includes(legacyProduct) || content.includes(legacySlug)) {
    throw new Error(`Legacy product name found in ${file}`)
  }
}

const esmEntry = await import(pathToFileURL(resolve(packageDir, 'dist/config-form.es.js')).href)
const cjsEntry = createRequire(import.meta.url)(resolve(packageDir, 'dist/config-form.umd.cjs'))
for (const [format, entry] of [['ESM', esmEntry], ['CommonJS', cjsEntry]]) {
  if (entry.default !== entry.ConfigForm || entry.createConfigForm() !== entry.ConfigForm) {
    throw new Error(`${format} public component exports are inconsistent.`)
  }
  for (const helper of ['defineFormItems', 'defineConfigFormType', 'defineConfigFormTypes']) {
    if (typeof entry[helper] !== 'function') throw new Error(`${format} entry is missing ${helper}.`)
  }
}

console.log(`Package check passed: ${result.files.length} files, ${result.size} bytes.`)
