import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { execFileSync } from 'node:child_process'

const repositoryRoot = process.cwd()
const manifestPath = path.join(repositoryRoot, 'packages/config-form/package.json')
const changelogPath = path.join(repositoryRoot, 'CHANGELOG.md')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const changelog = fs.readFileSync(changelogPath, 'utf8')
const errors = []

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(manifest.version)) {
  errors.push(`package version 不是有效 SemVer：${manifest.version}`)
}
if (!changelog.includes(`## ${manifest.version} - `)) {
  errors.push(`CHANGELOG.md 缺少当前包版本 ${manifest.version}`)
}

for (const field of ['author', 'repository', 'homepage', 'bugs', 'publishConfig']) {
  if (!manifest[field]) errors.push(`package.json 缺少发布元数据 ${field}`)
}
if (manifest.publishConfig?.registry !== 'https://registry.npmjs.org/') {
  errors.push('publishConfig.registry 必须指向 npmjs.org')
}
if (manifest.publishConfig?.access !== 'public') {
  errors.push('作用域公开包必须配置 publishConfig.access=public')
}

const versionEntries = [...changelog.matchAll(/^## (\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?) - (\d{4}-\d{2}-\d{2})$/gm)]
const seen = new Set()
for (const [, version] of versionEntries) {
  if (seen.has(version)) errors.push(`CHANGELOG.md 存在重复版本 ${version}`)
  seen.add(version)
}

const releaseTags = execFileSync('git', ['tag', '--list', 'v*'], {
  cwd: repositoryRoot,
  encoding: 'utf8'
}).trim().split('\n').filter(Boolean)
for (const tag of releaseTags) {
  const version = tag.slice(1)
  if (!seen.has(version)) errors.push(`${tag} 在 CHANGELOG.md 中没有对应版本条目`)
}

const currentTag = `v${manifest.version}`
if (releaseTags.includes(currentTag)) {
  const taggedManifest = JSON.parse(execFileSync(
    'git',
    ['show', `${currentTag}:packages/config-form/package.json`],
    { cwd: repositoryRoot, encoding: 'utf8' }
  ))
  if (taggedManifest.version !== manifest.version) {
    errors.push(`${currentTag} 中的包版本与当前 package.json 不一致`)
  }
}

if (errors.length) {
  console.error(`Release metadata check failed:\n- ${errors.join('\n- ')}`)
  process.exit(1)
}

console.log(`Release metadata check passed: ${manifest.name}@${manifest.version}.`)
