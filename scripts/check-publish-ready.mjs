import fs from 'node:fs'
import process from 'node:process'

const changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
const unreleased = changelog.match(/^## Unreleased\s*([\s\S]*?)(?=^## |$)/m)?.[1].trim()

if (unreleased) {
  console.error('Publish blocked: CHANGELOG.md still contains Unreleased changes. Assign a new version before publishing.')
  process.exit(1)
}

console.log('Publish readiness check passed.')
